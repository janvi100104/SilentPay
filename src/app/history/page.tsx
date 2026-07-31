'use client';

import { useState, useEffect } from 'react';
import { useWalletAddress } from '@/hooks/use-wallet';
import { useCompany } from '@/hooks/use-company';

interface HistoryEntry {
  id: string;
  type: 'payroll' | 'claim';
  title: string;
  status: string;
  date: string;
  contractAddress?: string | null;
  midnightReference?: string | null;
  proofVerified?: boolean;
}

const DEMO_COMPANY_ID_FALLBACK = '00000000-0000-0000-0000-000000000001';

export default function HistoryPage() {
  const walletAddress = useWalletAddress();
  const { companyId: fetchedCompanyId } = useCompany();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'payroll' | 'claim'>('all');

  const companyId = fetchedCompanyId || DEMO_COMPANY_ID_FALLBACK;

  useEffect(() => {
    if (companyId) {
      fetchHistory();
    }
  }, [companyId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      // Fetch payrolls as employer
      const payrollRes = await fetch(`/api/payroll?companyId=${companyId}`);
      const payrolls = payrollRes.ok ? await payrollRes.json() : [];

      // Fetch claims as employee (only if wallet is connected)
      let claims: any[] = [];
      if (walletAddress) {
        const claimRes = await fetch(`/api/claim?walletAddress=${encodeURIComponent(walletAddress)}`);
        claims = claimRes.ok ? await claimRes.json() : [];
      }

      const entries: HistoryEntry[] = [
        ...payrolls.map((p: any) => ({
          id: p.id,
          type: 'payroll' as const,
          title: p.title,
          status: p.status,
          date: p.createdAt,
          contractAddress: p.contractAddress,
        })),
        ...claims.map((c: any) => ({
          id: c.id,
          type: 'claim' as const,
          title: c.payroll?.title || 'Payroll Claim',
          status: c.claimStatus,
          date: c.claimedAt || c.createdAt,
          midnightReference: c.midnightReference,
          proofVerified: c.proofVerified,
        })),
      ];

      // Sort by date descending
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(entries);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? history : history.filter((e) => e.type === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY':
      case 'COMPLETED':
      case 'CLAIMED':
        return <span className="badge badge-success">{status}</span>;
      case 'PROCESSING':
        return <span className="badge badge-warning">{status}</span>;
      case 'DRAFT':
      case 'NOT_CLAIMED':
        return <span className="badge badge-muted">{status}</span>;
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED':
        return <span className="badge badge-destructive">{status}</span>;
      default:
        return <span className="badge badge-muted">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground">Loading history...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-48 mb-2" />
              <div className="h-3 bg-muted rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground">
          Payroll and claim activity over time
        </p>
      </div>

      <div className="flex gap-2">
        {(['all', 'payroll', 'claim'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {f === 'all' ? 'All' : f === 'payroll' ? 'Payrolls' : 'Claims'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-muted-foreground">
          No history entries found. Create payrolls or claim payments to see activity here.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <div key={entry.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{entry.type === 'payroll' ? '💰' : '✅'}</span>
                  <div>
                    <div className="font-medium">{entry.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.type === 'payroll' ? 'Payroll Created' : 'Payment Claimed'}
                      {' · '}
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {entry.proofVerified && (
                    <span className="text-xs text-success">✓ On-chain verified</span>
                  )}
                  {getStatusBadge(entry.status)}
                </div>
              </div>
              {entry.contractAddress && (
                <div className="mt-2 text-xs text-muted-foreground font-mono">
                  Contract: {entry.contractAddress.slice(0, 12)}...{entry.contractAddress.slice(-8)}
                </div>
              )}
              {entry.midnightReference && (
                <div className="mt-1 text-xs text-muted-foreground font-mono">
                  Ref: {entry.midnightReference}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
