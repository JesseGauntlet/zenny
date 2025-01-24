import { createClient } from '@/utils/supabase/server'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userRole = session?.user?.user_metadata?.role || 'customer'

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Active Tickets</h3>
          <p className="text-3xl font-bold">12</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Resolved This Week</h3>
          <p className="text-3xl font-bold">8</p>
        </div>

        {userRole === 'employee' && (
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Team Performance</h3>
            <p className="text-3xl font-bold">95%</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <p className="font-medium">Ticket #123 was updated</p>
            <p className="text-sm text-muted-foreground">2 hours ago</p>
          </div>
          <div className="p-4 border-b">
            <p className="font-medium">New comment on Ticket #456</p>
            <p className="text-sm text-muted-foreground">5 hours ago</p>
          </div>
          <div className="p-4">
            <p className="font-medium">Ticket #789 was resolved</p>
            <p className="text-sm text-muted-foreground">1 day ago</p>
          </div>
        </div>
      </div>
    </div>
  )
} 