'use client';

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
            <th className="text-left p-4 font-medium">Month</th>
            <th className="text-left p-4 font-medium">Employees</th>
            <th className="text-left p-4 font-medium">Claims</th>
            <th className="text-left p-4 font-medium">Status</th>
            <th className="text-left p-4 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((payroll) => (
            <tr key={payroll.id} className="border-b last:border-b-0 hover:bg-muted/30">
              <td className="p-4">
                <div className="font-medium">{payroll.title}</div>
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
              <td className="p-4 text-muted-foreground text-sm">
                {formatDate(payroll.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
