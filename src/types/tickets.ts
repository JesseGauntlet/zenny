import type { Database } from './database.types'

export type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  customer?: {
    id: string
    email: string
    name: string
    created_at: string
  }
}

export interface TicketListProps {
  tickets: Ticket[]
  showCustomerInfo?: boolean
} 