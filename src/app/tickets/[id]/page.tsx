import { createClient } from '@/lib/supabase'
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

  // Fetch ticket with messages
  const { data: ticket } = await supabase
    .from('tickets')
    .select(`
      *,
      ticket_messages(
        id,
        content,
        created_at,
        sender_id
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
      })

    if (error) {
      return redirect(`/tickets/${params.id}?error=${error.message}`)
    }

    // Redirect to the same page to refresh the messages
    return redirect(`/tickets/${params.id}`)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{ticket.subject}</h1>
              <p className="text-muted-foreground">{ticket.description}</p>
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
          <div className="text-sm text-muted-foreground">
            Created {format(new Date(ticket.created_at), 'PPpp')}
          </div>
        </div>

        <div className="space-y-6">
          {ticket.ticket_messages.map((message: any) => (
            <div
              key={message.id}
              className="p-4 rounded-lg border bg-card"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium">
                  {message.sender_id === session.user.id ? 'You' : 'Support Agent'}
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