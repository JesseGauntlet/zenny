'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'
import { useEffect } from 'react'

export function RegisterForm({ handleSubmit }: { handleSubmit: (formData: FormData) => Promise<void> }) {
  // Set default role in hidden input on mount
  useEffect(() => {
    const input = document.getElementById('roleInput') as HTMLInputElement
    if (input) input.value = 'customer'
  }, [])

  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Register</CardTitle>
        <CardDescription className="text-center">Create an account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          action={handleSubmit}
        >
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="name">
              Name
            </label>
            <Input
              name="name"
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="email">
              Email
            </label>
            <Input
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="password">
              Password
            </label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="role">
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
          <Button className="w-full">
            Register
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 