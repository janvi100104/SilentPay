/**
 * Midnight Network wallet address validation.
 *
 * Midnight uses Bech32m encoding with these address types:
 *
 *   Unshielded (payment):  mn_addr[_network]1...
 *   Shielded:              mn_shield-addr[_network]1...
 *   DUST:                  mn_dust[_network]1...
 *
 * Network suffixes: preprod, preview, undeployed, test, testing-env, dev
 * (omitted for mainnet).
 *
 * We do a loose structural check (prefix + minimum length + bech32m chars)
 * rather than a full decode, because the Midnight SDK handles cryptographic
 * validation at transaction time.
 */

/** Minimum length — prefix + separator '1' + some data. */
const MIN_LENGTH = 12;

/** Maximum length — generous upper bound. */
const MAX_LENGTH = 150;

/**
 * Returns `true` when `address` looks like a plausible Midnight bech32m
 * address.  Does NOT perform full cryptographic decode.
 */
export function isValidWalletAddress(address: string): boolean {
  if (typeof address !== 'string') return false;

  const trimmed = address.trim();
  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) return false;

  // Must be lowercase (bech32m convention)
  const lower = trimmed.toLowerCase();
  if (lower !== trimmed) return false;

  // Must start with mn_ (Midnight identifier)
  if (!lower.startsWith('mn_')) return false;

  // Must contain the bech32m separator '1' after the prefix
  const separatorIdx = lower.indexOf('1');
  if (separatorIdx < 3) return false; // need at least "mn_1" which is still too short

  // After the first '1', must have bech32m data characters
  // Bech32m charset: qpzry9x8gf2tvdw0s3jn54khce6mua7l
  const dataPart = lower.slice(separatorIdx + 1);
  if (dataPart.length === 0) return false;

  const bech32mChars = /^[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/;
  return bech32mChars.test(dataPart);
}

/**
 * Human-readable error message for an invalid wallet address.
 * Returns `null` when the address is valid.
 */
export function walletAddressError(address: string): string | null {
  if (!address || address.trim().length === 0) {
    return 'Wallet address is required';
  }
  const trimmed = address.trim();
  if (trimmed !== trimmed.toLowerCase()) {
    return 'Wallet address must be lowercase';
  }
  if (trimmed.length < MIN_LENGTH) {
    return 'Wallet address is too short';
  }
  if (trimmed.length > MAX_LENGTH) {
    return 'Wallet address is too long';
  }
  if (!trimmed.startsWith('mn_')) {
    return 'Midnight wallet address must start with mn_';
  }
  return null;
}
