'use client';

import { useState, useEffect } from 'react';
import { Employee } from '@/types/employee';
import { EmployeeTable } from './employee-table';
import { EmployeeFilters } from './employee-filters';
import { AddEmployeeDialog } from './add-employee-dialog';

interface EmployeeListProps {
  companyId: string;
}

export function EmployeeList({ companyId }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ companyId });
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      
      const response = await fetch(`/api/employees?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [companyId, statusFilter]);

  const filteredEmployees = employees.filter((employee) => {
    const searchLower = search.toLowerCase();
    return (
      employee.fullName.toLowerCase().includes(searchLower) ||
      employee.walletAddress.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower) ||
      employee.department?.toLowerCase().includes(searchLower)
    );
  });

  const handleEmployeeAdded = () => {
    setShowAddDialog(false);
    fetchEmployees();
  };

  const handleEmployeeUpdated = () => {
    fetchEmployees();
  };

  return (
    <div className="space-y-4">
      <EmployeeFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onAddClick={() => setShowAddDialog(true)}
      />

      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <EmployeeTable
        employees={filteredEmployees}
        loading={loading}
        onRefresh={fetchEmployees}
        onEmployeeUpdated={handleEmployeeUpdated}
      />

      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        companyId={companyId}
        onEmployeeAdded={handleEmployeeAdded}
      />
    </div>
  );
}
