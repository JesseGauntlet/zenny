'use client'

import { useRouter } from 'next/navigation'
import { TagFilter } from './tag-filter'

interface TicketFiltersProps {
  status?: string
  priority?: string
  tags?: string[]
}

export function TicketFilters({ status, priority, tags = [] }: TicketFiltersProps) {
  const router = useRouter()

  const handleStatusChange = (value: string) => {
    const url = new URL(window.location.href)
    if (value) {
      url.searchParams.set('status', value)
    } else {
      url.searchParams.delete('status')
    }
    router.push(url.toString())
  }

  const handlePriorityChange = (value: string) => {
    const url = new URL(window.location.href)
    if (value) {
      url.searchParams.set('priority', value)
    } else {
      url.searchParams.delete('priority')
    }
    router.push(url.toString())
  }

  const handleTagsChange = (selectedTags: string[]) => {
    const url = new URL(window.location.href)
    if (selectedTags.length > 0) {
      url.searchParams.set('tags', selectedTags.join(','))
    } else {
      url.searchParams.delete('tags')
    }
    router.push(url.toString())
  }

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <select
        className="rounded-md px-4 py-2 bg-inherit border"
        onChange={(e) => handleStatusChange(e.target.value)}
        value={status || ''}
        aria-label="status"
      >
        <option value="">All Status</option>
        <option value="open">Open</option>
        <option value="pending">Pending</option>
        <option value="closed">Closed</option>
      </select>

      <select
        className="rounded-md px-4 py-2 bg-inherit border"
        onChange={(e) => handlePriorityChange(e.target.value)}
        value={priority || ''}
        aria-label="priority"
      >
        <option value="">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <TagFilter
        selectedTags={tags}
        onTagsChange={handleTagsChange}
      />
    </div>
  )
} 