import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AgentDashboardPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  // Verify the user is an employee
  const { data: employee } = await supabase
    .from('employees')
    .select()
    .eq('id', session.user.id)
    .single()

  if (!employee) {
    redirect('/')
  }

  // Get assigned tickets
  const { data: assignedTickets } = await supabase
    .from('tickets')
    .select(`
      *,
      customer:customer_id (
        name
      )
    `)
    .eq('assigned_employee_id', session.user.id)
    .order('created_at', { ascending: false })

  // First get the user's teams
  const { data: userTeams } = await supabase
    .from('employees_teams')
    .select('team_id')
    .eq('employee_id', session.user.id)

  const teamIds = userTeams?.map(t => t.team_id) || []

  // Then get team tickets
  const { data: teamTickets } = await supabase
    .from('tickets')
    .select(`
      *,
      customer:customer_id (
        name
      )
    `)
    .in('assigned_team_id', teamIds)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>
      
      <div className="grid gap-8">
        {/* Assigned Tickets Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">My Assigned Tickets</h2>
          <div className="grid gap-4">
            {assignedTickets?.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/agent/tickets/${ticket.id}`}
                className="block p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{ticket.subject}</h3>
                    <p className="text-muted-foreground line-clamp-2">{ticket.description}</p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      From: {ticket.customer?.name}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                      ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 
                        ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'}`}
                    >
                      {ticket.status}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                      ${
                        ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {(!assignedTickets || assignedTickets.length === 0) && (
              <div className="text-center p-12 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">No assigned tickets</h3>
                <p className="text-muted-foreground">You don't have any tickets assigned to you yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Team Tickets Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Team Tickets</h2>
          <div className="grid gap-4">
            {teamTickets?.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/agent/tickets/${ticket.id}`}
                className="block p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{ticket.subject}</h3>
                    <p className="text-muted-foreground line-clamp-2">{ticket.description}</p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      From: {ticket.customer?.name}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                      ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 
                        ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'}`}
                    >
                      {ticket.status}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                      ${
                        ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {(!teamTickets || teamTickets.length === 0) && (
              <div className="text-center p-12 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">No team tickets</h3>
                <p className="text-muted-foreground">There are no tickets assigned to your teams.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 