/**
 * Deploy the payroll contract to the Midnight network.
 *
 * Usage:
 *   npx tsx src/midnight/deploy.ts [--network undeployed|preview|preprod]
 *
 * Reads wallet seed from .midnight-state.json, creates a wallet,
 * syncs it with the network, and deploys the compiled contract.
 */
import { WebSocket } from 'ws';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// Enable WebSocket for wallet sync
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = WebSocket;
}

// No global Map.prototype patches — they break WASM ledger FFI.
// Iterator incompatibilities are patched in the specific SDK files that need them.

import { resolveNetwork, getOrCreateSeed, getDeployment } from './network.js';
import { createWallet, persistWalletState } from './wallet.js';
import { deployPayrollContract, getWalletBalance } from '../services/midnight-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function waitForProofServer(url: string, maxRetries = 30): Promise<void> {
  const healthUrl = url.replace(/\/$/, '');
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${healthUrl}/health`);
      if (res.ok) return;
    } catch {
      // proof server might not have /health, try just connecting
    }
    // Also check if port is listening via a simple fetch
    try {
      const res = await fetch(healthUrl);
      if (res.status < 500) return;
    } catch {
      // not ready yet
    }
    process.stdout.write(`  Waiting for proof server... (${i + 1}/${maxRetries})\r`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  process.stdout.write('\n');
  throw new Error(`Proof server at ${url} not ready after ${maxRetries} retries`);
}

async function main() {
  const { network, config } = resolveNetwork();

  console.log(`\n🚀 Deploying payroll contract to: ${network}\n`);

  // 1. Check for existing deployment
  const existing = getDeployment(network);
  if (existing) {
    console.log(`  ⚠ Contract already deployed on ${network}:`);
    console.log(`    Address:     ${existing.address}`);
    console.log(`    Deployed at: ${existing.deployedAt}`);
    console.log(`    Deployer:    ${existing.deployer}\n`);
    console.log(`  Skipping deployment. Delete .midnight-state.json and run \`npm run clean\` to redeploy.`);
    process.exit(0);
  }

  // 2. Wait for proof server
  console.log('  📡 Checking proof server...');
  await waitForProofServer(config.proofServer);
  console.log('  ✅ Proof server ready\n');

  // 3. Create wallet and sync
  console.log('  👛 Creating wallet...');
  const seed = getOrCreateSeed(network);
  const walletCtx = await createWallet({ network, networkConfig: config, seed, restore: false });
  console.log('  📡 Syncing wallet with network (up to 5 min)...');
  const syncStart = Date.now();
  try {
    await Promise.race([
      walletCtx.wallet.waitForSyncedState().then(() => {
        console.log(`  ✅ Wallet synced in ${((Date.now() - syncStart) / 1000).toFixed(1)}s`);
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Wallet sync timeout (300s)')), 300_000)),
    ]);
  } catch (err: any) {
    // Shielded wallet sync may fail — non-fatal for deployment
    process.stdout.write(`\n  ⚠ Wallet sync warning: ${err?.message?.slice(0, 120) || 'unknown'} (continuing)\n`);
  }
  await persistWalletState(network, walletCtx);

  let balance;
  try {
    balance = await Promise.race([
      getWalletBalance(walletCtx),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Balance check timeout')), 30_000)),
    ]);
  } catch {
    balance = { tNight: 0n, dust: 0n };
    process.stdout.write('  ⚠ Could not read balance (continuing)\n');
  }
  console.log(`  💰 Wallet balance: tNIGHT=${balance.tNight}, DUST=${balance.dust}\n`);

  // 4. Deploy contract
  console.log('  📝 Deploying payroll contract...');
  const { contractAddress } = await deployPayrollContract(walletCtx, network);

  console.log(`\n  ✅ Contract deployed successfully!`);
  console.log(`     Address: ${contractAddress}`);
  console.log(`     Network: ${network}\n`);

  // 5. Persist wallet state
  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();

  console.log('  Done. Run `npm run dev` to start the app.\n');
}

main().catch(async (err) => {
  console.error('\n❌ Deploy failed:', err.message);
  if (err.stack) console.error(err.stack);
  if (err.message?.includes('ECONNREFUSED')) {
    console.error('   Make sure Docker is running and the devnet is up: docker compose up -d');
  }
  process.exit(1);
});
