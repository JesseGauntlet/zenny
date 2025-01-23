import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default async function AgentTicketPage({
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

  // Verify the user is an employee
  const { data: employee } = await supabase
    .from('employees')
    .select()
    .eq('id', session.user.id)
    .single()

  if (!employee) {
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
        sender_type: 'employee'
      })

    if (error) {
      return redirect(`/dashboard/agent/tickets/${params.id}?error=${error.message}`)
    }

    // Redirect to the same page to refresh the messages
    return redirect(`/dashboard/agent/tickets/${params.id}`)
  }

  async function updateStatus(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return redirect('/auth/login')
    }

    const status = formData.get('status') as 'open' | 'pending' | 'closed'
    
    const { error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', params.id)

    if (error) {
      return redirect(`/dashboard/agent/tickets/${params.id}?error=${error.message}`)
    }

    // Redirect to the same page to refresh
    return redirect(`/dashboard/agent/tickets/${params.id}`)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{ticket.subject}</h1>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div>Status: {ticket.status}</div>
              <div>Priority: {ticket.priority}</div>
            </div>
          </div>
          <form action={updateStatus} className="flex items-center gap-2">
            <Select name="status" defaultValue={ticket.status}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" size="sm">Update Status</Button>
          </form>
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
                  {message.sender_type === 'customer' ? ticket.customer?.name : 'Support Agent'}
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