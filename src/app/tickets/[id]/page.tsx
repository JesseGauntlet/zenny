import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { TicketMessages } from '@/components/tickets/ticket-messages'
import { TicketNotesPanel } from '@/components/tickets/ticket-notes-panel'
import { Database } from '@/types/database.types'
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
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">Ticket #{ticket.id}</h1>
          <p className="text-muted-foreground">{ticket.subject}</p>
          {ticket.assigned_employee && (
            <p className="text-sm text-muted-foreground mt-2">
              Assigned to: {ticket.assigned_employee.name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Link href="/tickets">
              <Button variant="outline">Back to Tickets</Button>
            </Link>
            {employee && (
              <TicketNotesPanel
                ticketId={ticket.id}
                notes={notes}
                currentUserId={user.id}
              />
            )}
          </div>
          {employee && employees && (
            <form action={assignTicket} className="flex gap-2 mt-4">
              <input type="hidden" name="ticketId" value={ticket.id} />
              <select 
                name="employeeId" 
                className="border rounded px-3 py-2"
                defaultValue={ticket.assigned_employee?.id || ''}
              >
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="secondary">
                Assign
              </Button>
            </form>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-6">Messages</h2>
        <TicketMessages
          ticketId={ticket.id}
          messages={messages || []}
          currentUserId={user.id}
          userRole={employee ? 'employee' : 'customer'}
        />
      </div>
    </div>
  )
}

// Server actions
async function updateTicketStatus(ticketId: string, status: string) {
  'use server'
  const supabase = await createClient()
  await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId)
}

async function assignTicket(formData: FormData) {
  'use server'
  const ticketId = formData.get('ticketId') as string
  const employeeId = formData.get('employeeId') as string
  
  const supabase = await createClient()
  await supabase
    .from('tickets')
    .update({ assigned_employee_id: employeeId || null })
    .eq('id', ticketId)

  // Redirect back to the same page to show the update
  redirect(`/tickets/${ticketId}`)
} 