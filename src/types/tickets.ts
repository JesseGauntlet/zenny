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

export interface TicketPageParams {
  id: string
}

export interface TicketSearchParams {
  status?: string
  priority?: string
}

export interface TicketPageProps {
  params: Promise<TicketPageParams>
  searchParams?: Promise<TicketSearchParams>
}

export interface TicketListPageProps {
  params?: Promise<Record<string, string>>
  searchParams: Promise<TicketSearchParams>
} 