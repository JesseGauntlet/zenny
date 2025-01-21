import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TicketLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode
  searchParams: { error?: string }
}) {
  return (
    <div>
      {searchParams.error && (
        <div className="container mx-auto py-4">
          <Alert variant="destructive">
            <AlertDescription>{searchParams.error}</AlertDescription>
          </Alert>
        </div>
      )}
      {children}
    </div>
  )
} 