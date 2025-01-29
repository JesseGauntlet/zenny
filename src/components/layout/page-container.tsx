import { cn } from "@/lib/utils"

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div 
      className={cn(
        "container mx-auto p-6 md:p-8 lg:p-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 