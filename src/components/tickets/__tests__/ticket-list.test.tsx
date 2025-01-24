import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TicketList, type Ticket } from '../ticket-list'

describe('TicketList', () => {
  const mockTickets: Ticket[] = [
    {
      id: '1',
      subject: 'Test Ticket',
      description: 'Test description',
      status: 'open',
      priority: 'high',
      customer_id: 'test-customer-id',
      customer: {
        email: 'customer@example.com',
        name: 'Test Customer'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  it('renders tickets correctly', () => {
    render(<TicketList tickets={mockTickets} showCustomerInfo={false} />)
    
    expect(screen.getByText('Test Ticket')).toBeInTheDocument()
    expect(screen.getByText('open')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('shows customer info when showCustomerInfo is true', () => {
    render(<TicketList tickets={mockTickets} showCustomerInfo={true} />)
    
    expect(screen.getByText('Test Customer')).toBeInTheDocument()
    expect(screen.getByText('customer@example.com')).toBeInTheDocument()
  })

  it('hides customer info when showCustomerInfo is false', () => {
    render(<TicketList tickets={mockTickets} showCustomerInfo={false} />)
    
    expect(screen.queryByText('Test Customer')).not.toBeInTheDocument()
    expect(screen.queryByText('customer@example.com')).not.toBeInTheDocument()
  })

  it('displays empty state when no tickets', () => {
    render(<TicketList tickets={[]} showCustomerInfo={false} />)
    
    expect(screen.getByText('No tickets found')).toBeInTheDocument()
  })
}) 