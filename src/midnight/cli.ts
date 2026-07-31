/**
 * Interactive CLI for SilentPay Midnight operations.
 *
 * Usage:
 *   npx tsx src/midnight/cli.ts
 *
 * Commands:
 *   status      — Show network and deployment status
 *   balance     — Check wallet balance
 *   deploy      — Deploy payroll contract
 *   switch      — Switch network
 *   clean       — Reset all local state
 */
import { WebSocket } from 'ws';
import * as readline from 'node:readline';

if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = WebSocket;
}

import {
  resolveNetwork,
  getOrCreateSeed,
  getDeployment,
  setActiveNetwork,
  NETWORK_IDS,
  type NetworkId,
} from './network.js';
import { createWallet, persistWalletState } from './wallet.js';
import { getWalletBalance, deployPayrollContract } from '../services/midnight-service.js';
import { execSync } from 'node:child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function showStatus() {
  const { network, config, source } = resolveNetwork();
  const deployment = getDeployment(network);

  console.log(`\n📊 Status`);
  console.log(`   Network:  ${network} (source: ${source})`);
  console.log(`   Node:     ${config.node}`);
  console.log(`   Indexer:  ${config.indexer}`);
  console.log(`   Prover:   ${config.proofServer}`);

  if (deployment) {
    console.log(`\n   📝 Deployment:`);
    console.log(`      Address:     ${deployment.address}`);
    console.log(`      Deployed at: ${deployment.deployedAt}`);
    console.log(`      Deployer:    ${deployment.deployer}`);
  } else {
    console.log(`\n   ⚠ No deployment found for ${network}`);
  }
  console.log('');
}

async function showBalance() {
  const { network, config } = resolveNetwork();
  const seed = getOrCreateSeed(network);

  console.log(`\n💰 Fetching balance on ${network}...`);
  const walletCtx = await createWallet({ network, networkConfig: config, seed });
  await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);

  const balance = await getWalletBalance(walletCtx);
  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();

  console.log(`   Address:  ${address}`);
  console.log(`   tNIGHT:   ${balance.tNight}`);
  console.log(`   DUST:     ${balance.dust}`);

  await walletCtx.wallet.stop();
}

async function doDeploy() {
  const { network, config } = resolveNetwork();
  const existing = getDeployment(network);

  if (existing) {
    console.log(`\n⚠ Contract already deployed on ${network}`);
    console.log(`  Address: ${existing.address}`);
    return;
  }

  console.log(`\n🚀 Deploying to ${network}...`);
  const seed = getOrCreateSeed(network);
  const walletCtx = await createWallet({ network, networkConfig: config, seed, restore: false });
  await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);

  const { contractAddress } = await deployPayrollContract(walletCtx, network);
  console.log(`\n✅ Deployed! Address: ${contractAddress}`);

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
}

function doClean() {
  console.log('\n🧹 Cleaning local state...');
  try {
    execSync('docker compose down -v', { cwd: process.cwd(), stdio: 'inherit' });
  } catch {
    console.log('  (Docker not running or already clean)');
  }
  try {
    execSync('rm -rf contracts/managed .midnight-state.json .midnight-wallet-state midnight-level-db', {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
  } catch {
    // ignore
  }
  console.log('  ✅ Clean complete\n');
}

function showHelp() {
  console.log(`
Commands:
  status    — Show network and deployment info
  balance   — Check wallet tNIGHT and DUST balance
  deploy    — Deploy the payroll contract
  switch    — Switch to a different network
  clean     — Reset all local state (Docker + files)
  help      — Show this help
  exit      — Quit
`);
}

async function switchNetwork() {
  console.log(`\nAvailable networks: ${NETWORK_IDS.join(', ')}`);
  const input = await ask('Switch to: ');
  const target = input.trim() as NetworkId;

  if (!NETWORK_IDS.includes(target)) {
    console.log(`  ❌ Unknown network: ${target}`);
    return;
  }

  setActiveNetwork(target);
  console.log(`  ✅ Switched to: ${target}`);

  if (target !== 'undeployed') {
    const dep = getDeployment(target);
    if (!dep) {
      console.log(`  ⚠ No deployment on ${target}. Run 'deploy' to deploy.`);
    }
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   SilentPay — Midnight CLI               ║');
  console.log('╚══════════════════════════════════════════╝');
  showHelp();

  while (true) {
    const input = await ask('silentpay> ');
    const cmd = input.trim().toLowerCase();

    switch (cmd) {
      case 'status':
        await showStatus();
        break;
      case 'balance':
        await showBalance();
        break;
      case 'deploy':
        await doDeploy();
        break;
      case 'switch':
        await switchNetwork();
        break;
      case 'clean':
        doClean();
        break;
      case 'help':
        showHelp();
        break;
      case 'exit':
      case 'quit':
      case 'q':
        rl.close();
        process.exit(0);
        break;
      default:
        if (cmd) console.log(`  Unknown command: ${cmd}. Type 'help' for commands.`);
    }
  }
}

main().catch(async (err) => {
  console.error('\n❌ Error:', err.message);
  rl.close();
  process.exit(1);
});
