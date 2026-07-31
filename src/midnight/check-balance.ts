/**
 * Check wallet balance on the Midnight network.
 *
 * Usage:
 *   npx tsx src/midnight/check-balance.ts [--network undeployed|preview|preprod]
 */
import { WebSocket } from 'ws';

if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = WebSocket;
}

import { resolveNetwork, getOrCreateSeed } from './network.js';
import { createWallet, persistWalletState } from './wallet.js';
import { getWalletBalance } from '../services/midnight-service.js';

async function main() {
  const { network, config } = resolveNetwork();

  console.log(`\n💰 Checking wallet balance on: ${network}\n`);

  const seed = getOrCreateSeed(network);
  const walletCtx = await createWallet({ network, networkConfig: config, seed });

  console.log('  📡 Syncing wallet...');
  await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);

  const balance = await getWalletBalance(walletCtx);

  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  console.log(`\n  Wallet address: ${address}`);
  console.log(`  tNIGHT balance: ${balance.tNight}`);
  console.log(`  DUST balance:   ${balance.dust}\n`);

  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
