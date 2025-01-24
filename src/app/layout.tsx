import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zenny Support",
  description: "Customer support ticket system",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If no user, render without sidebar
  if (!user) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={cn('min-h-screen bg-background antialiased', inter.className)}>
          <main className="flex-1">
            {children}
          </main>
        </body>
      </html>
    )
  }
  
  // Get user's role and profile by checking both customers and employees tables
  const [{ data: customer }, { data: employee }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('employees').select('*').eq('id', user.id).maybeSingle()
  ])

  const userRole = employee ? 'employee' : 'customer'
  const employeeRole = employee?.role as 'admin' | 'agent' | undefined

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background antialiased', inter.className)}>
        <div className="flex">
          <Sidebar 
            userRole={userRole} 
            signOut={signOut} 
            userEmail={user.email || ''}
            employeeRole={employeeRole}
          />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
