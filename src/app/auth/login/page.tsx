'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(searchParams.get('error'))
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const demoUsers = {
    customer: { email: 'regis3@regis3.com', password: 'regis3' },
    agent: { email: 'regis5@regis5.com', password: 'regis5' },
    admin: { email: 'regis4@regis4.com', password: 'regis4' },
  }

  const setDemoUser = (role: keyof typeof demoUsers) => {
    setEmail(demoUsers[role].email)
    setPassword(demoUsers[role].password)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if user is a customer or employee
        const { data: customer } = await supabase
          .from('customers')
          .select()
          .eq('id', user.id)
          .single()

        const { data: employee } = await supabase
          .from('employees')
          .select()
          .eq('id', user.id)
          .single()

        if (customer || employee) {
          // Force a full page reload to ensure layout is properly rendered
          window.location.href = '/dashboard'
        } else {
          window.location.href = '/auth/unauthorized'
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">Enter your email and password to login</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {searchParams.get('message') && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{searchParams.get('message')}</span>
            </div>
          )}
          <div className="space-y-2">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              name="password"
              placeholder="Password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Demo User</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setDemoUser('customer')}>
                  Customer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDemoUser('agent')}>
                  Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDemoUser('admin')}>
                  Admin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 