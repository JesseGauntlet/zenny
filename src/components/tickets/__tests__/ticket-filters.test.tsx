import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TicketFilters } from '../ticket-filters'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

describe('TicketFilters', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    // Setup router mock
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    // Setup window.location
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000/tickets' },
      writable: true
    })
  })

  it('renders status and priority filters', () => {
    render(<TicketFilters />)
    
    expect(screen.getByText('All Status')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
    
    expect(screen.getByText('All Priority')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('shows selected status and priority', () => {
    render(<TicketFilters status="open" priority="high" />)
    
    const statusSelect = screen.getByLabelText('status') as HTMLSelectElement
    const prioritySelect = screen.getByLabelText('priority') as HTMLSelectElement
    
    expect(statusSelect.value).toBe('open')
    expect(prioritySelect.value).toBe('high')
  })

  it('updates URL when status changes', () => {
    render(<TicketFilters />)
    
    const statusSelect = screen.getByLabelText('status')
    fireEvent.change(statusSelect, { target: { value: 'open' } })
    
    expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/tickets?status=open')
  })

  it('updates URL when priority changes', () => {
    render(<TicketFilters />)
    
    const prioritySelect = screen.getByLabelText('priority')
    fireEvent.change(prioritySelect, { target: { value: 'high' } })
    
    expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/tickets?priority=high')
  })

  it('removes parameter from URL when selecting "All"', () => {
    render(<TicketFilters status="open" priority="high" />)
    
    const statusSelect = screen.getByLabelText('status')
    fireEvent.change(statusSelect, { target: { value: '' } })
    
    expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/tickets')
  })

  it('preserves other parameters when updating filters', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000/tickets?status=open' },
      writable: true
    })
    
    render(<TicketFilters status="open" />)
    
    const prioritySelect = screen.getByLabelText('priority')
    fireEvent.change(prioritySelect, { target: { value: 'high' } })
    
    expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/tickets?status=open&priority=high')
  })
}) 