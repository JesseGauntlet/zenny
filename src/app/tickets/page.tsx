import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { status?: string; priority?: string }
}) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 justify-center gap-2">
        <h1 className="text-2xl font-bold">Please login to view tickets</h1>
        <Link href="/auth/login" className="text-blue-500 hover:underline">
          Go to login
        </Link>
      </div>
    )
  }

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
  if (!userRole) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 justify-center gap-2">
        <p className="text-red-500">Account not properly set up</p>
      </div>
    )
  }

  // Build query based on filters
  let query = supabase
    .from('tickets')
    .select('*, customers(name)')
    .order('created_at', { ascending: false })

  // Apply role-based filtering
  if (userRole === 'customer') {
    query = query.eq('customer_id', user.id)
  }

  // Apply status filter
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  // Apply priority filter
  if (searchParams.priority) {
    query = query.eq('priority', searchParams.priority)
  }

  const { data: tickets, error } = await query

  if (error) {
    console.error('Error fetching tickets:', error)
    return (
      <div className="flex-1 flex flex-col w-full px-8 justify-center gap-2">
        <p className="text-red-500">Error loading tickets</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {userRole === 'customer' ? 'My Tickets' : 'All Tickets'}
        </h1>
        {userRole === 'customer' && (
          <Link
            href="/tickets/new"
            className="bg-green-700 text-white rounded-md px-4 py-2 hover:bg-green-600"
          >
            New Ticket
          </Link>
        )}
      </div>

      <div className="flex gap-4 mb-4">
        <select
          className="rounded-md px-4 py-2 bg-inherit border"
          onChange={(e) => {
            const url = new URL(window.location.href)
            if (e.target.value) {
              url.searchParams.set('status', e.target.value)
            } else {
              url.searchParams.delete('status')
            }
            window.location.href = url.toString()
          }}
          value={searchParams.status || ''}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>

        <select
          className="rounded-md px-4 py-2 bg-inherit border"
          onChange={(e) => {
            const url = new URL(window.location.href)
            if (e.target.value) {
              url.searchParams.set('priority', e.target.value)
            } else {
              url.searchParams.delete('priority')
            }
            window.location.href = url.toString()
          }}
          value={searchParams.priority || ''}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {tickets.length === 0 ? (
        <p className="text-gray-500">No tickets found</p>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border rounded-lg p-4 hover:border-gray-400 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-semibold">{ticket.subject}</h2>
                  {userRole === 'employee' && (
                    <p className="text-sm text-gray-500">
                      Customer: {ticket.customers.name}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.priority}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{ticket.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Status: {ticket.status}</span>
                <span>
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 