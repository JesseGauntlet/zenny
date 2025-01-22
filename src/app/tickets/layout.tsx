import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function TicketLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div>
      {children}
    </div>
  )
} 