'use client';

import Link from 'next/link';
import { WalletConnectButton } from '@/components/wallet/wallet-connect-button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="hidden font-bold sm:inline-block">SilentPay</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Dashboard
          </Link>
          <Link
            href="/employees"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Employees
          </Link>
          <Link
            href="/payroll"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Payroll
          </Link>
          <Link
            href="/claims"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Claims
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
