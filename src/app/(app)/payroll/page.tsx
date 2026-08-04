'use client';

import { PayrollList } from '@/features/payroll/payroll-list';
import { useCompany } from '@/hooks/use-company';
import { RequireCompany } from '@/components/require-company';

function PayrollContent() {
  const { companyId } = useCompany();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
        <p className="text-muted-foreground">
          Create and manage payroll runs
        </p>
      </div>

      <PayrollList companyId={companyId!} />
    </div>
  );
}

export default function PayrollPage() {
  return (
    <RequireCompany>
      <PayrollContent />
    </RequireCompany>
  );
}
