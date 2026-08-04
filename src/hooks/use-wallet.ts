'use client';

import { useWallet } from '@/providers/wallet-provider';

export function useWalletAddress() {
  const { address, isConnected } = useWallet();
  if (!isConnected || !address) return '';
  return address;
}

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
