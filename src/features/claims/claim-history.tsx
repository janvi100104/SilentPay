'use client';

import { useState, useEffect } from 'react';
import { Claim } from '@/types/claim';

interface ClaimHistoryProps {
  walletAddress: string;
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    NOT_CLAIMED: 'badge-warning',
    CLAIMED: 'badge-success',
    EXPIRED: 'badge-destructive',
  };
  return styles[status] || 'badge-secondary';
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ClaimHistory({ walletAddress }: ClaimHistoryProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClaims();
  }, [walletAddress]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ walletAddress });
      const response = await fetch(`/api/claim?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch claims');
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
        <h3 className="text-lg font-semibold mb-4">Claim History</h3>
        <div className="text-center text-muted-foreground py-8">
          Loading claim history...
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Claim History</h3>
        <span className="badge badge-secondary">{claims.length} Claims</span>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      {claims.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No claim history yet. Your claimed payments will appear here.
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
              <div className="text-right">
                <span className={`badge ${getStatusBadge(claim.claimStatus)}`}>
                  {claim.claimStatus.replace('_', ' ')}
                </span>
                {claim.claimedAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(claim.claimedAt)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
