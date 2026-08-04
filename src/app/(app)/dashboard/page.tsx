'use client';

import { useState, useEffect } from 'react';
import { useWalletAddress } from '@/hooks/use-wallet';
import { useCompany } from '@/hooks/use-company';

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
  employee: { fullName: string };
  payroll: { title: string };
}

const DEMO_COMPANY_ID_FALLBACK = '00000000-0000-0000-0000-000000000001';

export default function DashboardPage() {
  const walletAddress = useWalletAddress();
  const { companyId: fetchedCompanyId } = useCompany();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activePayrolls: 0,
    claimsCompleted: 0,
    pendingClaims: 0,
  });
  const [recentPayrolls, setRecentPayrolls] = useState<RecentPayroll[]>([]);
  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const companyId = fetchedCompanyId || DEMO_COMPANY_ID_FALLBACK;

  useEffect(() => {
    if (companyId) {
      fetchDashboardData();
    }
  }, [companyId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const empRes = await fetch(`/api/employees?companyId=${companyId}`);
      const employees = empRes.ok ? await empRes.json() : [];
      
      // Fetch payrolls
      const payrollRes = await fetch(`/api/payroll?companyId=${companyId}`);
      const payrolls = payrollRes.ok ? await payrollRes.json() : [];
      
      // Fetch recent claims (only if wallet is connected)
      let claims: RecentClaim[] = [];
      if (walletAddress) {
        const claimRes = await fetch(`/api/claim?walletAddress=${encodeURIComponent(walletAddress)}&status=CLAIMED`);
        claims = claimRes.ok ? await claimRes.json() : [];
      }

      // Calculate stats
      const activePayrolls = payrolls.filter(
        (p: RecentPayroll) => p.status === 'READY' || p.status === 'PROCESSING'
      );
      
      setStats({
        totalEmployees: employees.length,
        activePayrolls: activePayrolls.length,
        claimsCompleted: claims.length,
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your payroll operations
        </p>
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
                      <div className="text-xs text-muted-foreground mt-1">✓ Verified on-chain</div>
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
