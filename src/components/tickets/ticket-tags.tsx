'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlusCircle, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import type { Database } from '@/types/database.types'

type Tag = Database['public']['Tables']['tags']['Row']
type TicketTag = Database['public']['Tables']['ticket_tags']['Row'] & {
  tag: Tag
}

interface TicketTagsProps {
  ticketId: string
  isEmployee: boolean
}

export function TicketTags({ ticketId, isEmployee }: TicketTagsProps) {
  const [ticketTags, setTicketTags] = useState<TicketTag[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [open, setOpen] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  // Fetch ticket tags
  useEffect(() => {
    async function fetchTicketTags() {
      const { data, error } = await supabase
        .from('ticket_tags')
        .select('*, tag:tags(*)')
        .eq('ticket_id', ticketId)

      if (error) {
        toast({
          title: 'Error fetching tags',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      setTicketTags(data)
    }

    fetchTicketTags()
  }, [ticketId, supabase, toast])

  // Fetch available tags
  useEffect(() => {
    async function fetchAvailableTags() {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) {
        toast({
          title: 'Error fetching available tags',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      setAvailableTags(data)
    }

    fetchAvailableTags()
  }, [supabase, toast])

  const addTag = async (tagId: string) => {
    const { error } = await supabase
      .from('ticket_tags')
      .insert({ ticket_id: ticketId, tag_id: tagId })

    if (error) {
      toast({
        title: 'Error adding tag',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    // Refresh ticket tags
    const { data, error: fetchError } = await supabase
      .from('ticket_tags')
      .select('*, tag:tags(*)')
      .eq('ticket_id', ticketId)

    if (fetchError) {
      toast({
        title: 'Error refreshing tags',
        description: fetchError.message,
        variant: 'destructive',
      })
      return
    }

    setTicketTags(data)
    setOpen(false)
  }

  const removeTag = async (tagId: string) => {
    const { error } = await supabase
      .from('ticket_tags')
      .delete()
      .eq('ticket_id', ticketId)
      .eq('tag_id', tagId)

    if (error) {
      toast({
        title: 'Error removing tag',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    setTicketTags(ticketTags.filter(tt => tt.tag_id !== tagId))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Tags</h3>
        {isEmployee && (
          <Popover modal open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="right" align="start">
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandList>
                  <CommandEmpty>No tags found.</CommandEmpty>
                  <CommandGroup>
                    {availableTags
                      .filter(tag => !ticketTags.some(tt => tt.tag_id === tag.id))
                      .map(tag => (
                        <CommandItem
                          key={tag.id}
                          value={tag.id}
                          onSelect={() => addTag(tag.id)}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span>{tag.name}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {ticketTags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags</p>
        ) : (
          ticketTags.map(({ tag, tag_id }) => (
            <Badge
              key={tag_id}
              style={{
                backgroundColor: tag.color,
                color: getContrastColor(tag.color),
              }}
              className="flex items-center space-x-1"
            >
              <span>{tag.name}</span>
              {isEmployee && (
                <button
                  onClick={() => removeTag(tag_id)}
                  className="ml-1 rounded-full hover:bg-black/10"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))
        )}
      </div>
    </div>
  )
}

// Helper function to determine text color based on background color
function getContrastColor(hexcolor: string) {
  // Convert hex to RGB
  const r = parseInt(hexcolor.slice(1, 3), 16)
  const g = parseInt(hexcolor.slice(3, 5), 16)
  const b = parseInt(hexcolor.slice(5, 7), 16)
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
} 