'use client';

import { useState, useEffect } from 'react';
import { claimPaymentSchema, ClaimPaymentInput, ClaimResponse } from '@/types/claim';

interface ClaimFormProps {
  initialWalletAddress?: string;
  onClaimSuccess?: (response: ClaimResponse) => void;
}

export function ClaimForm({ initialWalletAddress = '', onClaimSuccess }: ClaimFormProps) {
  const [formData, setFormData] = useState<ClaimPaymentInput>({
    walletAddress: initialWalletAddress,
    payrollId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<ClaimResponse | null>(null);

  useEffect(() => {
    if (initialWalletAddress) {
      setFormData((prev) => ({ ...prev, walletAddress: initialWalletAddress }));
    }
  }, [initialWalletAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setSuccess(null);

    const result = claimPaymentSchema.safeParse(formData);
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
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim payment');
      }

      setSuccess(data);
      setFormData((prev) => ({ ...prev, payrollId: '' }));
      onClaimSuccess?.(data);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Claim a Payment</h3>
      
      {serverError && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {serverError}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 text-sm text-success bg-success/10 rounded-md">
          <div className="font-medium">{success.message}</div>
          {success.claim.claimedAt && (
            <div className="mt-1 text-muted-foreground">
              Claimed at: {new Date(success.claim.claimedAt).toLocaleString()}
            </div>
          )}
          {success.claim.proofVerified && (
            <div className="mt-1 text-muted-foreground">
              ✓ Proof verified on Midnight
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Your Wallet Address *</label>
          <input
            type="text"
            value={formData.walletAddress}
            onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
            className="input"
            placeholder="mn_addr_preview1..."
          />
          {errors.walletAddress && (
            <p className="text-sm text-destructive mt-1">{errors.walletAddress}</p>
          )}
        </div>

        <div>
          <label className="label">Payroll ID *</label>
          <input
            type="text"
            value={formData.payrollId}
            onChange={(e) => setFormData({ ...formData, payrollId: e.target.value })}
            className="input"
            placeholder="Enter the payroll ID from your employer"
          />
          {errors.payrollId && (
            <p className="text-sm text-destructive mt-1">{errors.payrollId}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Processing...' : 'Claim Payment'}
        </button>
      </form>
    </div>
  );
}
