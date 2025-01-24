'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Users,
  Settings,
  LogOut,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

const customerNav: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard /> },
  { href: '/tickets', label: 'My Tickets', icon: <Ticket /> },
  { href: '/tickets/new', label: 'New Ticket', icon: <PlusCircle /> },
  { href: '/settings', label: 'Settings', icon: <Settings /> },
]

const employeeNav: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard /> },
  { href: '/tickets', label: 'All Tickets', icon: <Ticket /> },
  { href: '/tickets/assigned', label: 'My Assigned', icon: <PlusCircle /> },
  { href: '/teams', label: 'Teams', icon: <Users /> },
  { href: '/settings', label: 'Settings', icon: <Settings /> },
]

interface SidebarProps {
  userRole: 'customer' | 'employee'
  signOut: () => Promise<void>
  userEmail?: string
}

export function Sidebar({ userRole, signOut, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const navItems = userRole === 'customer' ? customerNav : employeeNav

  return (
    <div className="flex h-screen flex-col justify-between border-r bg-background px-4 py-6">
      <div className="space-y-4">
        <div className="px-3 py-2 space-y-1">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Zenny Support</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              userRole === 'employee' ? "bg-green-500" : "bg-blue-500"
            )} />
            <span className="text-sm text-muted-foreground capitalize">
              {userRole} Portal
            </span>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent',
                pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="space-y-4">
        <div className="px-3 py-2">
          <div className="flex items-center space-x-3 rounded-lg bg-accent/50 px-3 py-2">
            <User className="text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{userEmail}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          </div>
        </div>
        <form action={signOut} className="px-3">
          <Button variant="ghost" className="w-full justify-start space-x-3" type="submit">
            <LogOut />
            <span>Sign Out</span>
          </Button>
        </form>
      </div>
    </div>
  )
} 