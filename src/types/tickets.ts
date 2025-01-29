import type { Database } from './database.types'

export type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  customer?: {
    id: string
    email: string
    name: string
    created_at: string
  } | null
  assigned_to?: {
    email: string
    name: string
    role: string
  } | null
  tags: {
    id: string
    name: string
    color: string
  }[]
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
  tags?: string[]
}

export interface TicketPageProps {
  params: Promise<TicketPageParams>
  searchParams?: Promise<TicketSearchParams>
}

export interface TicketListPageProps {
  params?: Promise<Record<string, string>>
  searchParams: Promise<TicketSearchParams>
} 