import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { TicketMessages } from '@/components/tickets/ticket-messages'
import { TicketNotesPanel } from '@/components/tickets/ticket-notes-panel'
import { InteractiveBadge } from '@/components/tickets/interactive-badge'
import { TicketPageProps } from '@/types/tickets'

export default async function TicketPage({ params }: TicketPageProps) {
  // Get the ticket ID from params
  const { id: ticketId } = await params

  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get user's role and profile by checking both customers and employees tables
  const [{ data: customer }, { data: employee }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('employees').select('*').eq('id', user.id).maybeSingle()
  ])

  // If user is neither a customer nor an employee, redirect to login
  if (!customer && !employee) redirect('/auth/login')

  // Get ticket details with customer and assigned employee
  const { data: ticket } = await supabase
    .from('tickets')
    .select(`
      *,
      customer:customer_id(id, name, email),
      assigned_employee:assigned_employee_id(id, name, email)
    `)
    .eq('id', ticketId)
    .single()

  if (!ticket) redirect('/tickets')

  // Get ticket messages
  const { data: rawMessages } = await supabase
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  // Fetch all potential senders
  const [{ data: customers }, { data: employees }] = await Promise.all([
    supabase.from('customers').select('id, name, email'),
    supabase.from('employees').select('id, name, email')
  ]);

  // Create lookup maps
  const customerMap = new Map(customers?.map(c => [c.id, c]) || []);
  const employeeMap = new Map(employees?.map(e => [e.id, e]) || []);

  // Combine messages with sender information
  const messages = rawMessages?.map(message => ({
    ...message,
    sender: message.sender_type === 'customer'
      ? customerMap.get(message.sender_id)
      : employeeMap.get(message.sender_id)
  })) || [];

  // Get ticket notes if user is an employee
  let notes = []
  if (employee) {
    const { data: ticketNotes } = await supabase
      .from('ticket_notes')
      .select(`
        *,
        employee:employees(
          name,
          email
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
    
    notes = ticketNotes || []
  }

  return (
    <div className="container max-w-6xl py-8 px-4 md:px-8 lg:px-10">
      {/* Header Bar */}
      <div className="bg-background border rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4 mb-6">
          <Link href="/tickets">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              ← Back
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-6 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Ticket ID:</span>
                <Badge variant="outline">
                  #{ticket.id}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Created by:</span>
                <span className="font-medium">{ticket.customer?.name}</span>
                <span className="text-muted-foreground">({ticket.customer?.email})</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2">{ticket.subject}</h1>
            <p className="text-muted-foreground mb-4">{ticket.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>Status</span>
                <span>Priority</span>
                <span>Assigned To</span>
              </div>
              <div className="flex items-center gap-2">
                {employee ? (
                  <>
                    <InteractiveBadge
                      type="status"
                      currentValue={ticket.status}
                      options={[
                        { value: 'open', label: 'Open' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'closed', label: 'Closed' }
                      ]}
                      ticketId={ticket.id}
                      variant={
                        ticket.status === 'open' ? 'default' :
                        ticket.status === 'pending' ? 'secondary' : 'outline'
                      }
                    />
                    <InteractiveBadge
                      type="priority"
                      currentValue={ticket.priority}
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' }
                      ]}
                      ticketId={ticket.id}
                      variant={
                        ticket.priority === 'high' ? 'destructive' :
                        ticket.priority === 'medium' ? 'default' : 'secondary'
                      }
                    />
                    <InteractiveBadge
                      type="assign"
                      currentValue={ticket.assigned_employee_id || ''}
                      currentLabel={ticket.assigned_employee?.name || 'Unassigned'}
                      options={[
                        { value: '', label: 'Unassigned' },
                        ...(employees?.map(emp => ({
                          value: emp.id,
                          label: emp.name
                        })) || [])
                      ]}
                      ticketId={ticket.id}
                      variant="outline"
                    />
                  </>
                ) : (
                  <>
                    <Badge variant={
                      ticket.status === 'open' ? 'default' :
                      ticket.status === 'pending' ? 'secondary' : 'outline'
                    } className="capitalize">
                      {ticket.status}
                    </Badge>
                    <Badge variant={
                      ticket.priority === 'high' ? 'destructive' :
                      ticket.priority === 'medium' ? 'default' : 'secondary'
                    } className="capitalize">
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {ticket.assigned_employee?.name || 'Unassigned'}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Conversation</h2>
          {employee && (
            <TicketNotesPanel
              ticketId={ticket.id}
              notes={notes}
              currentUserId={user.id}
            />
          )}
        </div>
        <div className="border rounded-lg bg-background p-6">
          <TicketMessages
            ticketId={ticket.id}
            messages={messages || []}
            currentUserId={user.id}
            userRole={employee ? 'employee' : 'customer'}
          />
        </div>
      </div>
    </div>
  )
} 