'use client';

import Link from 'next/link';
import { useCompany } from '@/hooks/use-company';
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
  const { company, noCompany, loading } = useCompany();

  // Show admin nav for company owners, employee nav for others
  const navigation = company ? adminNav : employeeNav;

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
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground truncate" title={walletAddress}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          {company && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{company.name}</p>
          )}
          {noCompany && (
            <p className="text-xs text-muted-foreground mt-1">Employee</p>
          )}
        </div>
      )}
    </aside>
  );
}
