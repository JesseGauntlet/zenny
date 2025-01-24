'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
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

export function TicketMessages({ ticketId, messages: initialMessages, currentUserId, userRole }: TicketMessagesProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel('ticket_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          // Fetch the complete message with sender info based on sender_type
          const { data: newMessage } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('id', payload.new.id)
            .maybeSingle();

          if (newMessage) {
            // Fetch sender info based on sender_type
            const { data: senderData } = await supabase
              .from(newMessage.sender_type === 'customer' ? 'customers' : 'employees')
              .select('name, email')
              .eq('id', newMessage.sender_id)
              .single();

            setMessages(prev => [...prev, {
              ...newMessage,
              sender: senderData
            }])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, supabase])

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
        <TiptapEditor
          content={newMessage}
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