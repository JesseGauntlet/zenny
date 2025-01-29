import { createClient } from '@/utils/supabase/server'
import { TicketList } from '@/components/tickets/ticket-list'
import { TicketFilters } from '@/components/tickets/ticket-filters'
import { redirect } from 'next/navigation'
import { TicketListPageProps } from '@/types/tickets'
import { PageContainer } from '@/components/layout/page-container'

export default async function AssignedTicketsPage({ searchParams, params }: TicketListPageProps) {
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
  const { status, priority } = await searchParams

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
    <PageContainer>
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
    </PageContainer>
  )
} 