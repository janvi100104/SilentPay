'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWalletAddress } from '@/hooks/use-wallet';
import { useRole } from '@/hooks/use-role';

interface DashboardStats {
  totalEmployees: number;
  activePayrolls: number;
  claimsCompleted: number;
  pendingClaims: number;
}

interface RecentPayroll {
  id: string;
  title: string;
  payrollMonth: string;
  status: string;
  employeeCount: number;
  claimedCount: number;
  createdAt: string;
}

interface RecentClaim {
  id: string;
  payrollId: string;
  employeeId: string;
  claimStatus: string;
  claimedAt: string | null;
  midnightReference: string | null;
  proofVerified: boolean;
  amount: number | null;
  employee: { fullName: string; walletAddress: string };
  payroll: { title: string; payrollMonth: string; status: string };
}

interface EmployeeClaimSummary {
  totalClaims: number;
  claimedCount: number;
  pendingCount: number;
  totalClaimedAmount: number;
}

function AdminDashboard({ companyId, walletAddress }: { companyId: string; walletAddress: string }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activePayrolls: 0,
    claimsCompleted: 0,
    pendingClaims: 0,
  });
  const [recentPayrolls, setRecentPayrolls] = useState<RecentPayroll[]>([]);
  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [companyId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const empRes = await fetch(`/api/employees?companyId=${companyId}`);
      const employees = empRes.ok ? await empRes.json() : [];

      const payrollRes = await fetch(`/api/payroll?companyId=${companyId}`);
      const payrolls = payrollRes.ok ? await payrollRes.json() : [];

      let claims: RecentClaim[] = [];
      if (walletAddress) {
        const claimRes = await fetch(`/api/claim?walletAddress=${encodeURIComponent(walletAddress)}`);
        claims = claimRes.ok ? await claimRes.json() : [];
      }

      const activePayrolls = payrolls.filter(
        (p: RecentPayroll) => p.status === 'READY' || p.status === 'PROCESSING'
      );
      const claimedItems = claims.filter((c) => c.claimStatus === 'CLAIMED');
      const pendingItems = claims.filter((c) => c.claimStatus === 'NOT_CLAIMED');

      setStats({
        totalEmployees: employees.length,
        activePayrolls: activePayrolls.length,
        claimsCompleted: claimedItems.length,
        pendingClaims: payrolls.reduce(
          (acc: number, p: RecentPayroll) => acc + (p.employeeCount - p.claimedCount),
          0
        ),
      });

      setRecentPayrolls(payrolls.slice(0, 5));
      setRecentClaims(claims.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your payroll operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold">{stats.totalEmployees}</p>
            </div>
            <span className="text-2xl">👥</span>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Payrolls</p>
              <p className="text-2xl font-bold">{stats.activePayrolls}</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Claims Completed</p>
              <p className="text-2xl font-bold">{stats.claimsCompleted}</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Claims</p>
              <p className="text-2xl font-bold">{stats.pendingClaims}</p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Payrolls</h3>
          <div className="space-y-3">
            {recentPayrolls.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payrolls yet. Create your first payroll to get started.</p>
            ) : (
              recentPayrolls.map((payroll) => (
                <div key={payroll.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{payroll.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(payroll.payrollMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {' · '}{payroll.claimedCount}/{payroll.employeeCount} claimed
                    </div>
                  </div>
                  <span className={`badge ${payroll.status === 'READY' ? 'badge-success' : payroll.status === 'DRAFT' ? 'badge-warning' : 'badge-muted'}`}>
                    {payroll.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Claims</h3>
          <div className="space-y-3">
            {recentClaims.length === 0 ? (
              <p className="text-sm text-muted-foreground">No claims yet. Claims will appear here once employees start claiming payments.</p>
            ) : (
              recentClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{claim.employee.fullName}</div>
                    <div className="text-sm text-muted-foreground">{claim.payroll.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="badge badge-success">Claimed</div>
                    {claim.proofVerified && (
                      <div className="text-xs text-muted-foreground mt-1">Verified on-chain</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeDashboard({ walletAddress }: { walletAddress: string }) {
  const [summary, setSummary] = useState<EmployeeClaimSummary>({
    totalClaims: 0,
    claimedCount: 0,
    pendingCount: 0,
    totalClaimedAmount: 0,
  });
  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletAddress) {
      fetchEmployeeData();
    }
  }, [walletAddress]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);

      const claimRes = await fetch(`/api/claim?walletAddress=${encodeURIComponent(walletAddress)}`);
      const claims: RecentClaim[] = claimRes.ok ? await claimRes.json() : [];

      const claimed = claims.filter((c) => c.claimStatus === 'CLAIMED');
      const pending = claims.filter((c) => c.claimStatus === 'NOT_CLAIMED');
      const totalAmount = claimed.reduce((sum, c) => sum + (c.amount ?? 0), 0);

      setSummary({
        totalClaims: claims.length,
        claimedCount: claimed.length,
        pendingCount: pending.length,
        totalClaimedAmount: totalAmount,
      });

      setRecentClaims(claims.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">Loading your payment data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Dashboard</h1>
          <p className="text-muted-foreground">Your payment overview</p>
      </div>

      {/* CTA: Setup your own organization */}
      <Link href="/setup" className="block">
        <div className="card p-5 border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🏢</span>
            <div>
              <p className="font-semibold">Own a business?</p>
              <p className="text-sm text-muted-foreground">Setup your organization to manage payroll and employees.</p>
            </div>
            <span className="ml-auto text-muted-foreground">→</span>
          </div>
        </div>
      </Link>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Payrolls</p>
              <p className="text-2xl font-bold">{summary.totalClaims}</p>
            </div>
            <span className="text-2xl">📋</span>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Claimed</p>
              <p className="text-2xl font-bold text-green-600">{summary.claimedCount}</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{summary.pendingCount}</p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Claimed</p>
              <p className="text-2xl font-bold">${summary.totalClaimedAmount.toFixed(2)}</p>
            </div>
            <span className="text-2xl">💵</span>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">My Payments</h3>
        {recentClaims.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No payments found</p>
            <p className="text-sm text-muted-foreground">Your payments will appear here once your employer creates a payroll with your wallet address.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{claim.payroll.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(claim.payroll.payrollMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    {claim.amount != null && <span> · ${claim.amount.toFixed(2)}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${claim.claimStatus === 'CLAIMED' ? 'badge-success' : claim.claimStatus === 'NOT_CLAIMED' ? 'badge-warning' : 'badge-secondary'}`}>
                    {claim.claimStatus === 'CLAIMED' ? 'Claimed' : claim.claimStatus === 'NOT_CLAIMED' ? 'Pending' : claim.claimStatus}
                  </span>
                  {claim.claimedAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(claim.claimedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                  {claim.proofVerified && (
                    <div className="text-xs text-green-600 mt-1">Verified on-chain</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardContent() {
  const walletAddress = useWalletAddress();
  const { isEmployer, company, loading: roleLoading } = useRole();

  if (roleLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (walletAddress && isEmployer && company) {
    return <AdminDashboard companyId={company.id} walletAddress={walletAddress} />;
  }

  if (walletAddress) {
    return <EmployeeDashboard walletAddress={walletAddress} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Connect your wallet to see your dashboard</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
