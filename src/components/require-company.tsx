'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompany } from '@/hooks/use-company';

export function RequireCompany({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, noCompany } = useCompany();

  useEffect(() => {
    if (!loading && noCompany) {
      router.replace('/setup');
    }
  }, [loading, noCompany, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (noCompany) {
    return null;
  }

  return <>{children}</>;
}
