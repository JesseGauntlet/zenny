'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  href: string
  label: string
}

const customerNav: NavItem[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/tickets', label: 'My Tickets' },
  { href: '/tickets/new', label: 'New Ticket' },
]

const employeeNav: NavItem[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/tickets', label: 'All Tickets' },
  { href: '/tickets/assigned', label: 'My Assigned' },
  { href: '/teams', label: 'Teams' },
]

export function DashboardHeader({ userRole }: { userRole: 'customer' | 'employee' }) {
  const pathname = usePathname()
  const navItems = userRole === 'customer' ? customerNav : employeeNav

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-8">
        <nav className="flex items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href
                  ? 'text-foreground'
                  : 'text-foreground/60'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
} 