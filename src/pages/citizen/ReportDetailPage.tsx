import { SeverityBadge, StatusBadge } from '@/components/badges/StatusBadge'
import { Card } from '@/components/ui/Card'
import { ContentCard } from '@/components/cards/ContentCard'
import { ErrorState } from '@/components/data/ErrorState'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { LifecycleRibbon } from '@/components/domain/LifecycleRibbon'
import { PageHeader } from '@/components/layout/PageHeader'
import { EvidenceGallery } from '@/components/domain/EvidenceGallery'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDate, formatRelativeDate } from '@/lib/format'
import { getById as getReportById } from '@/services/hazardReportService'
import { HAZARD_TYPE_LABELS } from '@/types/enums'
import { Calendar, Clock, MapPin, User, AlertCircle, Clock as ClockIcon, Shield, ArrowRight } from 'lucide-react'
import { useParams, Link } from 'react-router-dom'

export function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const { data: report, loading, error, reload } = useAsyncData(
    () => getReportById(reportId!),
    [reportId]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Report Details" subtitle="Loading report details..." />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="space-y-6">
        <PageHeader title="Report Details" subtitle="Unable to load report" />
        <ErrorState message={error ?? 'Report not found.'} onRetry={reload} />
      </div>
    )
  }

  const isResolved = ['resolved', 'closed'].includes(report.status)
  const canReopen = report.status === 'reopen_window'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Report ${report.reportId}`}
        title={HAZARD_TYPE_LABELS[report.hazardType]}
        subtitle={report.locationLabel}
      />

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={report.status} />
            <SeverityBadge severity={report.severity} />
          </div>
          <div className="text-sm text-slate">
            Updated {formatRelativeDate(report.updatedAt)}
          </div>
        </div>
        <div className="mb-4">
          <LifecycleRibbon status={report.status} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Report ID</div>
            <div className="font-mono-road text-lg font-semibold text-primary mt-1">{report.reportId}</div>
          </div>
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Road Asset</div>
            <div className="font-mono-road text-lg font-semibold text-primary mt-1">{report.roadId}</div>
          </div>
        </div>
      </Card>

      <ContentCard title="Report Details">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Location</div>
                <div className="text-sm font-medium text-ink">{report.locationLabel}</div>
                <div className="text-xs text-muted mt-1">
                  {report.location.lat.toFixed(5)}, {report.location.lng.toFixed(5)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Reported on</div>
                <div className="text-sm font-medium text-ink">{formatDate(report.reportedAt)}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                <ClockIcon size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Last updated</div>
                <div className="text-sm font-medium text-ink">{formatDate(report.updatedAt)}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                <User size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Road Asset</div>
                <div className="text-sm font-medium text-ink font-mono-road">{report.roadId}</div>
              </div>
            </div>
          </div>

          {report.description && (
            <div>
              <div className="text-xs text-muted">Description</div>
              <p className="text-body mt-1 text-ink">{report.description}</p>
            </div>
          )}

          {report.assignedContractorName && (
            <div className="rounded-[8px] bg-success/5 border border-success/20 p-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">Assigned contractor</span>
                <span className="font-medium text-ink">{report.assignedContractorName}</span>
              </div>
            </div>
          )}

          {report.expectedNextStep && (
            <div className="rounded-[8px] bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="text-primary shrink-0" />
                <span className="text-muted">Next step</span>
              </div>
              <p className="text-sm font-medium text-ink mt-2">{report.expectedNextStep}</p>
            </div>
          )}

          {canReopen && (
            <div className="rounded-[8px] bg-warning/5 border border-warning/20 p-4">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="text-warning shrink-0" />
                <span className="text-warning font-medium">Reopen window active</span>
              </div>
              <p className="text-sm text-slate mt-2">
                This report can be reopened if the issue persists. Contact the municipal authority.
              </p>
            </div>
          )}
        </div>
      </ContentCard>

      {report.photos && report.photos.length > 0 && (
        <ContentCard title="Evidence Photos">
          <EvidenceGallery photos={report.photos} />
        </ContentCard>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/citizen/reports" className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-surface text-ink border border-border hover:bg-surface-recessed text-sm font-medium">
          Back to My Reports
        </Link>
        <Link to="/citizen/home" className="inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-primary text-white hover:bg-primary-hover text-sm font-medium">
          Back to Home
        </Link>
        <Link to={`/citizen/passport/${report.roadId}`} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] bg-surface text-ink border border-border hover:bg-surface-recessed text-sm font-medium">
          <Shield size={16} />
          View Road Passport
        </Link>
      </div>
    </div>
  )
}