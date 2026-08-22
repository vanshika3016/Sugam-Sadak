import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { LucideProps } from 'lucide-react'
import type { ReactElement, ComponentType } from 'react'
import { Link } from 'react-router-dom'

type IconProp = ComponentType<LucideProps> | ReactElement

interface EmptyStateProps {
  icon: IconProp
  title: string
  message?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionTo?: string | (() => void)
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  description,
  actionLabel,
  onAction,
  actionTo,
  className,
}: EmptyStateProps) {
  const displayMessage = message ?? description ?? ''
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <div className="rounded-[10px] border border-border bg-surface-recessed p-3 text-slate">
        {typeof Icon === 'function' ? <Icon size={24} strokeWidth={1.5} /> : Icon}
      </div>
      <h3 className="text-h2 mt-4 text-ink">{title}</h3>
      <p className="text-body mt-2 max-w-md text-slate">{displayMessage}</p>
      {actionLabel && (onAction || actionTo) ? (
        typeof actionTo === 'function' ? (
          <Button className="mt-4" onClick={actionTo}>
            {actionLabel}
          </Button>
        ) : actionTo ? (
          <Link to={actionTo} className="mt-4">
            <Button>{actionLabel}</Button>
          </Link>
        ) : (
          <Button className="mt-4" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      ) : null}
    </div>
  )
}