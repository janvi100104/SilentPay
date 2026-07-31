'use client';

import { useWallet } from '@/providers/wallet-provider';

function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const { address, isConnected, isConnecting, error, connect, disconnect } =
    useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
          <div className="w-2 h-2 bg-success rounded-full" />
          <span className="text-sm font-medium">{formatAddress(address)}</span>
        </div>
        <button onClick={disconnect} className="btn-secondary text-sm">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        disabled={isConnecting}
        className="btn-primary"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <span className="text-xs text-destructive max-w-48 text-right">
          {error}
        </span>
      )}
    </div>
  );
}
