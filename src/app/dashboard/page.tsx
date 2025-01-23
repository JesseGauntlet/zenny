import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if user exists in customers or employees table
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('id', user.id)
    .single()

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('id', user.id)
    .single()

  const userRole = customer ? 'customer' : employee ? 'employee' : null
  if (!userRole) return null

  // Get ticket statistics
  const { data: tickets } = await supabase
    .from('tickets')
    .select('status, priority')
    .eq(userRole === 'customer' ? 'customer_id' : 'assigned_employee_id', user.id)

  const stats = {
    total: tickets?.length || 0,
    open: tickets?.filter(t => t.status === 'open').length || 0,
    pending: tickets?.filter(t => t.status === 'pending').length || 0,
    closed: tickets?.filter(t => t.status === 'closed').length || 0,
    highPriority: tickets?.filter(t => t.priority === 'high').length || 0,
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Tickets"
          value={stats.total}
          href="/tickets"
        />
        <DashboardCard
          title="Open Tickets"
          value={stats.open}
          href="/tickets?status=open"
        />
        <DashboardCard
          title="Pending Tickets"
          value={stats.pending}
          href="/tickets?status=pending"
        />
        <DashboardCard
          title="High Priority"
          value={stats.highPriority}
          href="/tickets?priority=high"
        />
      </div>

      {userRole === 'customer' ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <Link
            href="/tickets/new"
            className="inline-block bg-green-700 text-white rounded-md px-4 py-2 hover:bg-green-600"
          >
            Create New Ticket
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {/* We'll implement this in the next phase */}
          <p className="text-gray-500">Recent ticket updates will appear here</p>
        </div>
      )}
    </div>
  )
}

function DashboardCard({
  title,
  value,
  href,
}: {
  title: string
  value: number
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border p-4 hover:border-gray-400 transition-colors"
    >
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </Link>
  )
} 