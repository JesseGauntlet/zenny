import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TeamsClient } from './teams-client'

export default async function TeamsPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    redirect('/auth/login')
  }

  // Check if user is an admin
  const { data: employee } = await supabase
    .from('employees')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!employee || employee.role !== 'admin') {
    redirect('/tickets')
  }

  // Get teams with member counts
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      members:employees_teams(
        count
      )
    `)
    .order('name')

  return <TeamsClient initialTeams={teams || []} />
} 