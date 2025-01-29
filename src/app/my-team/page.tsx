import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageContainer } from '@/components/layout/page-container'

interface Employee {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'agent'
}

interface Team {
  id: string
  name: string
  description: string | null
  members: Array<{
    employee: Employee
  }>
}

interface DatabaseResponse {
  team: {
    id: string
    name: string
    description: string
    members: Array<{
      employee: Employee
    }>
  }
}

export default async function MyTeamPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    redirect('/auth/login')
  }

  // Check if user is an employee
  const { data: employee } = await supabase
    .from('employees')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!employee) {
    redirect('/tickets')
  }

  // Get user's team information
  const { data } = await supabase
    .from('employees_teams')
    .select(`
      team:teams (
        id,
        name,
        description,
        members:employees_teams (
          employee:employees (
            id,
            email,
            name,
            role
          )
        )
      )
    `)
    .eq('employee_id', user.id)
    .single()

  if (!data?.team) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-bold mb-6">My Team</h1>
        <Card>
          <CardHeader>
            <CardTitle>My Team</CardTitle>
            <CardDescription>You are not currently assigned to any team.</CardDescription>
          </CardHeader>
        </Card>
      </PageContainer>
    )
  }

  const response = data as unknown as DatabaseResponse
  const team: Team = {
    id: response.team.id,
    name: response.team.name,
    description: response.team.description,
    members: response.team.members
  }

  const teamMembers = team.members.map(m => m.employee)

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">My Team</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
            <CardDescription>{team.description || 'No description available'}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Your colleagues in {team.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {member.name?.[0] || member.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name || member.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
} 