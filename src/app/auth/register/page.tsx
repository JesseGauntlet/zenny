import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { RegisterForm } from './register-form'

async function handleSubmit(formData: FormData) {
  'use server'

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as 'customer' | 'employee'

  if (!role) {
    return redirect('/auth/register?error=' + encodeURIComponent('Please select a role'))
  }

  const supabase = await createClient()

  // Sign up user with metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role
      }
    }
  })

  if (authError || !authData.user) {
    console.error('Supabase auth error:', authError)
    return redirect('/auth/register?error=' + encodeURIComponent(authError?.message || 'Failed to create user'))
  }

  return redirect('/auth/login?message=Check your email to confirm your registration!')
}

export default function RegisterPage() {
  return (
    <div className="w-[400px]">
      <RegisterForm handleSubmit={handleSubmit} />
    </div>
  )
} 