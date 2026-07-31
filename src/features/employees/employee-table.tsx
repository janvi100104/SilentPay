'use client';

import { useState } from 'react';
import { Employee } from '@/types/employee';
import { EditEmployeeDialog } from './edit-employee-dialog';
import { ArchiveEmployeeDialog } from './archive-employee-dialog';

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  onRefresh: () => void;
  onEmployeeUpdated: () => void;
}

function formatWalletAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    ACTIVE: 'badge-success',
    INACTIVE: 'badge-warning',
    ARCHIVED: 'badge-destructive',
  };
  return styles[status] || 'badge-secondary';
}

export function EmployeeTable({
  employees,
  loading,
  onRefresh,
  onEmployeeUpdated,
}: EmployeeTableProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [archivingEmployee, setArchivingEmployee] = useState<Employee | null>(null);

  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-muted-foreground">
          Loading employees...
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-muted-foreground">
          No employees found. Add your first employee to get started.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Wallet Address</th>
              <th className="text-left p-4 font-medium">Department</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b last:border-b-0 hover:bg-muted/30">
                <td className="p-4">
                  <div>
                    <div className="font-medium">{employee.fullName}</div>
                    {employee.email && (
                      <div className="text-sm text-muted-foreground">{employee.email}</div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {formatWalletAddress(employee.walletAddress)}
                  </code>
                </td>
                <td className="p-4 text-muted-foreground">
                  {employee.department || '-'}
                </td>
                <td className="p-4">
                  <span className={`badge ${getStatusBadge(employee.status)}`}>
                    {employee.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingEmployee(employee)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </button>
                    {employee.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => setArchivingEmployee(employee)}
                        className="text-sm text-destructive hover:text-destructive/80"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditEmployeeDialog
        open={editingEmployee !== null}
        onOpenChange={(open) => !open && setEditingEmployee(null)}
        employee={editingEmployee}
        onEmployeeUpdated={() => {
          setEditingEmployee(null);
          onEmployeeUpdated();
        }}
      />

      <ArchiveEmployeeDialog
        open={archivingEmployee !== null}
        onOpenChange={(open) => !open && setArchivingEmployee(null)}
        employee={archivingEmployee}
        onEmployeeArchived={() => {
          setArchivingEmployee(null);
          onRefresh();
        }}
      />
    </>
  );
}
