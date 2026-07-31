'use client';

import { EmployeeList } from '@/features/employees/employee-list';
import { useCompany } from '@/hooks/use-company';

export default function EmployeesPage() {
  const { companyId, loading } = useCompany();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">No company found. Run the seed script first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">
          Manage your team members
        </p>
      </div>

      <EmployeeList companyId={companyId} />
    </div>
  );
}
