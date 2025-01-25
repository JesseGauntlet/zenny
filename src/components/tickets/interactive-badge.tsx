'use client'

import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

interface Option {
  value: string
  label: string
}

interface InteractiveBadgeProps {
  type: 'status' | 'priority' | 'assign'
  currentValue: string
  currentLabel?: string
  options: Option[]
  ticketId: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function InteractiveBadge({ 
  type, 
  currentValue, 
  currentLabel, 
  options, 
  ticketId,
  variant = 'default' 
}: InteractiveBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = async (value: string) => {
    const supabase = createClient()
    
    const updates: Record<string, any> = {}
    if (type === 'status') updates.status = value
    if (type === 'priority') updates.priority = value
    if (type === 'assign') updates.assigned_employee_id = value || null

    await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)

    setIsOpen(false)
    window.location.reload() // Refresh to show changes
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Badge
        variant={variant}
        className="cursor-pointer hover:opacity-80 capitalize"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentLabel || currentValue}
      </Badge>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-background border">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                className={`
                  w-full px-4 py-2 text-sm text-left hover:bg-muted
                  ${currentValue === option.value ? 'bg-muted' : ''}
                `}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 