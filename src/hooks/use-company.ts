'use client';

import { useState, useEffect } from 'react';

interface Company {
  id: string;
  name: string;
  slug: string;
  ownerWallet: string;
}

const DEMO_SLUG = 'silentpay-demo';

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/company?slug=${DEMO_SLUG}`);
      if (response.ok) {
        setCompany(await response.json());
      } else {
        // Fallback: fetch any company
        const fallback = await fetch('/api/company');
        if (fallback.ok) {
          setCompany(await fallback.json());
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company');
    } finally {
      setLoading(false);
    }
  };

  return { company, loading, error, companyId: company?.id ?? null };
}
