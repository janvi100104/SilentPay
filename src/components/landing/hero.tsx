'use client';

import { motion } from 'framer-motion';
import { useWallet } from '@/providers/wallet-provider';

function formatAddress(address: string | null): string {
  if (!address) return '';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Hero() {
  const { connect, isConnected, address } = useWallet();

  return (
    <section className="relative pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2 animate-pulse" />
                Built on Midnight Blockchain
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
            >
              Private Payroll.
              <br />
              <span className="text-muted-foreground">Without Exposing </span>
              <span className="text-accent">Salaries.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              SilentPay enables organizations to distribute salaries, bonuses,
              and revenue shares using Midnight&apos;s confidential smart contracts.
              Employees can privately prove eligibility and claim payments
              without revealing compensation to anyone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <button
                onClick={connect}
                className="btn-primary text-sm px-6 py-2.5"
              >
                {isConnected ? formatAddress(address) : 'Connect Wallet'}
              </button>
              <a
                href="https://github.com/janvi100104/SilentPay"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm px-6 py-2.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4 mr-2"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Star on GitHub
              </a>
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View Documentation →
              </a>
            </motion.div>
          </div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Flow diagram */}
              <div className="flex items-center justify-center space-x-3 mb-8">
                {/* Employer */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-foreground">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground mt-2">Employer</span>
                </div>

                {/* Arrow */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-muted-foreground/50">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>

                {/* Private Payroll */}
                <div className="flex flex-col items-center">
                  <div className="px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-accent">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="text-sm font-semibold text-accent">Private Payroll</span>
                    </div>
                    <p className="text-[10px] text-accent/70 mt-0.5">Encrypted & Confidential</p>
                  </div>
                </div>

                {/* Arrow */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-muted-foreground/50">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>

                {/* Midnight */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-xl bg-foreground flex items-center justify-center shadow-sm">
                    <span className="text-lg">🌙</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground mt-2">Midnight</span>
                </div>
              </div>

              {/* Employee cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Alice', status: 'Claimed', claimed: true },
                  { name: 'Bob', status: 'Pending', claimed: false },
                  { name: 'Charlie', status: 'Claimed', claimed: true },
                ].map((emp) => (
                  <div key={emp.name} className="card p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {emp.name[0]}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{emp.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">██████</p>
                    <div className="mt-2">
                      {emp.claimed ? (
                        <span className="inline-flex items-center text-[11px] font-medium text-success">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Claimed
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-medium text-warning">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative gradient */}
              <div className="absolute -inset-8 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 rounded-3xl blur-3xl pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
