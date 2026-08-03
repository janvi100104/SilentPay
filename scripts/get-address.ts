/**
 * Quick script to get the wallet address for funding.
 * Skips full sync — just derives the address from the seed.
 */
import { Buffer } from 'buffer';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  HDWallet,
  Roles,
  createKeystore,
} from '@midnight-ntwrk/wallet-sdk';
import { resolveNetwork, getOrCreateSeed } from '../src/midnight/network.js';

const { network, config } = resolveNetwork();
setNetworkId(config.networkId);

const seed = getOrCreateSeed(network);

const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
const result = hdWallet.hdWallet
  .selectAccount(0)
  .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
  .deriveKeysAt(0);
if (result.type !== 'keysDerived') throw new Error('Key derivation failed');

const networkId = getNetworkId();
const unshieldedKeystore = createKeystore(result.keys[Roles.NightExternal], networkId);
const address = unshieldedKeystore.getBech32Address().toString();

console.log(`\nNetwork: ${network}`);
console.log(`Wallet address: ${address}`);
console.log(`\nFund this address at: https://faucet.preview.midnight.network/\n`);
