import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  // Get tickets with customer information
  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      *,
      customer:customer_id (
        name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <Button asChild>
          <Link href="/tickets/new">New Ticket</Link>
        </Button>
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
                  Submitted by: {ticket.customer?.name || ticket.customer?.email}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                  ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
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
            <p className="text-muted-foreground mb-4">Create your first ticket to get started</p>
            <Button asChild>
              <Link href="/tickets/new">Create Ticket</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
