'use client';

import { useState, useEffect } from 'react';
import { Claim } from '@/types/claim';

interface AvailableClaimsProps {
  walletAddress: string;
  onClaim: (payrollId: string) => void;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function AvailableClaims({ walletAddress, onClaim }: AvailableClaimsProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableClaims();
  }, [walletAddress]);

  const fetchAvailableClaims = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ walletAddress, status: 'NOT_CLAIMED' });
      const response = await fetch(`/api/claim?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch available claims');
      }
      
      const data = await response.json();
      setClaims(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Available Payments</h3>
        <div className="text-center text-muted-foreground py-8">
          Loading available payments...
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Available Payments</h3>
        <span className="badge badge-success">{claims.length} Pending</span>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      {claims.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No pending payments. Connect your wallet to see available claims.
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <div className="font-medium">{claim.payroll.title}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(claim.payroll.payrollMonth)}
                </div>
              </div>
              <button
                onClick={() => onClaim(claim.payroll.id)}
                className="btn-primary text-sm"
              >
                Claim
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
