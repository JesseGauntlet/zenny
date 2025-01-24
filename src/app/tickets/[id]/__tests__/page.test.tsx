import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import TicketPage from '../page'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>
}))

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('TicketPage', () => {
  const mockTicket = {
    id: '123',
    subject: 'Test Ticket',
    description: 'Test description',
    status: 'open',
    priority: 'high',
    customer_id: 'customer-123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      name: 'Test Customer',
      email: 'customer@example.com'
    },
    assigned_to: {
      name: 'Test Employee',
      email: 'employee@example.com',
      role: 'agent'
    }
  }

  const mockEmployees = [
    {
      id: 'emp-1',
      name: 'Test Employee',
      email: 'employee@example.com',
      role: 'agent'
    },
    {
      id: 'emp-2',
      name: 'Another Employee',
      email: 'another@example.com',
      role: 'agent'
    }
  ]

  const createMockSupabase = (overrides = {}) => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { 
          user: null 
        }, 
        error: null 
      })
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ 
      data: null, 
      error: null 
    }),
    order: jest.fn().mockResolvedValue({ 
      data: null, 
      error: null 
    }),
    ...overrides
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to login if user is not authenticated', async () => {
    const mockSupabase = createMockSupabase()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    await TicketPage({ params: { id: '123' } })

    expect(redirect).toHaveBeenCalledWith('/auth/login')
  })

  it('redirects to tickets list if customer tries to access another customer\'s ticket', async () => {
    const mockSupabase = createMockSupabase({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'wrong-customer',
              user_metadata: { role: 'customer' }
            }
          },
          error: null
        })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockTicket, error: null })
    })
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    await TicketPage({ params: { id: '123' } })

    expect(redirect).toHaveBeenCalledWith('/tickets')
  })

  it('allows employee to access any ticket', async () => {
    const mockSupabase = createMockSupabase({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'employee-123',
              user_metadata: { role: 'employee' }
            }
          },
          error: null
        })
      },
      from: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTicket, error: null }),
        order: jest.fn().mockResolvedValue({ data: mockEmployees, error: null })
      }))
    })
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    const { container } = await render(
      await TicketPage({ params: { id: '123' } })
    )

    expect(container).toBeInTheDocument()
    expect(screen.getByText(mockTicket.subject)).toBeInTheDocument()
    
    // Find customer section and check within it
    const customerSection = screen.getByText('Customer').parentElement
    expect(within(customerSection!).getByText(mockTicket.customer.name)).toBeInTheDocument()
    
    // Find assigned section and check within it
    const assignedSection = screen.getByText('Assigned To').parentElement
    expect(within(assignedSection!).getByText(mockTicket.assigned_to.name)).toBeInTheDocument()
  })

  it('shows "Ticket Not Found" for non-existent ticket', async () => {
    const mockSupabase = createMockSupabase({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'employee-123',
              user_metadata: { role: 'employee' }
            }
          },
          error: null
        })
      },
      from: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        order: jest.fn().mockResolvedValue({ data: mockEmployees, error: null })
      }))
    })
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    await render(
      await TicketPage({ params: { id: 'non-existent' } })
    )

    expect(screen.getByText('Ticket Not Found')).toBeInTheDocument()
  })

  it('shows status update form for employees only', async () => {
    const mockSupabase = createMockSupabase({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'employee-123',
              user_metadata: { role: 'employee' }
            }
          },
          error: null
        })
      },
      from: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTicket, error: null }),
        order: jest.fn().mockResolvedValue({ data: mockEmployees, error: null })
      }))
    })
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    await render(
      await TicketPage({ params: { id: '123' } })
    )

    expect(screen.getByRole('button', { name: 'Update Status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Assign' })).toBeInTheDocument()
  })
}) 