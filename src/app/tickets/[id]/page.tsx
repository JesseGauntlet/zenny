import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { TicketMessages } from '@/components/tickets/ticket-messages'
import { Database } from '@/types/database.types'

interface PageProps {
  params: { id: string }
}

export default async function TicketPage({ params }: PageProps) {
  // Get the ticket ID from params
  const { id: ticketId } = await params

  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get user's role and profile by checking both customers and employees tables
  const [{ data: customer }, { data: employee }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', user.id).single(),
    supabase.from('employees').select('*').eq('id', user.id).single()
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

  // Get ticket messages with proper sender information
  const { data: messages } = await supabase
    .from('ticket_messages')
    .select(`
      *,
      customer:sender_id(id, name, email),
      employee:sender_id(id, name, email)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
    .then(({ data: messages }) => ({
      data: messages?.map(message => ({
        ...message,
        sender: message.sender_type === 'customer' ? message.customer : message.employee
      }))
    }))

  // Get all employees for assignment dropdown if current user is an employee
  const { data: employees } = employee ? await supabase
    .from('employees')
    .select('id, name, email')
    .order('name') : { data: null }

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
          <Link href="/tickets">
            <Button variant="outline">Back to Tickets</Button>
          </Link>
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

      <div className="border rounded-lg p-6">
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