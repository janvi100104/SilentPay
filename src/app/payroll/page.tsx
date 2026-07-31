'use client';

import { PayrollList } from '@/features/payroll/payroll-list';
import { useCompany } from '@/hooks/use-company';

export default function PayrollPage() {
  const { companyId, loading } = useCompany();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground">No company found. Run the seed script first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
        <p className="text-muted-foreground">
          Create and manage payroll runs
        </p>
      </div>

      <PayrollList companyId={companyId} />
    </div>
  );
}
