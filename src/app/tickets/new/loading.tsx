export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-16 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>

        <div className="space-y-2">
          <div className="h-5 w-20 bg-muted animate-pulse rounded" />
          <div className="h-32 w-full bg-muted animate-pulse rounded" />
        </div>

        <div className="space-y-2">
          <div className="h-5 w-16 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>

        <div className="flex justify-end space-x-4">
          <div className="h-9 w-20 bg-muted animate-pulse rounded" />
          <div className="h-9 w-28 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
} 