'use client';

import { motion } from 'framer-motion';

const sidebarLinks = [
  { label: 'Overview', active: true },
  { label: 'Employees', active: false },
  { label: 'Payrolls', active: false },
  { label: 'Claims', active: false },
  { label: 'History', active: false },
  { label: 'Settings', active: false },
];

const stats = [
  { label: 'Total Employees', value: '24' },
  { label: 'Total Payrolls', value: '7' },
  { label: 'Total Claimed', value: '18' },
  { label: 'Pending Claims', value: '6', highlight: true },
];

const payrolls = [
  { name: 'July Payroll', month: 'Jul 2024', employees: 24, status: 'Active', progress: 75 },
  { name: 'June Payroll', month: 'Jun 2024', employees: 24, status: 'Completed', progress: 100 },
  { name: 'May Payroll', month: 'May 2024', employees: 24, status: 'Completed', progress: 100 },
];

export function DashboardPreview() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Dashboard Preview
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="card overflow-hidden shadow-xl">
            <div className="flex">
              {/* Sidebar */}
              <div className="w-48 border-r border-border bg-muted/30 p-4 hidden md:block">
                <div className="space-y-1">
                  {sidebarLinks.map((link) => (
                    <div
                      key={link.label}
                      className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                        link.active
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {link.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-6">
                <h3 className="text-lg font-semibold mb-6">Overview</h3>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {stats.map((stat) => (
                    <div key={stat.label} className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${stat.highlight ? 'text-warning' : ''}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recent Payrolls */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold">Recent Payrolls</h4>
                  <button className="text-xs font-medium text-accent hover:text-accent/80 transition-colors">
                    + New Payroll
                  </button>
                </div>

                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                          Payroll
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                          Month
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                          Employees
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                          Status
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                          Claim Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrolls.map((row) => (
                        <tr key={row.name} className="border-t border-border">
                          <td className="px-4 py-3 text-sm font-medium">{row.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{row.month}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                            {row.employees}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`badge text-xs ${
                                row.status === 'Active' ? 'badge-success' : 'badge-secondary'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent rounded-full"
                                  style={{ width: `${row.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8">{row.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
