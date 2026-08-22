import { cn } from '@/lib/cn'

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[10px] bg-border/60',
        className,
      )}
      aria-hidden
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-[10px] border border-border bg-surface p-4">
      <LoadingSkeleton className="h-4 w-24" />
      <LoadingSkeleton className="mt-3 h-6 w-40" />
      <LoadingSkeleton className="mt-2 h-4 w-full" />
      <LoadingSkeleton className="mt-4 h-10 w-28" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <LoadingSkeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, index) => (
        <LoadingSkeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  )
}
