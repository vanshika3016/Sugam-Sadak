import React from 'react'
import { StatusBadge, InspectionStatusBadge } from '@/components/badges/StatusBadge'
import { Card } from '@/components/ui/Card'
import { ContentCard } from '@/components/cards/ContentCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ErrorState } from '@/components/data/ErrorState'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { EvidenceGallery } from '@/components/domain/EvidenceGallery'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/format'
import { getById, approve, failInspection } from '@/services/inspectionService'
import { getById as getReportById } from '@/services/hazardReportService'
import { CheckCircle, XCircle, FileText, MapPin, Calendar, Shield, AlertCircle } from 'lucide-react'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'

export function InspectionDetailPage() {
  const { inspectionId } = useParams<{ inspectionId: string }>()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [remarks, setRemarks] = useState('')

  const { data: inspection, loading: inspectionLoading, error, reload } = useAsyncData(
    () => getById(inspectionId!),
    [inspectionId]
  )

  const { data: report } = useAsyncData(
    () => (inspection ? getReportById(inspection.reportId) : Promise.resolve(null)),
    [inspection?.reportId]
  )

  const handleApprove = async () => {
    if (!user || !inspection) return
    setLoading(true)
    try {
      await approve(inspection.id, { remarks, officerId: user.id })
      showToast('Inspection approved successfully', 'success')
      reload()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Approval failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!user || !inspection) return
    setLoading(true)
    try {
      await failInspection(inspection.id, { remarks, officerId: user.id })
      showToast('Inspection rejected. Contractor must rework.', 'warning')
      reload()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Rejection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (inspectionLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Inspection Details" subtitle="Loading inspection details..." />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (error || !inspection) {
    return <ErrorState message={error ?? 'Inspection not found.'} onRetry={reload} />
  }

  const isPending = inspection.status === 'pending'
  const isCompleted = inspection.status === 'completed'
  const isPassed = isCompleted && inspection.result === 'pass'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Inspection ${inspection.id.slice(-8)}`}
        title="Repair Inspection"
        subtitle={`Report ${inspection.reportId}`}
      />

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <InspectionStatusBadge status={inspection.status} />
            {isCompleted && (
              <StatusBadge status={inspection.result === 'pass' ? 'resolved' : 'in_repair'} />
            )}
          </div>
          <div className="text-sm text-slate">
            {inspection.completedDate
              ? `Completed ${formatDate(inspection.completedDate)}`
              : `Scheduled ${formatDate(inspection.scheduledDate ?? new Date().toISOString())}`}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Report ID</div>
            <div className="font-mono-road text-lg font-semibold text-primary mt-1">{inspection.reportId}</div>
          </div>
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Road Asset</div>
            <div className="font-mono-road text-lg font-semibold text-primary mt-1">{report?.roadId ?? 'N/A'}</div>
          </div>
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Officer</div>
            <div className="text-lg font-semibold text-primary mt-1">{inspection.officerName}</div>
          </div>
        </div>
      </Card>

      <ContentCard title="Inspection Details">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Report ID</div>
                <div className="text-sm font-medium text-ink">{inspection.reportId}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Inspection date</div>
                <div className="text-sm font-medium text-ink">
                  {formatDate(inspection.completedDate ?? inspection.scheduledDate ?? new Date().toISOString())}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Location</div>
                <div className="text-sm font-medium text-ink">{report?.locationLabel ?? 'N/A'}</div>
              </div>
            </div>
          </div>

          {inspection.remarks && (
            <div>
              <div className="text-xs text-muted">Contractor remarks</div>
              <p className="text-body mt-1 text-ink">{inspection.remarks}</p>
            </div>
          )}

          {inspection.condition && (
            <div className="rounded-[8px] bg-surface p-4 border border-border">
              <div className="text-xs text-muted">Condition noted</div>
              <p className="text-sm font-medium text-ink mt-1">{inspection.condition}</p>
            </div>
          )}
        </div>
      </ContentCard>

      {inspection.evidence && inspection.evidence.length > 0 && (
        <ContentCard title="Repair Evidence">
          <EvidenceGallery photos={inspection.evidence} />
        </ContentCard>
      )}

      {isPending && (
        <Card className="border-warning bg-warning/5 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Inspection Review Required</h3>
              <p className="text-body mt-2 text-slate">
                Review the repair evidence and decide whether to approve or reject the work.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="remarks" className="text-sm text-slate">
              Inspection remarks (optional)
            </label>
            <Input
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any notes about your inspection decision..."
              className="mt-2"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              {loading ? 'Processing...' : 'Approve Repair'}
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading}
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <XCircle size={18} />
              {loading ? 'Processing...' : 'Reject Repair'}
            </Button>
          </div>
        </Card>
      )}

      {isPassed && (
        <Card className="border-success bg-success/5 p-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-success/10 text-success shrink-0">
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Inspection Passed</h3>
              <p className="text-body mt-2 text-slate">
                This repair has been approved. The case is now resolved and a DLP warranty period has begun for the contractor.
              </p>
              <div className="mt-4 rounded-[8px] bg-success/10 border border-success/20 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Shield size={16} className="text-success shrink-0" />
                  <span className="text-success font-medium">DLP Period Active</span>
                </div>
                <p className="text-sm text-slate mt-2">
                  12-month defect liability period started. Any recurrence at this location will be flagged for review.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {isCompleted && inspection.result === 'fail' && (
        <Card className="border-danger bg-danger/5 p-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-danger/10 text-danger shrink-0">
              <XCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Inspection Failed</h3>
              <p className="text-body mt-2 text-slate">
                This repair was rejected. The contractor must rework the repair and submit new evidence for inspection.
              </p>
              <div className="mt-4 rounded-[8px] bg-danger/10 border border-danger/20 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle size={16} className="text-danger shrink-0" />
                  <span className="text-danger font-medium">Contractor must rework</span>
                </div>
                <p className="text-sm text-slate mt-2">
                  The contractor will be notified and must submit new completion evidence for re-inspection.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Link to="/government/inspections" className="inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-surface text-ink border border-border hover:bg-surface-recessed text-sm font-medium">
          Back to Inspections
        </Link>
      </div>
    </div>
  )
}