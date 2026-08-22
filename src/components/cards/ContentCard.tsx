import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface ContentCardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}

export function ContentCard({
  title,
  subtitle,
  children,
  className,
  headerAction,
}: ContentCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      {(title || headerAction) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-h2 text-ink">{title}</h2> : null}
            {subtitle ? <p className="text-small mt-1 text-slate">{subtitle}</p> : null}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </Card>
  )
}
