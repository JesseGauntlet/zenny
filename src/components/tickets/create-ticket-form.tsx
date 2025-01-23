'use client'

import { useState } from 'react'

type TicketPriority = 'low' | 'medium' | 'high'

export function CreateTicketForm({
  handleSubmit
}: {
  handleSubmit: (formData: FormData) => Promise<void>
}) {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    try {
      const formData = new FormData(event.currentTarget)
      await handleSubmit(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col w-full gap-2 text-foreground">
      <label className="text-md" htmlFor="subject">
        Subject
      </label>
      <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        name="subject"
        placeholder="Enter ticket subject"
        required
      />

      <label className="text-md" htmlFor="description">
        Description
      </label>
      <textarea
        className="rounded-md px-4 py-2 bg-inherit border mb-6 min-h-[100px]"
        name="description"
        placeholder="Describe your issue"
        required
      />

      <label className="text-md" htmlFor="priority">
        Priority
      </label>
      <select
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        name="priority"
        required
        defaultValue="medium"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button
        className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2"
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  )
} 