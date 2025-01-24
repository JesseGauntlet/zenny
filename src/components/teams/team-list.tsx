'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { EditTeamDialog } from './edit-team-dialog'
import { ManageTeamMembersDialog } from './manage-team-members-dialog'
import { formatDistanceToNow } from 'date-fns'

interface Team {
  id: string
  name: string
  description: string | null
  coverage_hours: Record<string, { start: string; end: string }>
  created_at: string
  updated_at: string
  members: { count: number }[]
}

interface TeamListProps {
  teams: Team[]
}

export function TeamList({ teams }: TeamListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell>{team.description}</TableCell>
              <TableCell>{team.members[0]?.count || 0} members</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(team.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <ManageTeamMembersDialog team={team} />
                <EditTeamDialog team={team} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 