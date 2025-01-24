import { createClient } from '@/utils/supabase/server'
import { TicketList } from '@/components/tickets/ticket-list'
import { TicketFilters } from '@/components/tickets/ticket-filters'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{
    status?: string
    priority?: string
  }>
}

export default async function TicketsPage(props: PageProps) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    redirect('/auth/login')
  }

  const userRole = user.user_metadata?.role || 'customer'
  const isEmployee = userRole === 'employee'

  // Get status and priority from searchParams
  const { status, priority } = await props.searchParams

  // Build query with customer details for employees
  let query = supabase
    .from('tickets')
    .select(`
      *,
      customer:customers(
        email,
        name
      ),
      assigned_to:employees(
        email,
        name,
        role
      )
    `)
    .order('created_at', { ascending: false })

  // Only filter by customer_id for customers
  if (!isEmployee) {
    query = query.eq('customer_id', user.id)
  }

  // Apply filters
  if (status) {
    query = query.eq('status', status)
  }
  if (priority) {
    query = query.eq('priority', priority)
  }

  // Execute query
  const { data: tickets, error } = await query

  if (error) {
    console.error('Error fetching tickets:', error)
    return <div>Error loading tickets</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEmployee ? 'All Tickets' : 'My Tickets'}
        </h1>
        {!isEmployee && (
          <Link href="/tickets/new">
            <Button>
              Create New Ticket
            </Button>
          </Link>
        )}
      </div>

      <TicketFilters
        status={status}
        priority={priority}
      />

      <div className="rounded-lg border bg-card">
        <TicketList 
          tickets={tickets || []} 
          showCustomerInfo={isEmployee}
          showAssigneeInfo={isEmployee}
        />
      </div>
    </div>
  )
} 