import { cn } from '@/lib/cn'
import { formatDlpBadgeLabel } from '@/services/dlpService'
import type { DLPRecord } from '@/types/entities'
import { ShieldAlert, ShieldCheck } from 'lucide-react'

interface DLPBadgeProps {
  record: DLPRecord
  className?: string
}

export function DLPBadge({ record, className }: DLPBadgeProps) {
  const active = record.isActive && new Date(record.expiresAt) > new Date()

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[999px] border px-2.5 py-1 text-caption',
        active
          ? 'border-warning/30 bg-warning-tint text-warning'
          : 'border-border bg-surface-recessed text-muted',
        className,
      )}
    >
      {active ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
      {formatDlpBadgeLabel(record)}
    </span>
  )
}

interface DLPRecurrenceBannerProps {
  message: string
  className?: string
}

export function DLPRecurrenceBanner({ message, className }: DLPRecurrenceBannerProps) {
  return (
    <div
      className={cn(
        'rounded-[10px] border border-warning/30 bg-warning-tint px-4 py-3 text-body text-warning',
        className,
      )}
    >
      <strong className="font-medium">Possible recurrence — under warranty.</strong>{' '}
      {message}
    </div>
  )
}
