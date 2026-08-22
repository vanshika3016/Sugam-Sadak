import { Card } from '@/components/ui/Card'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDate, formatRelativeDate } from '@/lib/format'
import { getById as getReportById } from '@/services/hazardReportService'
import { HAZARD_TYPE_LABELS, SEVERITY_LABELS } from '@/types/enums'
import { CheckCircle, Share2, Clock, MapPin, AlertCircle, ArrowRight, FileText, Shield } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { cn } from '@/lib/cn'

export function ReportSuccessPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const { data: report, loading } = useAsyncData(() => getReportById(reportId!), [reportId])

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate">Loading...</div>
      </div>
    )
  }

  const linkButton = (variant: 'primary' | 'secondary') =>
    cn(
      'inline-flex items-center justify-center gap-2 rounded-[8px] font-medium transition-colors duration-150',
      variant === 'primary'
        ? 'bg-primary text-white hover:bg-primary-hover h-11 px-5 text-body'
        : 'bg-surface text-ink border border-border hover:bg-surface-recessed h-11 px-5 text-body'
    )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center rounded-full bg-success/10 p-5 mb-4">
          <CheckCircle size={56} className="text-success" />
        </div>
        <h1 className="text-2xl font-bold text-ink">Report Submitted Successfully</h1>
        <p className="text-body mt-2 text-slate max-w-xl mx-auto">
          Your hazard report has been registered and will be reviewed by the municipal authority.
        </p>
      </div>

      <Card className="p-5 border-primary/20 bg-primary/5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="text-xs text-muted">Report ID</div>
            <div className="font-mono-road text-2xl font-bold text-primary">{report.reportId}</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Road Asset</div>
            <div className="font-mono-road text-lg font-semibold text-primary mt-1">{report.roadId}</div>
            <div className="text-sm text-slate mt-1">{report.locationLabel}</div>
          </div>
          <div className="rounded-[8px] bg-surface p-4 border border-border">
            <div className="text-xs text-muted">Submitted</div>
            <div className="text-lg font-semibold text-ink mt-1">{formatDate(report.reportedAt)}</div>
            <div className="text-sm text-slate mt-1">{new Date(report.reportedAt).toLocaleTimeString()}</div>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate">Hazard type</span>
            <span className="text-sm font-medium text-ink">{HAZARD_TYPE_LABELS[report.hazardType]}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate">Severity</span>
            <span className="text-sm font-medium text-ink">{SEVERITY_LABELS[report.severity]}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate">Status</span>
            <span className="text-sm font-medium text-ink capitalize">{report.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate">Priority</span>
            <span className="text-sm font-medium text-ink">{report.priority}</span>
          </div>
        </div>
      </Card>

      <Card className="border-warning bg-warning/5 p-5 mb-4">
        <div className="flex items-start gap-3">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">What happens next?</h3>
            <ol className="mt-3 space-y-2 text-sm text-slate">
              <li className="flex items-start gap-2">
                <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
                Ward JE will verify your report within 24 hours
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
                A contractor will be assigned for repair
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
                You can track progress using your Report ID: <span className="font-mono-road text-primary">{report.reportId}</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
                You'll receive updates on resolution status
              </li>
            </ol>
          </div>
        </div>
      </Card>

      <Card className="p-5 border-success/20 bg-success/5 mb-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-success/10 text-success shrink-0">
            <MapPin size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">View on Map</h3>
            <p className="text-sm text-slate mt-1">See the hazard location and nearby road assets</p>
          </div>
        </div>
        <Link to="/citizen/map" className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-primary text-white text-sm font-medium hover:bg-primary-hover w-full">
          Open Map
        </Link>
      </Card>

      <Card className="p-5 border-primary/20 bg-primary/5 mb-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Track Your Report</h3>
            <p className="text-sm text-slate mt-1">View detailed status, timeline, and updates</p>
          </div>
        </div>
        <Link to={`/citizen/reports/${report.reportId}`} className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] bg-primary text-white text-sm font-medium hover:bg-primary-hover w-full">
          <FileText size={16} />
          Track This Report
        </Link>
      </Card>

      <Card className="p-5 border-surface-recessed bg-surface">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-recessed text-slate shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">View Road Passport</h3>
            <p className="text-sm text-slate mt-1">See the complete history and health of {report.roadId}</p>
          </div>
        </div>
        <Link to={`/citizen/passport/${report.roadId}`} className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] bg-surface text-ink border border-border hover:bg-surface-recessed text-sm font-medium w-full">
          <Shield size={16} />
          Open Road Passport
        </Link>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/citizen/home" className={cn('inline-flex items-center justify-center px-4 py-2 rounded-[8px] font-medium transition-colors duration-150', 'bg-surface text-ink border border-border hover:bg-surface-recessed h-11 px-5 text-body')}>
          Back to Home
        </Link>
        <Link to={`/citizen/reports/${report.reportId}`} className={cn('inline-flex items-center justify-center px-4 py-2 rounded-[8px] font-medium transition-colors duration-150', 'bg-primary text-white hover:bg-primary-hover h-11 px-5 text-body')}>
          <ArrowRight size={16} />
          Track This Report
        </Link>
      </div>
    </div>
  )
}