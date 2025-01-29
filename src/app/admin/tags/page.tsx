'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TagList } from '@/components/tags/tag-list'
import { CreateTagDialog } from '@/components/tags/create-tag-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/components/providers/supabase-provider'
import { redirect } from 'next/navigation'
import { PageContainer } from '@/components/layout/page-container'

export default function TagsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { supabase, session } = useSupabase()
  const { toast } = useToast()

  // Check if user is employee, if not redirect to home
  useEffect(() => {
    async function checkAccess() {
      if (!session?.user) {
        redirect('/auth/login')
      }

      const { data: employee } = await supabase
        .from('employees')
        .select()
        .eq('id', session.user.id)
        .single()

      if (!employee) {
        redirect('/')
      }
    }

    checkAccess()
  }, [session, supabase])

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tag Management</h1>
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
    </PageContainer>
  )
} 