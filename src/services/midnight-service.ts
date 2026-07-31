import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

// Midnight SDK imports
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from '../midnight/wallet';
import { resolveNetwork, getOrCreateSeed, getDeployment, recordDeployment, type NetworkId } from '../midnight/network';

// Enable WebSocket for GraphQL subscriptions
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = WebSocket;
}

const PRIVATE_STATE_ID = 'payrollPrivateState';

export interface MidnightProviders {
  privateStateProvider: ReturnType<typeof levelPrivateStateProvider>;
  publicDataProvider: ReturnType<typeof indexerPublicDataProvider>;
  zkConfigProvider: NodeZkConfigProvider<any>;
  proofProvider: ReturnType<typeof httpClientProofProvider>;
  walletProvider: any;
  midnightProvider: any;
}

export interface PayrollContract {
  callTx: {
    createPayroll: (id: string, employer: string, month: string, numEmployees: bigint) => Promise<any>;
    claimPayment: (employeeAddress: string) => Promise<any>;
  };
}

/**
 * Get the path to the compiled payroll contract
 */
function getContractPath(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(__dirname, '..', '..', 'contracts', 'managed', 'payroll');
}

/**
 * Load the compiled payroll contract
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadCompiledContract(witnesses?: Record<string, (...args: any[]) => any>) {
  const zkConfigPath = getContractPath();
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  
  if (!fs.existsSync(contractPath)) {
    throw new Error('Payroll contract not compiled! Run: npm run compile');
  }
  
  const PayrollContract = await import(pathToFileURL(contractPath).href);

  // build() creates a base CompiledContract, then we read its internal symbol
  // to inject witnesses and compiledAssetsPath directly — bypassing the
  // Effect pipe combinators whose conditional types resist dynamic imports.
  const base = CompiledContract.make('payroll', PayrollContract.Contract);
  // The internal ContextTypeId is set by `make`; we copy all properties from
  // the prototype's pipe-produced result shape.
  const ctxKey = Object.getOwnPropertySymbols(base).find(
    (s) => s.toString() !== Symbol.for('compact-js/CompiledContract').toString(),
  );
  if (!ctxKey) {
    throw new Error('Failed to locate internal context symbol on CompiledContract');
  }

  const result = Object.create(Object.getPrototypeOf(base));
  // Copy tag and internal context
  result.tag = base.tag;
  result[ctxKey] = {
    ctor: PayrollContract.Contract,
    witnesses: witnesses ?? {},
    compiledAssetsPath: zkConfigPath,
  };
  return result;
}

/**
 * Create Midnight providers for interacting with the blockchain
 */
export async function createProviders(walletCtx: WalletContext): Promise<MidnightProviders> {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';
  const { network, config: networkConfig } = resolveNetwork();
  
  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigPath = getContractPath();
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'payroll-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

/**
 * Deploy the payroll contract to the network
 */
export async function deployPayrollContract(
  walletCtx: WalletContext,
  network: NetworkId,
  allocations?: Record<string, bigint>,
): Promise<{ contractAddress: string; providers: MidnightProviders }> {
  const providers = await createProviders(walletCtx);

  // Allocations map maintained by the employer (off-chain private state)
  const privateAllocations = allocations ?? {};

  // Witnesses provide private state access to the contract
  const witnesses = {
    getAllocation: (_ctx: any, employeeAddress: string): [any, bigint] => {
      return [_ctx.privateState, privateAllocations[employeeAddress] ?? 0n];
    },
    markClaimed: (_ctx: any, employeeAddress: string): [any, []] => {
      privateAllocations[employeeAddress] = 0n;
      return [_ctx.privateState, []];
    },
  };

  const compiledContract = await loadCompiledContract(witnesses);

  // initialPrivateState is the actual private state data (not witnesses)
  const initialPrivateState = { allocations: privateAllocations };

  const deployed = await deployContract(providers, {
    compiledContract: compiledContract as any,
    args: [],
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState,
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  recordDeployment(network, contractAddress, walletCtx.unshieldedKeystore.getBech32Address().toString());
  
  return { contractAddress, providers };
}

/**
 * Connect to an existing payroll contract
 */
export async function connectToPayrollContract(
  walletCtx: WalletContext,
  contractAddress: string,
  allocations?: Record<string, bigint>,
): Promise<{ contract: PayrollContract; providers: MidnightProviders }> {
  const providers = await createProviders(walletCtx);

  const privateAllocations = allocations ?? {};

  const witnesses = {
    getAllocation: (_ctx: any, employeeAddress: string): [any, bigint] => {
      return [_ctx.privateState, privateAllocations[employeeAddress] ?? 0n];
    },
    markClaimed: (_ctx: any, employeeAddress: string): [any, []] => {
      privateAllocations[employeeAddress] = 0n;
      return [_ctx.privateState, []];
    },
  };

  const compiledContract = await loadCompiledContract(witnesses);

  const contract = await findDeployedContract(providers, {
    compiledContract: compiledContract as any,
    contractAddress,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: { allocations: privateAllocations },
  }) as unknown as PayrollContract;

  return { contract, providers };
}

/**
 * Get the current wallet balance
 */
export async function getWalletBalance(walletCtx: WalletContext): Promise<{
  tNight: bigint;
  dust: bigint;
}> {
  const state = await walletCtx.wallet.waitForSyncedState();
  return {
    tNight: state.unshielded.balances[unshieldedToken().raw] ?? 0n,
    dust: state.dust.balance(new Date()),
  };
}

/**
 * Create a wallet context from environment or state
 */
export async function createWalletContext(): Promise<WalletContext> {
  const network = resolveNetwork().network;
  const seed = getOrCreateSeed(network);
  return createWallet({ network, networkConfig: resolveNetwork().config, seed });
}
