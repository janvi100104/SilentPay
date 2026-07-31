'use client';

import { useState, useEffect } from 'react';
import { createEmployeeSchema, CreateEmployeeInput } from '@/types/employee';
import { useWalletAddress } from '@/hooks/use-wallet';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onEmployeeAdded: () => void;
}

export function AddEmployeeDialog({
  open,
  onOpenChange,
  companyId,
  onEmployeeAdded,
}: AddEmployeeDialogProps) {
  const walletAddress = useWalletAddress();
  const [formData, setFormData] = useState<CreateEmployeeInput>({
    companyId,
    fullName: '',
    walletAddress: '',
    email: '',
    designation: '',
    department: '',
    joinedAt: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open && walletAddress) {
      setFormData((prev) => ({ ...prev, walletAddress }));
    }
  }, [open, walletAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const result = createEmployeeSchema.safeParse(formData);
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
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create employee');
      }

      setFormData({
        companyId,
        fullName: '',
        walletAddress: walletAddress || '',
        email: '',
        designation: '',
        department: '',
        joinedAt: '',
      });
      onEmployeeAdded();
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
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">Add Employee</h2>
        
        {serverError && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="input"
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="label">Wallet Address *</label>
            <input
              type="text"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              className="input"
              placeholder="addr_test..."
              readOnly={!!walletAddress}
            />
            {walletAddress && (
              <p className="text-xs text-muted-foreground mt-1">
                Auto-filled from connected wallet
              </p>
            )}
            {errors.walletAddress && (
              <p className="text-sm text-destructive mt-1">{errors.walletAddress}</p>
            )}
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="input"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="label">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input"
                placeholder="Engineering"
              />
            </div>
          </div>

          <div>
            <label className="label">Joined At</label>
            <input
              type="date"
              value={formData.joinedAt}
              onChange={(e) => setFormData({ ...formData, joinedAt: e.target.value })}
              className="input"
            />
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
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
