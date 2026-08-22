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
import { useToast } from '@/components/ui/Toast'
import { formatDate, formatRelativeDate } from '@/lib/format'
import { getTaskById, acceptTask, startRepair } from '@/services/contractorTaskService'
import { getById as getReportById } from '@/services/hazardReportService'
import { HAZARD_TYPE_LABELS } from '@/types/enums'
import { Calendar, Clock, MapPin, FileText, AlertCircle, Wrench, CheckCircle, AlertCircle as Alert, ArrowRight, Loader2, Shield } from 'lucide-react'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'

export function ContractorTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { data: task, loading: taskLoading, error, reload } = useAsyncData(
    () => getTaskById(taskId!),
    [taskId]
  )

  const { data: report } = useAsyncData(
    () => (task ? getReportById(task.reportId) : Promise.resolve(null)),
    [task?.reportId]
  )

  const handleAccept = async () => {
    if (!task) return
    setLoading(true)
    try {
      await acceptTask(task.id)
      showToast('Task accepted successfully', 'success')
      reload()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to accept task', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStartRepair = async () => {
    if (!task) return
    setLoading(true)
    try {
      await startRepair(task.id)
      showToast('Repair started successfully', 'success')
      reload()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to start repair', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (taskLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Task Details" subtitle="Loading task details..." />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (error || !task) {
    return <ErrorState message={error ?? 'Task not found.'} onRetry={reload} />
  }

  const canAccept = task.status === 'pending_acceptance'
  const canStart = task.status === 'accepted'
  const canSubmit = task.status === 'in_progress'
  const isSubmitted = task.status === 'submitted'
  const isCompleted = task.status === 'completed'
  const isOverdue = new Date(task.deadline) < new Date() && !['completed', 'submitted'].includes(task.status)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Task ${task.taskId}`}
        title={HAZARD_TYPE_LABELS[task.hazardType]}
        subtitle={task.location}
      />

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={task.hazardStatus} />
            <SeverityBadge severity={task.severity} />
            {isOverdue && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger/10 text-danger">
                <Alert size={12} className="mr-1" />
                Overdue
              </span>
            )}
          </div>
          <div className="text-sm text-slate">
            Updated {formatRelativeDate(task.updatedAt)}
          </div>
        </div>
        <div className="mb-4">
          <LifecycleRibbon status={task.hazardStatus} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Task ID</div>
            <div className="font-mono-road text-lg font-semibold text-primary mt-1">{task.taskId}</div>
          </div>
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Road Asset</div>
            <div className="font-mono-road text-lg font-semibold text-primary mt-1">{task.roadId}</div>
          </div>
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">SLA</div>
            <div className="text-lg font-semibold text-primary mt-1">{task.slaDays} days</div>
          </div>
        </div>
      </Card>

      <ContentCard title="Task Details">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Report ID</div>
                <div className="text-sm font-medium text-ink">{task.reportId}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Location</div>
                <div className="text-sm font-medium text-ink">{task.location}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Assigned on</div>
                <div className="text-sm font-medium text-ink">{formatDate(task.createdAt)}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Deadline</div>
                <div className="text-sm font-medium text-ink">{formatDate(task.deadline)}</div>
                <div className="text-xs text-muted mt-1">{formatRelativeDate(task.deadline)}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted">Road</div>
            <div className="text-sm font-medium text-ink">{task.roadName}</div>
            <div className="text-xs text-muted">{task.roadId}</div>
          </div>

          <div>
            <div className="text-xs text-muted">Instructions</div>
            <p className="text-body mt-1 text-ink">{task.instructions}</p>
          </div>

          <div className="rounded-[8px] bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Alert size={16} className="text-primary shrink-0" />
              <span className="text-muted">SLA</span>
            </div>
            <p className="text-sm font-medium text-ink mt-2">{task.slaDays} days from assignment</p>
          </div>
        </div>
      </ContentCard>

      {report && report.photos && report.photos.length > 0 && (
        <ContentCard title="Original Hazard Photos">
          <EvidenceGallery photos={report.photos} />
        </ContentCard>
      )}

      {task.evidence && task.evidence.length > 0 && (
        <ContentCard title="Submitted Evidence">
          <EvidenceGallery photos={task.evidence} />
        </ContentCard>
      )}

      {canAccept && (
        <Card className="border-warning bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning shrink-0">
              <Alert size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink">Accept This Task</h3>
              <p className="text-body mt-2 text-slate">
                Review the task details and accept to begin the repair process. Once accepted, you'll have {task.slaDays} days to complete the repair.
              </p>
              <Button
                onClick={handleAccept}
                disabled={loading}
                className="mt-4 w-full sm:w-auto"
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                {loading ? 'Processing...' : 'Accept Task'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {canStart && (
        <Card className="border-primary bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
              <Wrench size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink">Start Repair</h3>
              <p className="text-body mt-2 text-slate">
                You have accepted this task. Click to start the repair process. Once started, the status will update and you can submit completion evidence.
              </p>
              <Button
                onClick={handleStartRepair}
                disabled={loading}
                className="mt-4 w-full sm:w-auto"
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                {loading ? 'Processing...' : 'Start Repair'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {canSubmit && (
        <Card className="border-success bg-success/5 p-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-success/10 text-success shrink-0">
              <CheckCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink">Submit Repair Completion</h3>
              <p className="text-body mt-2 text-slate">
                Repair is in progress. Submit before/after photos and work description for government inspection.
              </p>
              <Link
                to={`/contractor/tasks/${task.taskId}/repair`}
                className="inline-block mt-4 rounded-[8px] bg-success px-4 py-2 text-sm text-white font-medium hover:bg-success-hover"
              >
                Submit Completion Evidence
              </Link>
            </div>
          </div>
        </Card>
      )}

      {isSubmitted && (
        <Card className="border-warning bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning shrink-0">
              <Alert size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink">Awaiting Inspection</h3>
              <p className="text-body mt-2 text-slate">
                Your repair completion has been submitted and is awaiting government inspection. You will be notified once the inspection is complete.
              </p>
            </div>
          </div>
        </Card>
      )}

      {isCompleted && (
        <Card className="border-success bg-success/5 p-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-success/10 text-success shrink-0">
              <CheckCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink">Task Completed</h3>
              <p className="text-body mt-2 text-slate">
                This task has been completed and approved by the government. A DLP warranty period is now active for this repair.
              </p>
              <Link
                to="/contractor/tasks"
                className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-primary text-white text-sm font-medium hover:bg-primary-hover"
              >
                Back to Tasks
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Link to="/contractor/tasks" className="inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-surface text-ink border border-border hover:bg-surface-recessed text-sm font-medium">
          <ArrowRight size={16} className="mr-2" />
          Back to Tasks
        </Link>
        <Link to={`/citizen/passport/${task.roadId}`} className="inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-primary text-white hover:bg-primary-hover text-sm font-medium">
          <Shield size={16} className="mr-2" />
          View Road Passport
        </Link>
      </div>
    </div>
  )
}