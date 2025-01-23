import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return redirect('/auth/login?error=' + encodeURIComponent('Please login to access the dashboard'))
  }

  // Check if user exists in customers or employees table
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('id', user.id)
    .single()

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('id', user.id)
    .single()

  let userRole: 'customer' | 'employee'
  if (customer) {
    userRole = 'customer'
  } else if (employee) {
    userRole = 'employee'
  } else {
    return redirect('/auth/login?error=' + encodeURIComponent('Your account exists but is not properly linked to either a customer or employee profile. Please contact support or create a new account with the correct role.'))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userRole={userRole} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 