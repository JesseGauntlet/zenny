'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { cn } from '@/lib/utils'

type Note = {
  id: string
  ticket_id: string
  employee_id: string
  content: string
  created_at: string
  updated_at: string
  employee?: {
    name: string
    email: string
  }
}

interface TicketNotesProps {
  ticketId: string
  notes: Note[]
  currentUserId: string
}

export function TicketNotes({ ticketId, notes: initialNotes, currentUserId }: TicketNotesProps) {
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new notes
    const channel = supabase
      .channel('ticket_notes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_notes',
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          const { data: newNote } = await supabase
            .from('ticket_notes')
            .select(`
              *,
              employee:employees(
                name,
                email
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (newNote) {
            setNotes(prev => [...prev, newNote])
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
    if (!newNote.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    const { error } = await supabase
      .from('ticket_notes')
      .insert({
        ticket_id: ticketId,
        employee_id: currentUserId,
        content: newNote,
      })

    if (error) {
      console.error('Error adding note:', error)
      setIsSubmitting(false)
      return
    }

    setNewNote('')
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              'rounded-lg p-4',
              note.employee_id === currentUserId
                ? 'bg-primary/10 ml-8'
                : 'bg-muted mr-8'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{note.employee?.name}</div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
              </div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: note.content }} />
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <RichTextEditor
          value={newNote}
          onChange={setNewNote}
          placeholder="Add an internal note..."
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Note'}
        </Button>
      </form>
    </div>
  )
} 