'use client';

import { useWallet } from '@/providers/wallet-provider';

export function WalletInfo() {
  const { address, isConnected, networkId } = useWallet();

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="card p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Address</span>
          <span className="font-mono text-sm">{address.slice(0, 10)}...{address.slice(-6)}</span>
        </div>
        {networkId && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network</span>
            <span className="text-sm font-medium">{networkId}</span>
          </div>
        )}
      </div>
    </div>
  );
}
