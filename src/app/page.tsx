import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <main className="flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto px-4">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            SilentPay
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Privacy-first payroll platform. Pay employees without exposing salary amounts on-chain.
            Powered by Midnight.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="btn-primary text-base px-8 py-3"
          >
            Get Started
          </Link>
          <Link
            href="/employees"
            className="btn-secondary text-base px-8 py-3"
          >
            View Employees
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-left">
          <div className="card p-6">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold mb-1">Private by Default</h3>
            <p className="text-sm text-muted-foreground">
              Salary amounts stay confidential. Only you and your employees can see payments.
            </p>
          </div>
          <div className="card p-6">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Instant Settlement</h3>
            <p className="text-sm text-muted-foreground">
              Employees claim payments directly to their wallets. No waiting for bank transfers.
            </p>
          </div>
          <div className="card p-6">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-semibold mb-1">Verifiable</h3>
            <p className="text-sm text-muted-foreground">
              Payroll correctness is proven on-chain without revealing confidential data.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
