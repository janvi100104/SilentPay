'use client';

import { useWallet } from '@/providers/wallet-provider';

/**
 * Hook to get the current wallet address for forms.
 * Returns the connected wallet address or an empty string.
 */
export function useWalletAddress() {
  const { address, isConnected } = useWallet();
  return isConnected ? address || '' : '';
}

/**
 * Hook to check if wallet is connected and show appropriate messages.
 */
export function useWalletStatus() {
  const { address, isConnected, isConnecting, error } = useWallet();

  return {
    address,
    isConnected,
    isConnecting,
    error,
    isEmpty: !isConnected,
    displayName: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
  };
}
