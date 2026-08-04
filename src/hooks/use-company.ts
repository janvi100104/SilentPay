'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWalletAddress } from './use-wallet';

interface Company {
  id: string;
  name: string;
  slug: string;
  ownerWallet: string;
}

export function useCompany() {
  const walletAddress = useWalletAddress();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      fetchCompanyByWallet(walletAddress);
    } else {
      setCompany(null);
      setLoading(false);
    }
  }, [walletAddress]);

  const fetchCompanyByWallet = async (address: string) => {
    try {
      setLoading(true);
      console.log('[useCompany] Fetching company for wallet:', address);
      const response = await fetch(`/api/company?walletAddress=${encodeURIComponent(address)}`);
      console.log('[useCompany] Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('[useCompany] Found company:', data.name);
        setCompany(data);
      } else {
        console.log('[useCompany] No company found');
        setCompany(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company');
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (data: { name: string; slug: string; email?: string; website?: string }) => {
    if (!walletAddress) throw new Error('Wallet not connected');
    const response = await fetch('/api/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, ownerWallet: walletAddress }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create company');
    }
    const newCompany = await response.json();
    setCompany(newCompany);
    return newCompany;
  };

  const noCompany = !loading && walletAddress && !company;

  const refetch = useCallback(async () => {
    if (walletAddress) {
      await fetchCompanyByWallet(walletAddress);
    }
  }, [walletAddress]);

  return { company, loading, error, companyId: company?.id ?? null, noCompany, createCompany, refetch };
}
