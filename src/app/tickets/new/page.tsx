import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default function NewTicketPage() {
  async function createTicket(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return redirect('/auth/login')
    }

    const { error } = await supabase
      .from('tickets')
      .insert({
        subject: formData.get('subject'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        customer_id: session.user.id,
      })

    if (error) {
      return redirect('/tickets/new?error=' + error.message)
    }

    return redirect('/')
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Ticket</h1>
        
        <form action={createTicket} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <Input
              id="subject"
              name="subject"
              placeholder="Brief description of your issue"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detailed explanation of your issue"
              required
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Priority
            </label>
            <Select name="priority" defaultValue="low">
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Create Ticket
          </Button>
        </form>
      </div>
    </div>
  )
} 