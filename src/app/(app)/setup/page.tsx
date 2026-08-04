'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCompany } from '@/hooks/use-company';
import { useWalletAddress } from '@/hooks/use-wallet';
import { useRole } from '@/providers/role-provider';

export default function SetupPage() {
  const router = useRouter();
  const walletAddress = useWalletAddress();
  const { createCompany } = useCompany();
  const { refetchCompany } = useRole();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 80)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!walletAddress) {
      setError('Wallet not connected');
      return;
    }

    if (!name.trim()) {
      setError('Company name is required');
      return;
    }

    if (!slug.trim()) {
      setError('Company URL is required');
      return;
    }

    try {
      setLoading(true);
      await createCompany({ name: name.trim(), slug: slug.trim(), email: email.trim() || undefined });
      await refetchCompany();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="max-w-lg mx-auto mt-16 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Set Up Your Company</h1>
          <p className="text-muted-foreground">Connect your wallet to get started.</p>
        </div>
        <div className="card p-8 text-center text-muted-foreground">
          Please connect your wallet using the button in the navbar.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-16 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Set Up Your Company</h1>
        <p className="text-muted-foreground">
          Register your company to start using SilentPay.
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md mb-6">
          <div className="w-2 h-2 bg-success rounded-full" />
          <span className="text-sm">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="label">Company Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input"
              placeholder="Acme Corp"
              required
            />
          </div>

          <div>
            <label className="label">Company URL *</label>
            <div className="flex items-center gap-0">
              <span className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-l-md border border-r-0 border-input">
                silentpay.com/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'))}
                className="input rounded-l-none"
                placeholder="acme-corp"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <div>
            <label className="label">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="admin@acme.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating...' : 'Create Company'}
          </button>
        </form>
      </div>
    </div>
  );
}
