import { createClient } from '@/utils/supabase/server'
import { TicketList } from '@/components/tickets/ticket-list'
import { TicketFilters } from '@/components/tickets/ticket-filters'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{
    status?: string
    priority?: string
  }>
}

export default async function AssignedTicketsPage(props: PageProps) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    redirect('/auth/login')
  }

  // Verify user is an employee
  const userRole = user.user_metadata?.role || 'customer'
  if (userRole !== 'employee') {
    redirect('/tickets')
  }

  // Get status and priority from searchParams
  const { status, priority } = await props.searchParams

  // Build query for assigned tickets
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
    .eq('assigned_employee_id', user.id)
    .order('updated_at', { ascending: false })

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
        <div>
          <h1 className="text-2xl font-bold mb-1">My Assigned Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Showing {tickets?.length || 0} assigned tickets
          </p>
        </div>
      </div>

      <TicketFilters
        status={status}
        priority={priority}
      />

      <div className="rounded-lg border bg-card">
        <TicketList 
          tickets={tickets || []} 
          showCustomerInfo={true}
        />
      </div>
    </div>
  )
} 