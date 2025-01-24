import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zenny Support",
  description: "Customer support ticket system",
};

async function signOut() {
  'use server'
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  // Get user role from metadata
  const userRole = user?.user_metadata?.role || 'customer';
  const userEmail = user?.email;

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          {user && !userError && (
            <Sidebar 
              userRole={userRole} 
              signOut={signOut} 
              userEmail={userEmail || 'Unknown User'} 
            />
          )}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
