'use client';

import { useState, useEffect } from 'react';

interface CompanyClaim {
  id: string;
  payrollId: string;
  employeeId: string;
  amount: number | null;
  claimStatus: string;
  claimedAt: string | null;
  midnightReference: string | null;
  proofVerified: boolean;
  payroll: {
    id: string;
    title: string;
    payrollMonth: string;
    status: string;
    employeeCount: number;
    claimedCount: number;
  };
  employee: {
    id: string;
    fullName: string;
    walletAddress: string;
  };
}

interface EmployerClaimsProps {
  companyId: string;
  refreshKey?: number;
}

export function EmployerClaims({ companyId, refreshKey = 0 }: EmployerClaimsProps) {
  const [claims, setClaims] = useState<CompanyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'CLAIMED' | 'NOT_CLAIMED'>('all');

  useEffect(() => {
    fetchClaims();
  }, [companyId, refreshKey]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ companyId });
      const response = await fetch(`/api/claim?${params}`);
      if (response.ok) {
        setClaims(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? claims : claims.filter((c) => c.claimStatus === filter);

  // Group by payroll
  const payrollGroups = filtered.reduce((acc, claim) => {
    const key = claim.payrollId;
    if (!acc[key]) {
      acc[key] = {
        payroll: claim.payroll,
        claims: [],
      };
    }
    acc[key].claims.push(claim);
    return acc;
  }, {} as Record<string, { payroll: CompanyClaim['payroll']; claims: CompanyClaim[] }>);

  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Employee Claims</h3>
        <div className="text-center text-muted-foreground py-8">Loading claims...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Employee Claims</h3>
          <p className="text-sm text-muted-foreground">All employee claim statuses across payrolls</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'CLAIMED', 'NOT_CLAIMED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f === 'all' ? 'All' : f === 'CLAIMED' ? 'Claimed' : 'Pending'}
              {f !== 'all' && (
                <span className="ml-1.5 text-xs">
                  ({claims.filter((c) => c.claimStatus === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(payrollGroups).length === 0 ? (
        <div className="card p-6">
          <div className="text-center text-muted-foreground py-8">
            No claims found. Claims will appear here once employees start claiming payments.
          </div>
        </div>
      ) : (
        Object.entries(payrollGroups).map(([payrollId, group]) => (
          <div key={payrollId} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold">{group.payroll.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(group.payroll.payrollMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {group.payroll.claimedCount}/{group.payroll.employeeCount} claimed
                </span>
                <span
                  className={`badge ${
                    group.payroll.status === 'COMPLETED'
                      ? 'badge-success'
                      : group.payroll.status === 'READY'
                      ? 'badge-warning'
                      : 'badge-muted'
                  }`}
                >
                  {group.payroll.status}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div
                className="bg-success h-2 rounded-full transition-all"
                style={{
                  width: `${group.payroll.employeeCount > 0 ? (group.payroll.claimedCount / group.payroll.employeeCount) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="space-y-2">
              {group.claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        claim.claimStatus === 'CLAIMED' ? 'bg-success' : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <div className="font-medium">{claim.employee.fullName}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={claim.employee.walletAddress}>
                        {claim.employee.walletAddress.slice(0, 10)}...{claim.employee.walletAddress.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {claim.amount != null && (
                      <span className="font-medium">${claim.amount.toFixed(2)}</span>
                    )}
                    <span
                      className={`badge ${
                        claim.claimStatus === 'CLAIMED' ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      {claim.claimStatus === 'CLAIMED' ? 'Claimed' : 'Pending'}
                    </span>
                    {claim.claimedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(claim.claimedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    {claim.proofVerified && (
                      <span className="text-xs text-green-600">Verified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
