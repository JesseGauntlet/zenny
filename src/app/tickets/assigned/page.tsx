import { createClient } from '@/utils/supabase/server'
import { TicketList } from '@/components/tickets/ticket-list'
import { TicketFilters } from '@/components/tickets/ticket-filters'
import { redirect } from 'next/navigation'
import { TicketListPageProps, Ticket } from '@/types/tickets'
import { PageContainer } from '@/components/layout/page-container'
import type { Database } from '@/types/database.types'

type RawTicket = Database['public']['Tables']['tickets']['Row'] & {
  ticket_tags?: {
    tag: {
      id: string
      name: string
      color: string
    }
  }[]
  customer?: {
    id: string
    email: string
    name: string
    created_at: string
  } | null
  assigned_to?: {
    email: string
    name: string
    role: string
  } | null
}

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

  // Get status, priority, and tags from searchParams
  const { status, priority } = await searchParams
  const tagsParam = (await searchParams).tags as string | undefined
  const tags = tagsParam ? tagsParam.split(',') : []

  // Build query for assigned tickets
  let query = supabase
    .from('tickets')
    .select(`
      *,
      customer:customers(
        id,
        email,
        name,
        created_at
      ),
      assigned_to:employees(
        email,
        name,
        role
      ),
      ${tags.length > 0 ? 'ticket_tags!inner' : 'ticket_tags'}(
        tag_id,
        tag:tags(
          id,
          name,
          color
        )
      )
    `)
    .eq('assigned_employee_id', user.id)

  // Apply filters
  if (status) {
    query = query.eq('status', status)
  }
  if (priority) {
    query = query.eq('priority', priority)
  }
  if (tags.length > 0) {
    query = query.in('ticket_tags.tag_id', tags)
  }

  // Apply ordering last
  query = query.order('updated_at', { ascending: false })

  // Execute query
  const { data: rawTickets, error } = await query

  if (error) {
    console.error('Error fetching tickets:', error)
    return <div>Error loading tickets</div>
  }

  // Transform the data to include tags in the expected format
  const tickets: Ticket[] = (rawTickets as RawTicket[])?.map(ticket => ({
    ...ticket,
    customer: ticket.customer || null,
    assigned_to: ticket.assigned_to || null,
    tags: ticket.ticket_tags?.map((tt: { tag: { id: string; name: string; color: string } }) => tt.tag) || []
  })) || []

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
        tags={tags}
      />

      <div className="rounded-lg border bg-card">
        <TicketList 
          tickets={tickets} 
          showCustomerInfo={true}
        />
      </div>
    </PageContainer>
  )
} 