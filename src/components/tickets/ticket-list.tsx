'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Ticket } from '@/types/tickets'

type Customer = {
  email: string
  name: string
}

type Employee = {
  email: string
  name: string
  role: 'admin' | 'agent'
}

type Tag = {
  id: string
  name: string
  color: string
}

interface TicketListProps {
  tickets: Ticket[]
  showCustomerInfo?: boolean
  showAssigneeInfo?: boolean
}

type SortField = 'id' | 'subject' | 'status' | 'priority' | 'created_at' | 'updated_at'
type SortDirection = 'asc' | 'desc'

interface SortableHeaderProps {
  field: SortField
  currentSort: SortField | null
  direction: SortDirection | null
  onSort: (field: SortField) => void
  children: React.ReactNode
}

function SortableHeader({ field, currentSort, direction, onSort, children }: SortableHeaderProps) {
  return (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <span className="w-4">
          {currentSort === field ? (
            direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-50" />
          )}
        </span>
      </div>
    </TableHead>
  )
}

export function TicketList({ 
  tickets: initialTickets, 
  showCustomerInfo = false,
  showAssigneeInfo = false 
}: TicketListProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedTickets = [...initialTickets].sort((a, b) => {
    if (!sortField || !sortDirection) return 0

    const direction = sortDirection === 'asc' ? 1 : -1
    
    switch (sortField) {
      case 'id':
        return direction * a.id.localeCompare(b.id)
      case 'subject':
        return direction * a.subject.localeCompare(b.subject)
      case 'status':
        return direction * a.status.localeCompare(b.status)
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return direction * (priorityOrder[a.priority] - priorityOrder[b.priority])
      }
      case 'created_at':
        return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case 'updated_at':
        return direction * (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
      default:
        return 0
    }
  })

  return (
    <Table>
      <TableHeader>
        <TableRow className="group">
          <SortableHeader field="id" currentSort={sortField} direction={sortDirection} onSort={handleSort}>
            ID
          </SortableHeader>
          <SortableHeader field="subject" currentSort={sortField} direction={sortDirection} onSort={handleSort}>
            Subject
          </SortableHeader>
          {showCustomerInfo && <TableHead>Customer</TableHead>}
          {showAssigneeInfo && <TableHead>Assigned To</TableHead>}
          <SortableHeader field="status" currentSort={sortField} direction={sortDirection} onSort={handleSort}>
            Status
          </SortableHeader>
          <SortableHeader field="priority" currentSort={sortField} direction={sortDirection} onSort={handleSort}>
            Priority
          </SortableHeader>
          <TableHead>Tags</TableHead>
          <SortableHeader field="created_at" currentSort={sortField} direction={sortDirection} onSort={handleSort}>
            Created
          </SortableHeader>
          <SortableHeader field="updated_at" currentSort={sortField} direction={sortDirection} onSort={handleSort}>
            Last Updated
          </SortableHeader>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="font-medium">
              <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                #{ticket.id.substring(0, 7)}
              </Link>
            </TableCell>
            <TableCell>
              <span title={ticket.subject}>
                {ticket.subject.length > 20 ? `${ticket.subject.substring(0, 20)}...` : ticket.subject}
              </span>
            </TableCell>
            {showCustomerInfo && (
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{ticket.customer?.name}</span>
                  <span className="text-sm text-muted-foreground">{ticket.customer?.email}</span>
                </div>
              </TableCell>
            )}
            {showAssigneeInfo && (
              <TableCell>
                {ticket.assigned_to ? (
                  <div className="flex flex-col">
                    <span className="font-medium">{ticket.assigned_to.name}</span>
                    <span className="text-sm text-muted-foreground">{ticket.assigned_to.email}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
            )}
            <TableCell>
              <Badge variant={
                ticket.status === 'open' ? 'default' :
                ticket.status === 'pending' ? 'secondary' : 'outline'
              }>
                {ticket.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={
                ticket.priority === 'high' ? 'destructive' :
                ticket.priority === 'medium' ? 'default' : 'secondary'
              }>
                {ticket.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {ticket.tags?.map(tag => (
                  <Badge
                    key={tag.id}
                    style={{
                      backgroundColor: tag.color,
                      color: getContrastColor(tag.color),
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
            </TableCell>
          </TableRow>
        ))}
        {sortedTickets.length === 0 && (
          <TableRow>
            <TableCell 
              colSpan={showCustomerInfo && showAssigneeInfo ? 8 : showCustomerInfo || showAssigneeInfo ? 7 : 6} 
              className="text-center text-muted-foreground py-8"
            >
              No tickets found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

// Helper function to determine text color based on background color
function getContrastColor(hexcolor: string) {
  // Convert hex to RGB
  const r = parseInt(hexcolor.slice(1, 3), 16)
  const g = parseInt(hexcolor.slice(3, 5), 16)
  const b = parseInt(hexcolor.slice(5, 7), 16)
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
} 