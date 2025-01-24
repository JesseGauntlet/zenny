'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Users, Check, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Team {
  id: string
  name: string
}

interface Employee {
  id: string
  name: string
  email: string
  is_member?: boolean
  is_team_lead?: boolean
}

interface ManageTeamMembersDialogProps {
  team: Team
}

export function ManageTeamMembersDialog({ team }: ManageTeamMembersDialogProps) {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadEmployees() {
      setIsLoading(true)

      // Get all employees
      const { data: allEmployees } = await supabase
        .from('employees')
        .select('id, name, email')
        .order('name')

      // Get current team members
      const { data: teamMembers } = await supabase
        .from('employees_teams')
        .select('employee_id, is_team_lead')
        .eq('team_id', team.id)

      // Combine the data
      const employeesWithMembership = (allEmployees || []).map(employee => ({
        ...employee,
        is_member: teamMembers?.some(m => m.employee_id === employee.id) || false,
        is_team_lead: teamMembers?.find(m => m.employee_id === employee.id)?.is_team_lead || false
      }))

      setEmployees(employeesWithMembership)
      setIsLoading(false)
    }

    if (open) {
      loadEmployees()
    }
  }, [open, team.id, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    // Get current members to compare
    const { data: currentMembers } = await supabase
      .from('employees_teams')
      .select('employee_id, is_team_lead')
      .eq('team_id', team.id)

    const currentMemberIds = new Set(currentMembers?.map(m => m.employee_id) || [])
    const selectedEmployees = employees.filter(e => e.is_member)
    const selectedEmployeeIds = new Set(selectedEmployees.map(e => e.id))

    // Remove employees no longer in the team
    const toRemove = [...currentMemberIds].filter(id => !selectedEmployeeIds.has(id))
    if (toRemove.length > 0) {
      await supabase
        .from('employees_teams')
        .delete()
        .eq('team_id', team.id)
        .in('employee_id', toRemove)
    }

    // Add new team members and update team lead status
    for (const employee of selectedEmployees) {
      if (!currentMemberIds.has(employee.id)) {
        // New member
        await supabase
          .from('employees_teams')
          .insert({
            team_id: team.id,
            employee_id: employee.id,
            is_team_lead: employee.is_team_lead
          })
      } else {
        // Update existing member's team lead status
        await supabase
          .from('employees_teams')
          .update({ is_team_lead: employee.is_team_lead })
          .eq('team_id', team.id)
          .eq('employee_id', employee.id)
      }
    }

    setIsSubmitting(false)
    setOpen(false)
    router.refresh()
  }

  function toggleMember(employeeId: string) {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === employeeId
          ? { ...emp, is_member: !emp.is_member, is_team_lead: false }
          : emp
      )
    )
  }

  function toggleTeamLead(employeeId: string) {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === employeeId && emp.is_member
          ? { ...emp, is_team_lead: !emp.is_team_lead }
          : emp
      )
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Team Members</DialogTitle>
          <DialogDescription>
            Add or remove members from {team.name} and assign team leads.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            {isLoading ? (
              <div className="text-center py-4">Loading employees...</div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between space-x-4 p-2 rounded hover:bg-muted"
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          id={`member-${employee.id}`}
                          checked={employee.is_member}
                          onCheckedChange={() => toggleMember(employee.id)}
                        />
                        <div>
                          <Label htmlFor={`member-${employee.id}`}>
                            {employee.name}
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            {employee.email}
                          </div>
                        </div>
                      </div>

                      {employee.is_member && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTeamLead(employee.id)}
                        >
                          {employee.is_team_lead ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <X className="h-4 w-4 mr-2" />
                          )}
                          Team Lead
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 