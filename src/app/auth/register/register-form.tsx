'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React, { useEffect } from 'react'

export function RegisterForm({ handleSubmit }: { handleSubmit: (formData: FormData) => Promise<void> }) {
  // Set default role in hidden input on mount
  useEffect(() => {
    const input = document.getElementById('roleInput') as HTMLInputElement
    if (input) input.value = 'customer'
  }, [])

  return (
    <form
      className="animate-in flex-1 flex flex-col w-full justify-center gap-6 text-foreground"
      action={handleSubmit}
    >
      <div className="flex flex-col gap-2">
        <label className="text-muted-foreground" htmlFor="name">
          Name
        </label>
        <Input
          className="rounded-md px-4 py-2 bg-inherit border"
          name="name"
          placeholder="Your name"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-muted-foreground" htmlFor="email">
          Email
        </label>
        <Input
          className="rounded-md px-4 py-2 bg-inherit border"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-muted-foreground" htmlFor="password">
          Password
        </label>
        <Input
          className="rounded-md px-4 py-2 bg-inherit border"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-muted-foreground" htmlFor="role">
          Role
        </label>
        <input type="hidden" name="role" id="roleInput" defaultValue="customer" />
        <Select 
          defaultValue="customer"
          onValueChange={(value) => {
            const input = document.getElementById('roleInput') as HTMLInputElement
            if (input) input.value = value
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="mt-4">
        Register
      </Button>
    </form>
  )
} 