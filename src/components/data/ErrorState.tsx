import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <div className="rounded-[10px] border border-danger/20 bg-danger-tint p-3 text-danger">
        <AlertTriangle size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-h2 mt-4 text-ink">{title}</h3>
      <p className="text-body mt-2 max-w-md text-slate">{message}</p>
      {onRetry ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
