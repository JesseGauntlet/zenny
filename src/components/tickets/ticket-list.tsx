'use client'

import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Customer = {
  email: string
  name: string
}

type Employee = {
  email: string
  name: string
  role: 'admin' | 'agent'
}

export type Ticket = {
  id: string
  subject: string
  description: string
  status: 'open' | 'pending' | 'closed'
  priority: 'low' | 'medium' | 'high'
  customer_id: string
  customer: Customer | null
  assigned_employee_id?: string
  assigned_team_id?: string
  assigned_to?: Employee | null
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  closed_at?: string
}

interface TicketListProps {
  tickets: Ticket[]
  showCustomerInfo?: boolean
  showAssigneeInfo?: boolean
}

export function TicketList({ 
  tickets, 
  showCustomerInfo = false,
  showAssigneeInfo = false 
}: TicketListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Subject</TableHead>
          {showCustomerInfo && <TableHead>Customer</TableHead>}
          {showAssigneeInfo && <TableHead>Assigned To</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Last Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="font-medium">
              <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                #{ticket.id}
              </Link>
            </TableCell>
            <TableCell>{ticket.subject}</TableCell>
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
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
            </TableCell>
          </TableRow>
        ))}
        {tickets.length === 0 && (
          <TableRow>
            <TableCell 
              colSpan={showCustomerInfo && showAssigneeInfo ? 7 : showCustomerInfo || showAssigneeInfo ? 6 : 5} 
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