import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Employees', href: '/employees', icon: '👥' },
  { name: 'Payroll', href: '/payroll', icon: '💰' },
  { name: 'Claims', href: '/claims', icon: '✅' },
  { name: 'History', href: '/history', icon: '📜' },
];

export function Sidebar() {
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
    </aside>
  );
}
