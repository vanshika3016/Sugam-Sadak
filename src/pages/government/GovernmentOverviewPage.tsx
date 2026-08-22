import React from 'react'
import { ActionCard } from '@/components/cards/ActionCard'
import { ContentCard } from '@/components/cards/ContentCard'
import { MetricCard } from '@/components/cards/MetricCard'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { DEMO_WARD } from '@/lib/constants'
import { getAll } from '@/services/roadAssetService'
import { getCases } from '@/services/hazardReportService'
import { getPending } from '@/services/inspectionService'
import { AlertTriangle, CheckCircle, Clock, FileText, Map, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CaseItem {
  id: string
  reportId: string
  hazardType: string
  locationLabel: string
  severity: string
  status: string
  assignedContractorName?: string
}

function VerifiedCases({ cases }: { cases: CaseItem[] }): React.ReactElement | null {
    if (cases.length === 0) return null
    return (
      <ContentCard
        title="Awaiting Verification"
        subtitle={`${cases.length} report${cases.length !== 1 ? 's' : ''} need verification`}
      >
        <div className="space-y-2">
          {cases.slice(0, 3).map((caseItem) => (
            <Link
              key={caseItem.id}
              to={`/government/cases/${caseItem.reportId}`}
              className="flex items-center justify-between rounded-[8px] border border-border px-4 py-3 hover:bg-surface-recessed transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-warning/10 text-warning shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <div className="font-mono-road text-sm text-primary">{caseItem.reportId}</div>
                  <div className="text-sm font-medium text-ink">{caseItem.hazardType.replaceAll('_', ' ')}</div>
                  <div className="text-xs text-slate">{caseItem.locationLabel}</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </Link>
          ))}
          {cases.length > 3 && (
            <Link to="/government/cases" className="text-sm text-primary hover:underline mt-2 block text-right">
              View all {cases.length} cases →
            </Link>
          )}
        </div>
      </ContentCard>
    )
  }

function AssignedCases({ cases }: { cases: CaseItem[] }): React.ReactElement | null {
    if (cases.length === 0) return null
    return (
      <ContentCard
        title="Assigned to Contractors"
        subtitle={`${cases.length} report${cases.length !== 1 ? 's' : ''} assigned, awaiting acceptance`}
      >
        <div className="space-y-2">
          {cases.slice(0, 3).map((caseItem) => (
            <Link
              key={caseItem.id}
              to={`/government/cases/${caseItem.reportId}`}
              className="flex items-center justify-between rounded-[8px] border border-border px-4 py-3 hover:bg-surface-recessed transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <div className="font-mono-road text-sm text-primary">{caseItem.reportId}</div>
                  <div className="text-sm font-medium text-ink">{caseItem.hazardType.replaceAll('_', ' ')}</div>
                  <div className="text-xs text-slate">{caseItem.assignedContractorName || 'Contractor assigned'}</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </Link>
          ))}
          {cases.length > 3 && (
            <Link to="/government/cases" className="text-sm text-primary hover:underline mt-2 block text-right">
              View all →
            </Link>
          )}
        </div>
      </ContentCard>
    )
  }

function InRepairCases({ cases }: { cases: CaseItem[] }): React.ReactElement | null {
    if (cases.length === 0) return null
    return (
      <ContentCard
        title="In Repair"
        subtitle={`${cases.length} report${cases.length !== 1 ? 's' : ''} currently being repaired`}
      >
        <div className="space-y-2">
          {cases.slice(0, 3).map((caseItem) => (
            <Link
              key={caseItem.id}
              to={`/government/cases/${caseItem.reportId}`}
              className="flex items-center justify-between rounded-[8px] border border-border px-4 py-3 hover:bg-surface-recessed transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <div className="font-mono-road text-sm text-primary">{caseItem.reportId}</div>
                  <div className="text-sm font-medium text-ink">{caseItem.hazardType.replaceAll('_', ' ')}</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </Link>
          ))}
          {cases.length > 3 && (
            <Link to="/government/cases" className="text-sm text-primary hover:underline mt-2 block text-right">
              View all →
            </Link>
          )}
        </div>
      </ContentCard>
    )
  }

function PendingInspections({ inspections }: { inspections: any[] }): React.ReactElement | null {
    if (inspections.length === 0) return null
    return (
      <ContentCard
        title="Pending Inspections"
        subtitle={`${inspections.length} repair${inspections.length !== 1 ? 's' : ''} awaiting review`}
      >
        <div className="space-y-2">
          {inspections.slice(0, 3).map((inspection) => (
            <Link
              key={inspection.id}
              to={`/government/inspections/${inspection.id}`}
              className="flex items-center justify-between rounded-[8px] border border-border px-4 py-3 hover:bg-surface-recessed transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-warning/10 text-warning shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <div className="font-mono-road text-sm text-primary">{inspection.reportId}</div>
                  <div className="text-sm font-medium text-ink">Repair completed</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </Link>
          ))}
          {inspections.length > 3 && (
            <Link to="/government/inspections" className="text-sm text-primary hover:underline mt-2 block text-right">
              View all →
            </Link>
          )}
        </div>
      </ContentCard>
    )
  }

function CriticalCases({ cases }: { cases: CaseItem[] }): React.ReactElement | null {
    if (cases.length === 0) return null
    return (
      <ContentCard
        title="Critical Issues"
        subtitle={`${cases.length} high-priority case${cases.length !== 1 ? 's' : ''} requiring attention`}
      >
        <div className="space-y-2">
          {cases.slice(0, 3).map((caseItem) => (
            <Link
              key={caseItem.id}
              to={`/government/cases/${caseItem.reportId}`}
              className="flex items-center justify-between rounded-[8px] border border-border px-4 py-3 hover:bg-surface-recessed transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-danger/10 text-danger shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <div className="font-mono-road text-sm text-primary">{caseItem.reportId}</div>
                  <div className="text-sm font-medium text-ink">{caseItem.hazardType.replaceAll('_', ' ')}</div>
                  <div className="text-xs text-slate">{caseItem.locationLabel}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-danger">{caseItem.severity}</div>
                  <div className="text-xs text-muted">{caseItem.status}</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </Link>
          ))}
          {cases.length > 3 && (
            <Link to="/government/cases" className="text-sm text-primary hover:underline mt-2 block text-right">
              View all →
            </Link>
          )}
        </div>
      </ContentCard>
    )
  }

export function GovernmentOverviewPage() {
  const { user } = useAuth()

  const { data, loading } = useAsyncData(async () => {
    const [assets, cases, pendingInspections] = await Promise.all([
      getAll({ ward: DEMO_WARD }),
      getCases(),
      getPending(),
    ])

    const wardCases = cases.filter((caseItem) => {
      const asset = assets.find((a) => a.id === caseItem.roadAssetId)
      return asset?.ward === DEMO_WARD
    })

    const openCases = wardCases.filter((c) => !['resolved', 'closed'].includes(c.status))
    const criticalCases = openCases.filter((c) => c.severity === 'critical' || c.severity === 'high')
    const verifiedCases = openCases.filter((c) => c.status === 'verified')
    const assignedCases = openCases.filter((c) => c.status === 'assigned')
    const inRepairCases = openCases.filter((c) => c.status === 'in_repair')
    const inspectionCases = openCases.filter((c) => c.status === 'inspection')
    const avgHealth =
      assets.length > 0
        ? Math.round(assets.reduce((sum, asset) => sum + asset.healthScore, 0) / assets.length)
        : 0
    const criticalRoads = assets.filter((a) => a.riskBand === 'critical').length

    return {
      assets,
      cases: wardCases,
      openCases,
      criticalCases,
      verifiedCases,
      assignedCases,
      inRepairCases,
      inspectionCases,
      pendingInspections,
      avgHealth,
      criticalRoads,
    }
  }, [user?.id])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Government Overview" subtitle={`Ward ${DEMO_WARD} Operations Dashboard`} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Government Overview"
        subtitle={`Ward ${DEMO_WARD} Operations Dashboard`}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Total Roads" value={data.assets.length} icon={<Map size={18} />} } />
        <MetricCard
          label="Open Cases"
          value={data.openCases.length}
          tint={data.openCases.length > 0 ? 'warning' : 'success'}
          icon={<FileText size={18} />}
          }
        />
        <MetricCard
          label="Critical Issues"
          value={data.criticalCases.length}
          tint={data.criticalCases.length > 0 ? 'danger' : 'success'}
          icon={<AlertTriangle size={18} />}
          trend={{ value: data.criticalCases.length > 0 ? 'Urgent' : 'None', positive: data.criticalCases.length === 0 }}
        />
        <MetricCard
          label="Pending Inspections"
          value={data.pendingInspections.length}
          tint={data.pendingInspections.length > 0 ? 'warning' : 'success'}
          icon={<Clock size={18} />}
          trend={{ value: data.pendingInspections.length > 0 ? 'Awaiting review' : 'All clear', positive: data.pendingInspections.length === 0 }}
        />
        <MetricCard
          label="Awaiting Verification"
          value={data.verifiedCases.length}
          tint={data.verifiedCases.length > 0 ? 'warning' : 'success'}
          icon={<AlertCircle size={18} />}
          trend={{ value: data.verifiedCases.length > 0 ? 'Action needed' : 'All clear', positive: data.verifiedCases.length === 0 }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Avg Health Score"
          value={data.avgHealth}
          tint={data.avgHealth >= 80 ? 'success' : data.avgHealth >= 60 ? 'warning' : 'danger'}
          icon={<TrendingUp size={18} />}
          trend={{ value: data.avgHealth >= 80 ? 'Healthy' : data.avgHealth >= 60 ? 'Watch' : 'Critical', positive: data.avgHealth >= 80 }}
        />
        <MetricCard
          label="Critical Roads"
          value={data.criticalRoads}
          tint={data.criticalRoads > 0 ? 'danger' : 'success'}
          icon={<AlertTriangle size={18} />}
          trend={{ value: data.criticalRoads > 0 ? 'Needs attention' : 'All clear', positive: data.criticalRoads === 0 }}
        />
        <MetricCard
          label="In Repair"
          value={data.inRepairCases.length}
          tint={data.inRepairCases.length > 0 ? 'warning' : 'success'}
          icon={<CheckCircle size={18} />}
          trend={{ value: data.inRepairCases.length > 0 ? 'Active' : 'None', positive: data.inRepairCases.length === 0 }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ActionCard
          title="Case Management"
          description="Review, verify, and assign hazard reports to contractors."
          icon={<FileText size={20} className="text-primary" />}
          to="/government/cases"
          accent="primary"
          size="lg"
        />
        <ActionCard
          title="Inspections"
          description="Review completed repairs and approve or reject work."
          icon={<CheckCircle size={20} className="text-success" />}
          to="/government/inspections"
          accent="success"
          size="lg"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <VerifiedCases cases={data.verifiedCases} />
        <AssignedCases cases={data.assignedCases} />
        <InRepairCases cases={data.inRepairCases} />
        <PendingInspections inspections={data.pendingInspections} />
        <CriticalCases cases={data.criticalCases} />
      </div>
    </div>
  )
}