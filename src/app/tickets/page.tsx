import { createClient } from '@/utils/supabase/server'
import { TicketList } from '@/components/tickets/ticket-list'
import { TicketFilters } from '@/components/tickets/ticket-filters'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/page-container'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TicketListPageProps, Ticket } from '@/types/tickets'
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

export default async function TicketsPage({ searchParams, params }: TicketListPageProps) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    redirect('/auth/login')
  }

  const userRole = user.user_metadata?.role || 'customer'
  const isEmployee = userRole === 'employee'

  // Get status, priority, and tags from searchParams
  const { status, priority } = await searchParams
  const tagsParam = (await searchParams).tags as string | undefined
  const tags = tagsParam ? tagsParam.split(',') : []

  // Build query with customer details for employees
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

  // Apply filters first
  if (status) {
    query = query.eq('status', status)
  }
  if (priority) {
    query = query.eq('priority', priority)
  }
  if (tags.length > 0) {
    query = query.in('ticket_tags.tag_id', tags)
  }

  // Apply ordering and customer filter last
  query = query.order('created_at', { ascending: false })
  
  if (!isEmployee) {
    query = query.eq('customer_id', user.id)
  }

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
        tags={tags}
      />

      <div className="rounded-lg border bg-card">
        <TicketList 
          tickets={tickets} 
          showCustomerInfo={isEmployee}
          showAssigneeInfo={isEmployee}
        />
      </div>
    </PageContainer>
  )
} 