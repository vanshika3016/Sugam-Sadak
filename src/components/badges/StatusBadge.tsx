import { cn } from '@/lib/cn'
import { HAZARD_STATUS_LABELS } from '@/types/enums'
import type { HazardStatus, RiskBand } from '@/types/enums'
import { Circle, Diamond, Triangle } from 'lucide-react'

interface StatusBadgeProps {
  status: HazardStatus
  className?: string
}

const statusStyles: Record<HazardStatus, string> = {
  reported: 'bg-surface-recessed text-slate border-border',
  verified: 'bg-primary/10 text-primary border-primary/20',
  assigned: 'bg-warning-tint text-warning border-warning/20',
  in_repair: 'bg-warning-tint text-warning border-warning/20',
  inspection: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-success-tint text-success border-success/20',
  reopen_window: 'bg-warning-tint text-warning border-warning/20',
  closed: 'bg-surface-recessed text-muted border-border',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[999px] border px-2.5 py-1 text-caption',
        statusStyles[status],
        className,
      )}
    >
      <Circle size={10} strokeWidth={2.5} aria-hidden />
      {HAZARD_STATUS_LABELS[status]}
    </span>
  )
}

interface InspectionStatusBadgeProps {
  status: 'pending' | 'completed' | 'scheduled'
  className?: string
}

const inspectionStatusStyles = {
  pending: 'bg-warning-tint text-warning border-warning/20',
  completed: 'bg-success-tint text-success border-success/20',
  scheduled: 'bg-primary/10 text-primary border-primary/20',
}

const inspectionStatusLabels = {
  pending: 'Pending',
  completed: 'Completed',
  scheduled: 'Scheduled',
}

export function InspectionStatusBadge({ status, className }: InspectionStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[999px] border px-2.5 py-1 text-caption',
        inspectionStatusStyles[status],
        className,
      )}
    >
      <Circle size={10} strokeWidth={2.5} aria-hidden />
      {inspectionStatusLabels[status]}
    </span>
  )
}

interface RiskBandBadgeProps {
  band: RiskBand
  className?: string
}

const riskStyles: Record<RiskBand, { className: string; Icon: typeof Circle }> = {
  healthy: { className: 'bg-success-tint text-success border-success/20', Icon: Circle },
  watch: { className: 'bg-warning-tint text-warning border-warning/20', Icon: Triangle },
  maintenance_due: { className: 'bg-warning-tint text-warning border-warning/20', Icon: Triangle },
  critical: { className: 'bg-danger-tint text-danger border-danger/20', Icon: Diamond },
}

const riskLabels: Record<RiskBand, string> = {
  healthy: 'Healthy',
  watch: 'Watch',
  maintenance_due: 'Maintenance Due',
  critical: 'Critical',
}

export function RiskBandBadge({ band, className }: RiskBandBadgeProps) {
  const { className: style, Icon } = riskStyles[band]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[999px] border px-2.5 py-1 text-caption',
        style,
        className,
      )}
    >
      <Icon size={10} strokeWidth={2.5} aria-hidden />
      {riskLabels[band]}
    </span>
  )
}

interface SeverityBadgeProps {
  severity: import('@/types/enums').Severity
  className?: string
}

const severityStyles = {
  low: 'bg-success-tint text-success border-success/20',
  medium: 'bg-warning-tint text-warning border-warning/20',
  high: 'bg-danger-tint text-danger border-danger/20',
  critical: 'bg-danger text-white border-danger',
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[999px] border px-2.5 py-1 text-caption capitalize',
        severityStyles[severity],
        className,
      )}
    >
      {severity}
    </span>
  )
}