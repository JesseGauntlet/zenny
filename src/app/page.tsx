import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  console.log('Auth check:', { userId: user?.id, userError })
  
  if (!user || userError) {
    redirect('/auth/login')
  }

  // Check if user is a customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select()
    .eq('id', user.id)
    .single()

  console.log('Customer check:', { 
    userId: user.id,
    customer: customer?.id,
    error: customerError
  })

  // Check if user is an employee
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select()
    .eq('id', user.id)
    .single()

  console.log('Employee check:', {
    userId: user.id,
    employee: employee?.id,
    error: employeeError
  })

  if (!customer && !employee) {
    console.log('Access denied:', {
      hasCustomer: !!customer,
      hasEmployee: !!employee,
      customerError,
      employeeError
    })
    // User is neither a customer nor an employee
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You are not authorized to access this system.</p>
          <pre className="text-sm text-red-500 mt-4">
            {JSON.stringify({
              customerError: customerError?.message,
              employeeError: employeeError?.message
            }, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  // Get tickets based on role
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select(`
      *,
      customer:customer_id (
        name
      )
    `)
    .order('created_at', { ascending: false })
    // If customer, only show their tickets
    .eq(customer ? 'customer_id' : 'assigned_employee_id', user.id)

  console.log('Tickets fetch:', {
    count: tickets?.length,
    error: ticketsError
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {customer ? 'My Support Tickets' : 'Assigned Tickets'}
        </h1>
        {customer && (
          <Button asChild>
            <Link href="/tickets/new">New Ticket</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {tickets?.map((ticket) => (
          <Link 
            key={ticket.id} 
            href={`/tickets/${ticket.id}`}
            className="block p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{ticket.subject}</h2>
                <p className="text-muted-foreground line-clamp-2">{ticket.description}</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  {customer ? 'Ticket ID: ' : 'From: '} 
                  {customer ? ticket.id : ticket.customer?.name}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                  ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 
                    ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-gray-100 text-gray-700'}`}
                >
                  {ticket.status}
                </span>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                  ${
                    ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}
                >
                  {ticket.priority}
                </span>
              </div>
            </div>
          </Link>
        ))}

        {(!tickets || tickets.length === 0) && (
          <div className="text-center p-12 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">No tickets yet</h3>
            <p className="text-muted-foreground mb-4">
              {customer ? 'Create your first ticket to get started' : 'No tickets assigned to you'}
            </p>
            {customer && (
              <Button asChild>
                <Link href="/tickets/new">Create Ticket</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
