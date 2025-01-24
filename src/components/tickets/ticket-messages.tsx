'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  ticket_id: string
  sender_id: string
  sender_type: 'customer' | 'employee'
  content: string
  attachments: any
  created_at: string
  updated_at: string
  sender?: {
    name: string
    email: string
  }
}

interface TicketMessagesProps {
  ticketId: string
  messages: Message[]
  currentUserId: string
  userRole: 'customer' | 'employee'
}

export function TicketMessages({ ticketId, messages, currentUserId, userRole }: TicketMessagesProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    const { error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: currentUserId,
        sender_type: userRole,
        content: newMessage,
      })

    if (error) {
      console.error('Error sending message:', error)
      setIsSubmitting(false)
      return
    }

    setNewMessage('')
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'rounded-lg p-4',
              message.sender_id === currentUserId
                ? 'bg-primary/10 ml-8'
                : 'bg-muted mr-8'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{message.sender?.name}</div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: message.content }} />
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <RichTextEditor
          value={newMessage}
          onChange={setNewMessage}
          placeholder="Type your message..."
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  )
} 