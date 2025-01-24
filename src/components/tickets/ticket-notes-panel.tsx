'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { TicketNotes } from './ticket-notes'
import { StickyNote } from 'lucide-react'

interface TicketNotesPanelProps {
  ticketId: string
  notes: any[]
  currentUserId: string
}

export function TicketNotesPanel({ ticketId, notes, currentUserId }: TicketNotesPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <StickyNote className="h-4 w-4" />
          Internal Notes
          {notes.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
              {notes.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Internal Notes</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <TicketNotes
            ticketId={ticketId}
            notes={notes}
            currentUserId={currentUserId}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
} 