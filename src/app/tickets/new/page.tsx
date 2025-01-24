import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function NewTicketPage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    redirect('/auth/login')
  }

  // Server action to create ticket
  async function createTicket(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user || userError) {
      throw new Error('Not authenticated')
    }

    const { error } = await supabase
      .from('tickets')
      .insert({
        subject: formData.get('subject'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        status: 'open',
        customer_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error creating ticket:', error)
      throw new Error('Failed to create ticket')
    }

    redirect('/tickets')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Ticket</h1>
        <Link href="/tickets">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <form action={createTicket} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              className="w-full rounded-md border p-2"
              placeholder="Brief description of your issue"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              className="w-full rounded-md border p-2"
              placeholder="Detailed explanation of your issue"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              required
              className="w-full rounded-md border p-2"
              defaultValue="low"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href="/tickets">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit">
              Create Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 