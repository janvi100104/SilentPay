'use client';

import { useState, useEffect } from 'react';
import { Payroll } from '@/types/payroll';
import { PayrollTable } from './payroll-table';
import { CreatePayrollDialog } from './create-payroll-dialog';

interface PayrollListProps {
  companyId: string;
}

export function PayrollList({ companyId }: PayrollListProps) {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ companyId });
      const response = await fetch(`/api/payroll?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payrolls');
      }
      
      const data = await response.json();
      setPayrolls(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [companyId]);

  const handlePayrollCreated = () => {
    setShowCreateDialog(false);
    fetchPayrolls();
  };

  const stats = {
    draft: payrolls.filter((p) => p.status === 'DRAFT').length,
    ready: payrolls.filter((p) => p.status === 'READY').length,
    completed: payrolls.filter((p) => p.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold">{stats.draft}</p>
            </div>
            <span className="text-2xl">📝</span>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ready</p>
              <p className="text-2xl font-bold">{stats.ready}</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <span className="text-2xl">🎉</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payroll History</h2>
        <button onClick={() => setShowCreateDialog(true)} className="btn-primary">
          + Create Payroll
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <PayrollTable
        payrolls={payrolls}
        loading={loading}
        onRefresh={fetchPayrolls}
      />

      <CreatePayrollDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        companyId={companyId}
        onPayrollCreated={handlePayrollCreated}
      />
    </div>
  );
}
