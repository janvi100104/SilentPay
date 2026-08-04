'use client';

import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { TrustedTech } from '@/components/landing/trusted-tech';
import { Problem } from '@/components/landing/problem';
import { Solution } from '@/components/landing/solution';
import { Features } from '@/components/landing/features';
import { DashboardPreview } from '@/components/landing/dashboard-preview';
import { PrivacyComparison } from '@/components/landing/privacy-comparison';
import { Architecture } from '@/components/landing/architecture';
import { OpenSource } from '@/components/landing/open-source';
import { FAQ } from '@/components/landing/faq';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <TrustedTech />
        <Problem />
        <Solution />
        <Features />
        <DashboardPreview />
        <PrivacyComparison />
        <Architecture />
        <OpenSource />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
