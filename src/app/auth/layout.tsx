import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn('min-h-screen bg-background antialiased', inter.className)}>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 