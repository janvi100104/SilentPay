'use client';

import { useState } from 'react';
import { Payroll, PayrollStatus } from '@/types/payroll';

interface PayrollTableProps {
  payrolls: Payroll[];
  loading: boolean;
  onRefresh: () => void;
}

function getStatusBadge(status: PayrollStatus) {
  const styles: Record<PayrollStatus, string> = {
    DRAFT: 'badge-secondary',
    PROCESSING: 'badge-warning',
    READY: 'badge-success',
    COMPLETED: 'badge-success',
    FAILED: 'badge-destructive',
    CANCELLED: 'badge-destructive',
  };
  return styles[status] || 'badge-secondary';
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function PayrollTable({ payrolls, loading, onRefresh }: PayrollTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const markReady = async (payrollId: string) => {
    try {
      setUpdatingId(payrollId);
      const response = await fetch(`/api/payroll/${payrollId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READY' }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      onRefresh();
    } catch (err) {
      console.error('Failed to mark payroll as ready:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-muted-foreground">
          Loading payrolls...
        </div>
      </div>
    );
  }

  if (payrolls.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-muted-foreground">
          No payroll records found. Create your first payroll to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-4 font-medium">Title</th>
            <th className="text-left p-4 font-medium">Payroll ID</th>
            <th className="text-left p-4 font-medium">Month</th>
            <th className="text-left p-4 font-medium">Employees</th>
            <th className="text-left p-4 font-medium">Claims</th>
            <th className="text-left p-4 font-medium">Status</th>
            <th className="text-left p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((payroll) => (
            <tr key={payroll.id} className="border-b last:border-b-0 hover:bg-muted/30">
              <td className="p-4">
                <div className="font-medium">{payroll.title}</div>
              </td>
              <td className="p-4">
                <button
                  onClick={() => copyId(payroll.id)}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Click to copy full ID"
                >
                  {copiedId === payroll.id ? (
                    <span className="text-success">Copied!</span>
                  ) : (
                    <span>{payroll.id.slice(0, 8)}...{payroll.id.slice(-4)}</span>
                  )}
                </button>
              </td>
              <td className="p-4 text-muted-foreground">
                {formatDate(payroll.payrollMonth)}
              </td>
              <td className="p-4">
                {payroll.claimedCount} / {payroll.employeeCount}
              </td>
              <td className="p-4">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${payroll.employeeCount > 0
                        ? (payroll.claimedCount / payroll.employeeCount) * 100
                        : 0}%`,
                    }}
                  />
                </div>
              </td>
              <td className="p-4">
                <span className={`badge ${getStatusBadge(payroll.status)}`}>
                  {payroll.status}
                </span>
              </td>
              <td className="p-4">
                {payroll.status === 'DRAFT' && (
                  <button
                    onClick={() => markReady(payroll.id)}
                    disabled={updatingId === payroll.id}
                    className="btn-accent text-xs"
                  >
                    {updatingId === payroll.id ? 'Updating...' : 'Mark Ready'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
