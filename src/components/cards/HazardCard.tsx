import { SeverityBadge, StatusBadge } from '@/components/badges/StatusBadge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { formatRelativeDate } from '@/lib/format'
import { HAZARD_TYPE_LABELS } from '@/types/enums'
import type { HazardReport } from '@/types/entities'

interface HazardCardProps {
  report: HazardReport
  onClick?: () => void
  className?: string
}

export function HazardCard({ report, onClick, className }: HazardCardProps) {
  const content = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono-road text-small text-primary">{report.reportId}</div>
        <StatusBadge status={report.status} />
      </div>
      <div className="text-h3 mt-2 text-ink">{HAZARD_TYPE_LABELS[report.hazardType]}</div>
      <div className="text-small mt-1 text-slate">
        {report.roadId} · {report.locationLabel}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SeverityBadge severity={report.severity} />
        <span className="text-small text-muted">Updated {formatRelativeDate(report.updatedAt)}</span>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn('w-full text-left', className)}
      >
        <Card className="p-4 transition-colors duration-150 hover:bg-surface-recessed">{content}</Card>
      </button>
    )
  }

  return <Card className={cn('p-4', className)}>{content}</Card>
}
