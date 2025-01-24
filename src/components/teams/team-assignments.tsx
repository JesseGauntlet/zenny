'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Employee {
  id: string
  email: string
  role: 'admin' | 'agent'
  name?: string
}

interface Team {
  id: string
  name: string
  description: string
}

interface TeamAssignmentsProps {
  team: Team
}

export function TeamAssignments({ team }: TeamAssignmentsProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadTeamMembers() {
      setIsLoading(true)
      try {
        // Get all employees
        const { data: allEmployees, error: employeesError } = await supabase
          .from('employees')
          .select('*')
        
        if (employeesError) throw employeesError

        // Get current team members
        const { data: teamMembers, error: teamError } = await supabase
          .from('employees_teams')
          .select('employee_id')
          .eq('team_id', team.id)

        if (teamError) throw teamError

        // Set the employees and selected members
        setEmployees(allEmployees || [])
        setSelectedEmployees(new Set(teamMembers?.map(tm => tm.employee_id)))
      } catch (error) {
        console.error('Error loading team members:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      loadTeamMembers()
    }
  }, [open, team.id, supabase])

  async function handleSubmit() {
    try {
      // Get current team members
      const { data: currentMembers } = await supabase
        .from('employees_teams')
        .select('employee_id')
        .eq('team_id', team.id)

      const currentMemberIds = new Set(currentMembers?.map(m => m.employee_id) || [])
      const selectedMemberIds = new Set(selectedEmployees)

      // Find members to add and remove
      const toAdd = [...selectedMemberIds].filter(id => !currentMemberIds.has(id))
      const toRemove = [...currentMemberIds].filter(id => !selectedMemberIds.has(id))

      // Remove members
      if (toRemove.length > 0) {
        await supabase
          .from('employees_teams')
          .delete()
          .eq('team_id', team.id)
          .in('employee_id', toRemove)
      }

      // Add new members
      if (toAdd.length > 0) {
        await supabase
          .from('employees_teams')
          .insert(toAdd.map(employeeId => ({
            team_id: team.id,
            employee_id: employeeId
          })))
      }

      setOpen(false)
    } catch (error) {
      console.error('Error updating team members:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Members</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Team Members - {team.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id={employee.id}
                    checked={selectedEmployees.has(employee.id)}
                    onCheckedChange={(checked) => {
                      const newSelected = new Set(selectedEmployees)
                      if (checked) {
                        newSelected.add(employee.id)
                      } else {
                        newSelected.delete(employee.id)
                      }
                      setSelectedEmployees(newSelected)
                    }}
                  />
                  <label
                    htmlFor={employee.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {employee.name || employee.email} ({employee.role})
                  </label>
                </div>
              ))}
            </ScrollArea>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 