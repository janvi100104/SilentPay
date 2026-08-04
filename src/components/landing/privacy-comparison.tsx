'use client';

import { motion } from 'framer-motion';

export function PrivacyComparison() {
  return (
    <section id="privacy" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Privacy Comparison
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            See how SilentPay protects employee compensation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-semibold p-6 bg-muted/50">
                    Feature
                  </th>
                  <th className="text-center text-sm font-semibold p-6 bg-muted/50">
                    Traditional Payroll
                  </th>
                  <th className="text-center text-sm font-semibold p-6 bg-accent/10 text-accent">
                    SilentPay
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: 'Salary Visibility',
                    traditional: 'Public on-chain',
                    silentpay: 'Fully confidential',
                  },
                  {
                    feature: 'Confidential Ledger',
                    traditional: 'No',
                    silentpay: 'Yes',
                  },
                  {
                    feature: 'ZK Proofs',
                    traditional: 'No',
                    silentpay: 'Yes',
                  },
                  {
                    feature: 'Private Claims',
                    traditional: 'No',
                    silentpay: 'Yes',
                  },
                  {
                    feature: 'Eligibility Verification',
                    traditional: 'Public',
                    silentpay: 'Private',
                  },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-0">
                    <td className="p-6 font-medium">{row.feature}</td>
                    <td className="p-6 text-center text-muted-foreground">
                      {row.traditional}
                    </td>
                    <td className="p-6 text-center text-accent font-medium">
                      {row.silentpay}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
