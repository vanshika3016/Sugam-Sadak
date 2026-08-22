import { ContentCard } from '@/components/cards/ContentCard'
import { FilterBar } from '@/components/data/FilterBar'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { EmptyState } from '@/components/data/EmptyState'
import { HazardCard } from '@/components/cards/HazardCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { DEMO_WARD } from '@/lib/constants'
import { getAll } from '@/services/roadAssetService'
import { getCases } from '@/services/hazardReportService'
import { type Severity, type HazardStatus } from '@/types/enums'
import { FileText, Filter, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const SEVERITY_FILTERS: Array<{ value: Severity; label: string }> = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const STATUS_FILTERS: Array<{ value: HazardStatus; label: string }> = [
  { value: 'reported', label: 'Reported' },
  { value: 'verified', label: 'Verified' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_repair', label: 'In Repair' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'resolved', label: 'Resolved' },
]

export function CaseManagementPage() {
  const { user } = useAuth()
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<HazardStatus | 'all'>('all')

  const { data, loading } = useAsyncData(async () => {
    const [assets, allCases] = await Promise.all([getAll({ ward: DEMO_WARD }), getCases()])

    const wardCases = allCases.filter((caseItem) => {
      const asset = assets.find((a) => a.id === caseItem.roadAssetId)
      return asset?.ward === DEMO_WARD
    })

    let filteredCases = wardCases

    if (severityFilter !== 'all') {
      filteredCases = filteredCases.filter((c) => c.severity === severityFilter)
    }

    if (statusFilter !== 'all') {
      filteredCases = filteredCases.filter((c) => c.status === statusFilter)
    }

    return {
      cases: filteredCases,
      totalCases: wardCases.length,
    }
  }, [severityFilter, statusFilter, user?.id])

  const handleFilterChange = (type: 'severity' | 'status', value: string) => {
    if (type === 'severity') {
      setSeverityFilter(value === 'all' ? 'all' : (value as Severity))
    } else {
      setStatusFilter(value === 'all' ? 'all' : (value as HazardStatus))
    }
  }

  const hasActiveFilters = severityFilter !== 'all' || statusFilter !== 'all'

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Case Management"
          subtitle="Review, verify, and assign hazard reports"
        />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (!data || data.cases.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Case Management"
          subtitle="Review, verify, and assign hazard reports"
        />
        <EmptyState
          icon={<FileText size={48} />}
          title={hasActiveFilters ? 'No matching cases' : 'No cases found'}
          description={
            hasActiveFilters
              ? 'No cases match your current filters. Try adjusting them.'
              : 'No hazard cases have been reported in your ward yet.'
          }
          actionLabel="Clear filters"
          actionTo={() => {
            setSeverityFilter('all')
            setStatusFilter('all')
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Case Management"
        subtitle={`Managing ${data.totalCases} total case${data.totalCases !== 1 ? 's' : ''} in Ward ${DEMO_WARD}`}
        action={hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={() => { setSeverityFilter('all'); setStatusFilter('all'); }}>
            <X size={14} className="mr-1" />
            Clear filters
          </Button>
        ) : null}
      />

      <FilterBar
        filters={[
          {
            label: 'Severity',
            value: severityFilter,
            options: [
              { value: 'all', label: 'All Severities' },
              ...SEVERITY_FILTERS.map((f) => ({ value: f.value, label: f.label })),
            ],
            onChange: (value: string) => handleFilterChange('severity', value),
          },
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              ...STATUS_FILTERS.map((f) => ({ value: f.value, label: f.label })),
            ],
            onChange: (value: string) => handleFilterChange('status', value),
          },
        ]}
      />

      <ContentCard
        title={`Cases (${data.cases.length})`}
        subtitle={hasActiveFilters ? 'Filtered results' : 'All cases'}
      >
        <div className="space-y-3">
          {data.cases.map((caseItem) => (
            <Link key={caseItem.id} to={`/government/cases/${caseItem.reportId}`}>
              <HazardCard report={caseItem} />
            </Link>
          ))}
        </div>
        {data.cases.length === 0 && (
          <div className="text-center py-8 text-slate">
            No cases match the current filters
          </div>
        )}
      </ContentCard>
    </div>
  )
}