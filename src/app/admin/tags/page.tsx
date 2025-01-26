'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TagList } from '@/components/tags/tag-list'
import { CreateTagDialog } from '@/components/tags/create-tag-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/components/providers/supabase-provider'
import { redirect } from 'next/navigation'

export default function TagsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { supabase, session } = useSupabase()
  const { toast } = useToast()

  // Check if user is employee, if not redirect to home
  useEffect(() => {
    const checkAccess = async () => {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('id', session?.user.id)
        .single()

      if (!employee) {
        redirect('/')
      }
    }

    checkAccess()
  }, [session, supabase])

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tag Management</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Tag
        </Button>
      </div>

      <TagList />
      
      <CreateTagDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
} 