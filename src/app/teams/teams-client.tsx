'use client'

import { useState } from 'react'
import { CreateTeamDialog } from '@/components/teams/create-team-dialog'
import { EditTeamDialog } from '@/components/teams/edit-team-dialog'
import { TeamAssignments } from '@/components/teams/team-assignments'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/page-container'

export interface Team {
  id: string
  name: string
  description: string | null
  coverage_hours?: Record<string, { start: string; end: string }>
  created_at?: string
  updated_at?: string
}

interface TeamsClientProps {
  initialTeams: Team[]
}

export function TeamsClient({ initialTeams }: TeamsClientProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams)

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <CreateTeamDialog 
          onTeamCreated={(newTeam: Team) => setTeams([...teams, newTeam])} 
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[300px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>{team.name}</TableCell>
              <TableCell>{team.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <EditTeamDialog 
                    team={team} 
                    onTeamUpdated={(updatedTeam: Team) => {
                      setTeams(teams.map(t => 
                        t.id === updatedTeam.id ? updatedTeam : t
                      ))
                    }} 
                  />
                  <TeamAssignments team={team} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageContainer>
  )
} 