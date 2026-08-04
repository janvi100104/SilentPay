'use client';

import { useState } from 'react';
import { ClaimForm } from '@/features/claims/claim-form';
import { ClaimHistory } from '@/features/claims/claim-history';
import { AvailableClaims } from '@/features/claims/available-claims';
import { useWalletAddress } from '@/hooks/use-wallet';

export default function ClaimsPage() {
  const walletAddress = useWalletAddress();
  const [manualAddress, setManualAddress] = useState('');
  const [activeTab, setActiveTab] = useState<'claim' | 'history'>('claim');
  const [refreshKey, setRefreshKey] = useState(0);

  // Use connected wallet address or manual input — ensure plain string
  const rawAddress = walletAddress || manualAddress;
  const activeAddress = typeof rawAddress === 'string' ? rawAddress : String(rawAddress || '');

  const handleClaim = async (payrollId: string) => {
    if (!activeAddress) return;

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: activeAddress,
          payrollId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to claim payment');
        return;
      }

      // Refresh both lists and switch to history tab so user can see the claim
      setRefreshKey((k) => k + 1);
      setActiveTab('history');
    } catch (err) {
      alert('Failed to process claim. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Claims</h1>
        <p className="text-muted-foreground">
          View and claim your payments
        </p>
      </div>

      {!walletAddress && (
        <div className="card p-6">
          <label className="label">Your Wallet Address</label>
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="input max-w-md"
            placeholder="Enter your wallet address to view claims"
          />
        </div>
      )}

      {walletAddress && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
          <div className="w-2 h-2 bg-success rounded-full" />
          <span className="text-sm">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
      )}

      {activeAddress && (
        <>
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('claim')}
              className={`pb-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'claim'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Claim Payment
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Claim History
            </button>
          </div>

          {activeTab === 'claim' ? (
            <div className="grid gap-6 md:grid-cols-2">
              <AvailableClaims
                key={refreshKey}
                walletAddress={activeAddress}
                onClaim={handleClaim}
              />
              <ClaimForm initialWalletAddress={activeAddress} onClaimSuccess={() => {
                setRefreshKey((k) => k + 1);
                setActiveTab('history');
              }} />
            </div>
          ) : (
            <ClaimHistory key={refreshKey} walletAddress={activeAddress} />
          )}
        </>
      )}
    </div>
  );
}
