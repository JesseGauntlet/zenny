import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zenny Support",
  description: "Customer support ticket system",
};

async function SignOutButton() {
  async function signOut() {
    'use server'
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  return (
    <form action={signOut}>
      <Button variant="ghost" type="submit">
        Sign Out
      </Button>
    </form>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        {session && (
          <header className="border-b">
            <div className="container mx-auto flex h-16 items-center justify-between">
              <Link href="/" className="font-semibold">
                Zenny Support
              </Link>
              <SignOutButton />
            </div>
          </header>
        )}
        {children}
      </body>
    </html>
  );
}
