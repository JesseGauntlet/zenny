import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'

export default async function TicketPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return redirect('/auth/login')
  }

  // Verify the user is a customer
  const { data: customer } = await supabase
    .from('customers')
    .select()
    .eq('id', session.user.id)
    .single()

  if (!customer) {
    return redirect('/')
  }

  // Fetch ticket with messages
  const { data: ticket } = await supabase
    .from('tickets')
    .select(`
      *,
      customer:customer_id (
        name
      ),
      ticket_messages (
        id,
        content,
        created_at,
        sender_id,
        sender_type
      )
    `)
    .eq('id', params.id)
    .single()

  if (!ticket) {
    return notFound()
  }

  // Verify user owns the ticket
  if (ticket.customer_id !== session.user.id) {
    return redirect('/')
  }

  async function addMessage(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return redirect('/auth/login')
    }

    const content = formData.get('content') as string
    
    const { error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: params.id,
        content,
        sender_id: session.user.id,
        sender_type: 'customer'
      })

    if (error) {
      return redirect(`/tickets/${params.id}?error=${error.message}`)
    }

    // Redirect to the same page to refresh the messages
    return redirect(`/tickets/${params.id}`)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{ticket.subject}</h1>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div>Status: {ticket.status}</div>
            <div>Priority: {ticket.priority}</div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium">
              {ticket.customer?.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(ticket.created_at), 'PPpp')}
            </div>
          </div>
          <p className="whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div className="space-y-6">
          {ticket.ticket_messages.map((message: any) => (
            <div
              key={message.id}
              className="p-4 rounded-lg border bg-card"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium">
                  {message.sender_type === 'customer' ? 'You' : 'Support Agent'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(message.created_at), 'PPpp')}
                </div>
              </div>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}

          <form action={addMessage} className="space-y-4">
            <Textarea
              name="content"
              placeholder="Type your message here..."
              required
              rows={3}
            />
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 