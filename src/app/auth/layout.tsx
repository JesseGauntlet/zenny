import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AuthLayout({
  children,
  searchParams = {},
}: {
  children: React.ReactNode
  searchParams?: { error?: string; message?: string }
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      {searchParams?.error && (
        <Alert variant="destructive" className="w-[350px]">
          <AlertDescription>{searchParams.error}</AlertDescription>
        </Alert>
      )}
      {searchParams?.message && (
        <Alert className="w-[350px]">
          <AlertDescription>{searchParams.message}</AlertDescription>
        </Alert>
      )}
      {children}
    </div>
  )
} 