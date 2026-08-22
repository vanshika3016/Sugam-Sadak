import React from 'react'
import { SeverityBadge, StatusBadge } from '@/components/badges/StatusBadge'
import { Card } from '@/components/ui/Card'
import { ContentCard } from '@/components/cards/ContentCard'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/data/ErrorState'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { LifecycleRibbon } from '@/components/domain/LifecycleRibbon'
import { PageHeader } from '@/components/layout/PageHeader'
import { EvidenceGallery } from '@/components/domain/EvidenceGallery'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { formatDate, formatRelativeDate } from '@/lib/format'
import { getById as getReportById, verify, assignContractor } from '@/services/hazardReportService'
import { authService } from '@/services/authService'
import { HAZARD_TYPE_LABELS } from '@/types/enums'
import { Calendar, Clock, MapPin, User, Building2, AlertCircle, CheckCircle, ArrowRight, Loader2, Shield } from 'lucide-react'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import type { Contractor } from '@/types/entities'

export function GovernmentCaseDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { data: report, loading: reportLoading, error, reload } = useAsyncData(
    () => getReportById(reportId!),
    [reportId]
  )

  const { data: contractors } = useAsyncData(async () => {
    return authService.api.getContractors()
  }, [])

  const handleVerify = async () => {
    if (!user || !report) return
    setLoading(true)
    try {
      await verify(report.id, user.id)
      showToast('Report verified successfully', 'success')
      reload()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Verification failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignContractor = async (contractorId: string) => {
    if (!user || !report) return
    setLoading(true)
    try {
      await assignContractor(report.id, contractorId, user.id)
      showToast('Contractor assigned successfully', 'success')
      reload()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Assignment failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (reportLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Case Details" subtitle="Loading case details..." />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (error || !report) {
    return <ErrorState message={error ?? 'Report not found.'} onRetry={reload} />
  }

  const canVerify = report.status === 'reported'
  const canAssign = report.status === 'verified'
  const isAssigned = report.status === 'assigned' || report.assignedContractorId

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Case ${report.reportId}`}
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

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Report ID</div>
            <div className="font-mono-road text-lg font-semibold text-primary mt-1">{report.reportId}</div>
          </div>
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Road Asset</div>
            <div className="font-mono-road text-lg font-semibold text-primary mt-1">{report.roadId}</div>
          </div>
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Priority</div>
            <div className="text-lg font-semibold text-primary mt-1">{report.priority}</div>
          </div>
        </div>
      </Card>

      <ContentCard title="Case Details">
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
                <Clock size={18} />
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
                <Building2 size={16} className="text-success shrink-0" />
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
        </div>
      </ContentCard>

      {report.photos && report.photos.length > 0 && (
        <ContentCard title="Evidence Photos">
          <EvidenceGallery photos={report.photos} />
        </ContentCard>
      )}

      {canVerify && (
        <Card className="border-warning bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink">Verification Required</h3>
              <p className="text-body mt-2 text-slate">
                This report needs to be verified before it can be assigned to a contractor.
              </p>
              <Button
                onClick={handleVerify}
                disabled={loading}
                className="mt-4"
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                {loading ? 'Verifying...' : 'Verify Report'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {canAssign && (
        <ContentCard title="Assign Contractor">
          <div className="space-y-3">
            <p className="text-body text-slate">
              Select a contractor to assign this repair task. The contractor will be notified and can accept the task.
            </p>
            <div className="grid gap-3">
              {contractors?.map((contractor: Contractor) => (
                <button
                  key={contractor.id}
                  onClick={() => handleAssignContractor(contractor.id)}
                  disabled={loading}
                  className="flex items-center justify-between rounded-[8px] border border-border p-4 text-left transition-colors duration-150 hover:bg-surface-recessed disabled:opacity-60"
                >
                  <div>
                    <div className="font-medium text-ink">{contractor.name}</div>
                    <div className="text-sm mt-1 text-slate">
                      Rating: {contractor.rating} · On-time: {contractor.onTimePercent}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted">Active tasks</div>
                    <div className="text-lg font-semibold text-ink">{contractor.activeTasks}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ContentCard>
      )}

      {isAssigned && (
        <Card className="border-success bg-success/5 p-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-success/10 text-success shrink-0">
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Contractor Assigned</h3>
              <p className="text-body mt-2 text-slate">
                This case has been assigned to <strong>{report.assignedContractorName}</strong>.
                The contractor will be notified and can begin the repair process.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Link to="/government/cases" className="inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-surface text-ink border border-border hover:bg-surface-recessed text-sm font-medium">
          <ArrowRight size={16} className="mr-2" />
          Back to Cases
        </Link>
        <Link to={`/citizen/passport/${report.roadId}`} className="inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-primary text-white hover:bg-primary-hover text-sm font-medium">
          <Shield size={16} className="mr-2" />
          View Road Passport
        </Link>
      </div>
    </div>
  )
}