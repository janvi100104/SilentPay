'use client';

import { EmployeeList } from '@/features/employees/employee-list';
import { useCompany } from '@/hooks/use-company';
import { RequireCompany } from '@/components/require-company';

function EmployeesContent() {
  const { companyId } = useCompany();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">
          Manage your team members
        </p>
      </div>

      <EmployeeList companyId={companyId!} />
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <RequireCompany>
      <EmployeesContent />
    </RequireCompany>
  );
}
