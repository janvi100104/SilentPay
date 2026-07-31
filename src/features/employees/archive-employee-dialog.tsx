'use client';

import { useState } from 'react';
import { Employee } from '@/types/employee';

interface ArchiveEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onEmployeeArchived: () => void;
}

export function ArchiveEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onEmployeeArchived,
}: ArchiveEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleArchive = async () => {
    if (!employee) return;
    
    setServerError(null);

    try {
      setLoading(true);
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to archive employee');
      }

      onEmployeeArchived();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold mb-2">Archive Employee</h2>
        <p className="text-muted-foreground mb-4">
          Are you sure you want to archive <strong>{employee.fullName}</strong>?
        </p>
        
        <div className="p-4 bg-muted/50 rounded-md mb-4">
          <p className="text-sm">
            Archiving this employee will:
          </p>
          <ul className="text-sm list-disc list-inside mt-2 space-y-1">
            <li>Remove them from active payroll</li>
            <li>Preserve their payment history</li>
            <li>Allow you to restore them later if needed</li>
          </ul>
        </div>

        {serverError && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {serverError}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleArchive}
            disabled={loading}
            className="btn-destructive"
          >
            {loading ? 'Archiving...' : 'Archive Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}
