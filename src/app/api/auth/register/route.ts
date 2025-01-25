import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    // Create regular client for auth
    const supabase = await createClient()

    // First create the user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user' },
        { status: 400 }
      )
    }

    // Now use service role to insert into customers/employees table
    const serviceRole = await createClient(true)
    
    if (role === 'customer') {
      const { error: customerError } = await serviceRole
        .from('customers')
        .insert({
          id: authData.user.id,
          name,
          email
        })

      if (customerError) {
        // Attempt to clean up the auth user if customer creation fails
        await serviceRole.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json(
          { error: customerError.message },
          { status: 400 }
        )
      }
    } else if (role === 'employee') {
      const { error: employeeError } = await serviceRole
        .from('employees')
        .insert({
          id: authData.user.id,
          name,
          email,
          role: 'agent' // Default role for now
        })

      if (employeeError) {
        // Attempt to clean up the auth user if employee creation fails
        await serviceRole.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json(
          { error: employeeError.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({ user: authData.user })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 