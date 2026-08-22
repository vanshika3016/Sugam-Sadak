import { StatusBadge, InspectionStatusBadge } from '@/components/badges/StatusBadge'
import { ContentCard } from '@/components/cards/ContentCard'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { EmptyState } from '@/components/data/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDate, formatRelativeDate } from '@/lib/format'
import { getPending, getAll } from '@/services/inspectionService'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function GovernmentInspectionsPage() {
  const { data: pendingInspections, loading } = useAsyncData(() => getPending(), [])
  const { data: allInspections } = useAsyncData(() => getAll(), [])

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  const completedInspections = allInspections?.filter((i) => i.status === 'completed') ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspections"
        subtitle="Review completed repairs and approve or reject work"
      />

      {pendingInspections && pendingInspections.length > 0 && (
        <ContentCard
          title={`Pending Inspections (${pendingInspections.length})`}
          subtitle="Repairs awaiting government review"
        >
          <div className="space-y-3">
            {pendingInspections.map((inspection) => (
              <Link
                key={inspection.id}
                to={`/government/inspections/${inspection.id}`}
                className="flex items-center justify-between rounded-[8px] border border-border px-4 py-4 hover:bg-surface-recessed"
              >
                <div className="flex items-start gap-3">
                  <Clock size={20} className="mt-0.5 text-warning" />
                  <div>
                    <div className="font-mono-road text-small text-primary">{inspection.reportId}</div>
                    <div className="text-h3 mt-1 text-ink">Repair completed</div>
                    <div className="text-small mt-1 text-slate">
                      Submitted {formatRelativeDate(inspection.scheduledDate ?? new Date().toISOString())}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <InspectionStatusBadge status="pending" />
                </div>
              </Link>
            ))}
          </div>
        </ContentCard>
      )}

      {completedInspections.length > 0 && (
        <ContentCard
          title={`Completed Inspections (${completedInspections.length})`}
          subtitle="Past inspection results"
        >
          <div className="space-y-3">
            {completedInspections.map((inspection) => (
              <Link
                key={inspection.id}
                to={`/government/inspections/${inspection.id}`}
                className="flex items-center justify-between rounded-[8px] border border-border px-4 py-4 hover:bg-surface-recessed"
              >
                <div className="flex items-start gap-3">
                  {inspection.result === 'pass' ? (
                    <CheckCircle size={20} className="mt-0.5 text-success" />
                  ) : (
                    <XCircle size={20} className="mt-0.5 text-danger" />
                  )}
                  <div>
                    <div className="font-mono-road text-small text-primary">{inspection.reportId}</div>
                    <div className="text-h3 mt-1 text-ink">
                      {inspection.result === 'pass' ? 'Approved' : 'Rejected'}
                    </div>
                    <div className="text-small mt-1 text-slate">
                      {formatDate(inspection.completedDate ?? inspection.scheduledDate ?? new Date().toISOString())}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={inspection.result === 'pass' ? 'resolved' : 'in_repair'} />
                </div>
              </Link>
            ))}
          </div>
        </ContentCard>
      )}

      {(!pendingInspections || pendingInspections.length === 0) && completedInspections.length === 0 && (
        <EmptyState
          icon={<CheckCircle size={48} />}
          title="No inspections"
          description="No repairs are currently pending inspection. Check back after contractors complete their work."
        />
      )}
    </div>
  )
}
