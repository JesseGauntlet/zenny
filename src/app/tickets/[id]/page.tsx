import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface PageProps {
  params: {
    id: string
  }
}

export default async function TicketPage({ params }: PageProps) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    redirect('/auth/login')
  }

  const userRole = user.user_metadata?.role || 'customer'
  const isEmployee = userRole === 'employee'

  // Fetch ticket with customer and assignee details
  const { data: ticket, error: ticketError } = await supabase
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
    .eq('id', params.id)
    .single()

  // Fetch available employees for assignment
  const { data: employees } = isEmployee ? await supabase
    .from('employees')
    .select('id, name, email, role')
    .order('name') : { data: null }

  if (ticketError || !ticket) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ticket Not Found</h1>
          <Link href="/tickets">
            <Button>Back to Tickets</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Check if user has access to this ticket
  if (!isEmployee && ticket.customer_id !== user.id) {
    redirect('/tickets')
  }

  // Server action to update ticket status
  async function updateStatus(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const newStatus = formData.get('status') as string
    
    const { error } = await supabase
      .from('tickets')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error('Error updating ticket:', error)
      throw new Error('Failed to update ticket')
    }

    // Refresh the page to show updated status
    redirect(`/tickets/${params.id}`)
  }

  // Server action to assign ticket
  async function assignTicket(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const employeeId = formData.get('employee_id') as string
    
    const { error } = await supabase
      .from('tickets')
      .update({ 
        assigned_employee_id: employeeId === 'unassign' ? null : employeeId,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error('Error assigning ticket:', error)
      throw new Error('Failed to assign ticket')
    }

    // Refresh the page to show updated assignment
    redirect(`/tickets/${params.id}`)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold">#{ticket.id}</h1>
              <Badge variant={
                ticket.status === 'open' ? 'default' :
                ticket.status === 'pending' ? 'secondary' : 'outline'
              }>
                {ticket.status}
              </Badge>
              <Badge variant={
                ticket.priority === 'high' ? 'destructive' :
                ticket.priority === 'medium' ? 'default' : 'secondary'
              }>
                {ticket.priority}
              </Badge>
            </div>
            <p className="text-lg font-medium mb-1">{ticket.subject}</p>
            <p className="text-sm text-muted-foreground">
              Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/tickets">
              <Button variant="outline">Back to Tickets</Button>
            </Link>
            {isEmployee && (
              <>
                <form action={updateStatus} className="flex gap-2">
                  <select
                    name="status"
                    className="rounded-md border px-3"
                    defaultValue={ticket.status}
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                  <Button type="submit">Update Status</Button>
                </form>
                <form action={assignTicket} className="flex gap-2">
                  <select
                    name="employee_id"
                    className="rounded-md border px-3"
                    defaultValue={ticket.assigned_employee_id || ''}
                  >
                    <option value="unassign">Unassigned</option>
                    {employees?.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                  <Button type="submit">Assign</Button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Customer & Assignment Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-1">
            <p className="text-sm font-medium">Customer</p>
            <p className="font-medium">{ticket.customer?.name}</p>
            <p className="text-sm text-muted-foreground">{ticket.customer?.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Assigned To</p>
            {ticket.assigned_to ? (
              <>
                <p className="font-medium">{ticket.assigned_to.name}</p>
                <p className="text-sm text-muted-foreground">{ticket.assigned_to.email}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Unassigned</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Description</h2>
          <div className="rounded-lg border bg-card p-4">
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 