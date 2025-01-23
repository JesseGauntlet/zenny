import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { CreateTicketForm } from '@/components/tickets/create-ticket-form'

async function handleSubmit(formData: FormData) {
  'use server'

  const subject = formData.get('subject') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as 'low' | 'medium' | 'high'

  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return redirect('/auth/login?error=' + encodeURIComponent('Please login to create tickets'))
  }

  // Create the ticket
  const { error: ticketError } = await supabase
    .from('tickets')
    .insert({
      subject,
      description,
      priority,
      customer_id: user.id,
      status: 'open'
    })

  if (ticketError) {
    console.error('Error creating ticket:', ticketError)
    return redirect('/tickets/new?error=' + encodeURIComponent(ticketError.message))
  }

  return redirect('/tickets?message=Ticket created successfully!')
}

export default function NewTicketPage() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <h1 className="text-2xl font-bold mb-4">Create New Ticket</h1>
      <CreateTicketForm handleSubmit={handleSubmit} />
    </div>
  )
} 