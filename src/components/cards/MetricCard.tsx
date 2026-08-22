import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: ReactNode
  tint?: 'default' | 'success' | 'warning' | 'danger'
  icon?: ReactNode
  className?: string
}

const tintClasses = {
  default: 'bg-surface-recessed',
  success: 'bg-success-tint',
  warning: 'bg-warning-tint',
  danger: 'bg-danger-tint',
}

export function MetricCard({ label, value, tint = 'default', icon, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-[10px] border border-border p-4 shadow-[var(--shadow-card)]',
        tintClasses[tint],
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-caption text-muted">{label}</div>
        {icon && <div className="text-muted">{icon}</div>}
      </div>
      <div className="text-metric mt-2 text-ink">{value}</div>
    </div>
  )
}