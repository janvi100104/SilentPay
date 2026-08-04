'use client';

import { motion } from 'framer-motion';

const technologies = [
  { name: 'Midnight', icon: '🌙' },
  { name: 'Next.js', icon: '⚡' },
  { name: 'Prisma', icon: '◆' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Tailwind CSS', icon: '🎨' },
  { name: 'shadcn/ui', icon: '■' },
];

export function TrustedTech() {
  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-medium text-muted-foreground mb-8">
            Trusted by modern builders
          </p>
          <div className="flex flex-wrap items-center gap-8 md:gap-12">
            {technologies.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center space-x-2 text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                <span className="text-lg">{tech.icon}</span>
                <span className="text-sm font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
