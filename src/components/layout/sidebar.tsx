'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRole } from '@/hooks/use-role';
import { useWalletAddress } from '@/hooks/use-wallet';

const adminNav = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Employees', href: '/employees', icon: '👥' },
  { name: 'Payroll', href: '/payroll', icon: '💰' },
  { name: 'Claims', href: '/claims', icon: '✅' },
  { name: 'History', href: '/history', icon: '📜' },
];

const employeeNav = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Claims', href: '/claims', icon: '✅' },
  { name: 'History', href: '/history', icon: '📜' },
];

export function Sidebar() {
  const walletAddress = useWalletAddress();
  const { role, setRole, hasCompany, isEmployer } = useRole();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const navigation = isEmployer ? adminNav : employeeNav;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <aside className="hidden w-56 border-r bg-muted/40 lg:block">
      <nav className="flex flex-col space-y-1 p-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {walletAddress && (
        <div className="p-4 border-t space-y-2">
          {/* Role switcher — always visible */}
          <div className="relative" ref={switcherRef}>
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="w-full flex items-center justify-between rounded-md border px-3 py-1.5 text-xs font-medium bg-background hover:bg-accent transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                {isEmployer ? 'Employer' : 'Employee'}
              </span>
              <span className="text-muted-foreground">{switcherOpen ? '▲' : '▼'}</span>
            </button>

            {switcherOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-md border bg-background shadow-md overflow-hidden z-50">
                <button
                  onClick={() => { setRole('employer'); setSwitcherOpen(false); }}
                  disabled={!hasCompany}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    role === 'employer' ? 'font-semibold bg-accent' : ''
                  } ${hasCompany ? 'hover:bg-accent' : 'opacity-40 cursor-not-allowed'}`}
                >
                  Employer {!hasCompany && '(no company)'}
                </button>
                <button
                  onClick={() => { setRole('employee'); setSwitcherOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors ${role === 'employee' ? 'font-semibold bg-accent' : ''}`}
                >
                  Employee
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground truncate" title={walletAddress}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          {!hasCompany && (
            <p className="text-xs text-muted-foreground">Employee</p>
          )}
        </div>
      )}
    </aside>
  );
}
