'use client';

import { useState, useEffect } from 'react';
import { createPayrollSchema, CreatePayrollInput } from '@/types/payroll';
import { Employee } from '@/types/employee';
import { useWalletAddress } from '@/hooks/use-wallet';
import { walletAddressError, isValidWalletAddress } from '@/lib/wallet-validation';

interface CreatePayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onPayrollCreated: () => void;
}

const emptyForm = {
  title: '',
  payrollMonth: '',
};

export function CreatePayrollDialog({
  open,
  onOpenChange,
  companyId,
  onPayrollCreated,
}: CreatePayrollDialogProps) {
  const walletAddress = useWalletAddress();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [createdBy, setCreatedBy] = useState('');
  const [deployContract, setDeployContract] = useState(false);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchEmployees();
      if (walletAddress) {
        setCreatedBy(walletAddress);
      }
      setFormData(emptyForm);
      setSelectedEmployees([]);
      setDeployContract(false);
      setAllocations({});
      setErrors({});
      setServerError(null);
    }
  }, [open, companyId, walletAddress]);

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams({ companyId });
      const response = await fetch(`/api/employees?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.filter((emp: Employee) => emp.status === 'ACTIVE'));
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
    if (errors.employeeIds) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.employeeIds;
        return next;
      });
    }
  };

  const selectAll = () => {
    setSelectedEmployees(employees.map((emp) => emp.id));
    if (errors.employeeIds) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.employeeIds;
        return next;
      });
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    // Validate wallet before anything else
    const walletErr = walletAddressError(createdBy);
    if (walletErr) {
      setErrors({ createdBy: walletErr });
      return;
    }

    const payload: CreatePayrollInput & { deployContract?: boolean; allocations?: Record<string, number> } = {
      companyId,
      title: formData.title,
      payrollMonth: formData.payrollMonth,
      createdBy: createdBy.trim(),
      employeeIds: selectedEmployees,
      deployContract,
      allocations: deployContract ? allocations : undefined,
    };

    const result = createPayrollSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payroll');
      }

      const data = await response.json();
      if (data.midnightError) {
        console.warn('Midnight deployment warning:', data.midnightError);
      }

      onPayrollCreated();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Create Payroll</h2>
        
        {serverError && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Payroll Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                clearError('title');
              }}
              className="input"
              placeholder="July 2026 Payroll"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="label">Payroll Month *</label>
            <input
              type="month"
              value={formData.payrollMonth}
              onChange={(e) => {
                setFormData({ ...formData, payrollMonth: e.target.value });
                clearError('payrollMonth');
              }}
              className="input"
            />
            {errors.payrollMonth && (
              <p className="text-sm text-destructive mt-1">{errors.payrollMonth}</p>
            )}
          </div>

          <div>
            <label className="label">Your Wallet Address *</label>
            <input
              type="text"
              value={createdBy}
              onChange={(e) => {
                setCreatedBy(e.target.value);
                clearError('createdBy');
              }}
              className="input"
              placeholder="addr_test..."
            />
            {walletAddress && (
              <p className="text-xs text-muted-foreground mt-1">
                Auto-filled from connected wallet
              </p>
            )}
            {createdBy && !isValidWalletAddress(createdBy) && (
              <p className="text-xs text-destructive mt-1">
                Midnight address must start with mn_ (e.g. mn_addr_preview1...)
              </p>
            )}
            {errors.createdBy && (
              <p className="text-sm text-destructive mt-1">{errors.createdBy}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Select Employees *</label>
              <button
                type="button"
                onClick={selectAll}
                className="text-sm text-primary hover:underline"
              >
                Select All
              </button>
            </div>
            
            {employees.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground border rounded-md">
                No active employees found. Add employees first.
              </div>
            ) : (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {employees.map((employee) => (
                  <label
                    key={employee.id}
                    className="flex items-center p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => toggleEmployee(employee.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{employee.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {employee.department || 'No department'}
                      </div>
                    </div>
                    {deployContract && selectedEmployees.includes(employee.id) && (
                      <input
                        type="number"
                        placeholder="Amount"
                        value={allocations[employee.id] || ''}
                        onChange={(e) =>
                          setAllocations({
                            ...allocations,
                            [employee.id]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="input w-24 ml-2 text-sm"
                        min="0"
                        step="0.01"
                      />
                    )}
                  </label>
                ))}
              </div>
            )}
            {errors.employeeIds && (
              <p className="text-sm text-destructive mt-1">{errors.employeeIds}</p>
            )}
          </div>

          <div className="border rounded-md p-4 bg-muted/30">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deployContract}
                onChange={(e) => setDeployContract(e.target.checked)}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">Deploy to Midnight Network</div>
                <div className="text-sm text-muted-foreground">
                  Deploy a ZK contract for private payroll. Enter allocation amounts per employee.
                </div>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedEmployees.length === 0}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
