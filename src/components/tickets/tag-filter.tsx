'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'
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

interface TagFilterProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [open, setOpen] = useState(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const { supabase } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchAvailableTags() {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) {
        toast({
          title: 'Error fetching tags',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      setAvailableTags(data)
    }

    fetchAvailableTags()
  }, [supabase, toast])

  const addTag = (tagId: string) => {
    onTagsChange([...selectedTags, tagId])
    setOpen(false)
  }

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId))
  }

  const selectedTagObjects = availableTags.filter(tag => selectedTags.includes(tag.id))

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter by Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {availableTags
                  .filter(tag => !selectedTags.includes(tag.id))
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
      {selectedTagObjects.map(tag => (
        <Badge
          key={tag.id}
          style={{
            backgroundColor: tag.color,
            color: getContrastColor(tag.color),
          }}
          className="flex items-center space-x-1"
        >
          <span>{tag.name}</span>
          <button
            onClick={() => removeTag(tag.id)}
            className="ml-1 rounded-full hover:bg-black/10"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
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