import { EmptyState } from '@/components/data/EmptyState'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { HazardCard } from '@/components/cards/HazardCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Chip } from '@/components/ui/Chip'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { getForCitizen } from '@/services/hazardReportService'
import { FileText, Filter, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function MyReportsPage() {
  const { user } = useAuth()

  const { data: reports, loading } = useAsyncData(() => {
    if (!user) return Promise.resolve([])
    return getForCitizen(user.id)
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Reports"
          subtitle="Track all your hazard reports and their status"
        />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Reports"
          subtitle="Track all your hazard reports and their status"
        />
        <EmptyState
          icon={<FileText size={48} />}
          title="No reports yet"
          description="You haven't submitted any hazard reports. Start by reporting a hazard in your area."
          actionLabel="Report a Hazard"
          actionTo="/citizen/report"
        />
      </div>
    )
  }

  const openReports = reports.filter((report) => !['resolved', 'closed'].includes(report.status))
  const resolvedReports = reports.filter((report) => ['resolved', 'closed'].includes(report.status))

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reports"
        subtitle={`You have ${reports.length} total report${reports.length !== 1 ? 's' : ''}`}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Chip>All</Chip>
            <Chip>Active ({openReports.length})</Chip>
            <Chip>Resolved ({resolvedReports.length})</Chip>
          </div>
        }
      />

      {openReports.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Active Reports ({openReports.length})</h2>
            <span className="text-sm text-muted">Currently being processed</span>
          </div>
          <div className="space-y-3">
            {openReports.map((report) => (
              <Link key={report.id} to={`/citizen/reports/${report.reportId}`}>
                <HazardCard report={report} />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[12px] border border-border bg-surface p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-3">
            <FileText size={24} />
          </div>
          <h3 className="text-lg font-semibold text-ink">No active reports</h3>
          <p className="text-sm text-slate mt-1">All your reported hazards have been resolved</p>
        </div>
      )}

      {resolvedReports.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Resolved Reports ({resolvedReports.length})</h2>
            <span className="text-sm text-muted">Completed and closed</span>
          </div>
          <div className="space-y-3">
            {resolvedReports.map((report) => (
              <Link key={report.id} to={`/citizen/reports/${report.reportId}`}>
                <HazardCard report={report} />
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}