'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useCompany } from '@/hooks/use-company';
import { useWalletAddress } from '@/hooks/use-wallet';

export type ActiveRole = 'employer' | 'employee';

const ROLE_STORAGE_KEY = 'silentpay_active_role';

interface RoleContextValue {
  role: ActiveRole;
  setRole: (role: ActiveRole) => void;
  company: ReturnType<typeof useCompany>['company'];
  hasCompany: boolean;
  isEmployer: boolean;
  isEmployee: boolean;
  loading: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const walletAddress = useWalletAddress();
  const { company, loading: companyLoading } = useCompany();
  const [role, setRoleState] = useState<ActiveRole>('employee');
  const [initialized, setInitialized] = useState(false);

  const hasCompany = !!company;

  // Restore from localStorage on mount
  useEffect(() => {
    if (companyLoading) return;

    const saved = localStorage.getItem(ROLE_STORAGE_KEY);

    if (saved === 'employer' && hasCompany) {
      setRoleState('employer');
    } else if (saved === 'employee') {
      setRoleState('employee');
    } else {
      setRoleState(hasCompany ? 'employer' : 'employee');
    }

    setInitialized(true);
  }, [companyLoading, hasCompany]);

  const setRole = useCallback((newRole: ActiveRole) => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
  }, []);

  // Reset role when wallet disconnects
  useEffect(() => {
    if (!walletAddress) {
      setRoleState('employee');
      localStorage.removeItem(ROLE_STORAGE_KEY);
    }
  }, [walletAddress]);

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        company,
        hasCompany,
        isEmployer: role === 'employer' && hasCompany,
        isEmployee: role === 'employee' || !hasCompany,
        loading: companyLoading || !initialized,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within a RoleProvider');
  return ctx;
}
