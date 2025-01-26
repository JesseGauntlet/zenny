'use client'

import { useEffect, useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { EditTagDialog } from './edit-tag-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Tag {
  id: string
  name: string
  color: string
  description: string | null
  created_at: string
  created_by: string | null
}

export function TagList() {
  const [tags, setTags] = useState<Tag[]>([])
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const fetchTags = async () => {
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

    setTags(data)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: 'Error deleting tag',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Tag deleted',
      description: 'The tag has been successfully deleted.',
    })

    fetchTags()
  }

  useEffect(() => {
    fetchTags()
  }, [])

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Color</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: tag.color }}
                />
              </TableCell>
              <TableCell>{tag.name}</TableCell>
              <TableCell>{tag.description || '-'}</TableCell>
              <TableCell>{new Date(tag.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingTag(tag)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(tag.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditTagDialog
        tag={editingTag}
        open={!!editingTag}
        onOpenChange={(open) => !open && setEditingTag(null)}
        onSuccess={fetchTags}
      />
    </div>
  )
} 