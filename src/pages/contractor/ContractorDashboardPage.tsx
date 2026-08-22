import { ActionCard } from '@/components/cards/ActionCard'
import { ContentCard } from '@/components/cards/ContentCard'
import { MetricCard } from '@/components/cards/MetricCard'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { DLPBadge } from '@/components/badges/DLPBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { getDashboard } from '@/services/contractorTaskService'
import { formatRelativeDate } from '@/lib/format'
import { AlertTriangle, CheckCircle, Clock, HardHat, TrendingUp, Wrench, Calendar, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ContractorDashboardPage() {
  const { user } = useAuth()

  const { data, loading } = useAsyncData(async () => {
    if (!user?.contractorId) return null
    return getDashboard(user.contractorId)
  }, [user?.contractorId])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Contractor Dashboard" subtitle="Loading your dashboard..." />
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
        title="Contractor Dashboard"
        subtitle="Manage your assigned tasks and track performance"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Assigned"
          value={data.assigned}
          tint={data.assigned > 0 ? 'warning' : 'success'}
          icon={<Clock size={18} />}
          trend={{ value: data.assigned > 0 ? 'Action needed' : 'All clear', positive: data.assigned === 0 }}
        />
        <MetricCard
          label="In Progress"
          value={data.inProgress}
          tint={data.inProgress > 0 ? 'warning' : 'success'}
          icon={<Wrench size={18} />}
          trend={{ value: data.inProgress > 0 ? 'Active work' : 'Idle', positive: data.inProgress === 0 }}
        />
        <MetricCard
          label="Due Soon"
          value={data.dueSoon}
          tint={data.dueSoon > 0 ? 'warning' : 'success'}
          icon={<AlertTriangle size={18} />}
          trend={{ value: data.dueSoon > 0 ? 'Upcoming deadline' : 'On track', positive: data.dueSoon === 0 }}
        />
        <MetricCard
          label="Completed"
          value={data.completed}
          tint="success"
          icon={<CheckCircle size={18} />}
          trend={{ value: 'This period', positive: true }}
        />
        <MetricCard
          label="Overdue"
          value={data.priorityTasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'completed').length}
          tint="danger"
          icon={<AlertTriangle size={18} />}
          trend={{ value: 'Requires attention', positive: false }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="On-Time Performance"
          value={`${data.performanceSummary.onTimePercent}%`}
          tint={data.performanceSummary.onTimePercent >= 85 ? 'success' : 'warning'}
          icon={<TrendingUp size={18} />}
          trend={{ value: data.performanceSummary.onTimePercent >= 85 ? 'Excellent' : 'Needs improvement', positive: data.performanceSummary.onTimePercent >= 85 }}
        />
        <MetricCard
          label="Avg Resolution"
          value={`${data.performanceSummary.averageResolutionDays} days`}
          tint="default"
          icon={<Clock size={18} />}
          trend={{ value: 'Target: 3 days', positive: true }}
        />
        <MetricCard
          label="Total Completed"
          value={data.performanceSummary.completedCount}
          tint="success"
          icon={<CheckCircle size={18} />}
          trend={{ value: 'All time', positive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ActionCard
          title="My Tasks"
          description="View all assigned tasks and their status."
          icon={<Wrench size={20} className="text-primary" />}
          to="/contractor/tasks"
          accent="primary"
          size="lg"
        />
        <ActionCard
          title="DLP Exposure"
          description="View active defect liability periods and warranty status."
          icon={<HardHat size={20} className="text-warning" />}
          to="/contractor/tasks"
          accent="warning"
          size="lg"
        />
      </div>

      {data.priorityTasks.length > 0 && (
        <ContentCard
          title="Priority Tasks"
          subtitle={`Tasks requiring immediate attention (${data.priorityTasks.length})`}
        >
          <div className="space-y-3">
            {data.priorityTasks.map((task) => (
              <Link
                key={task.id}
                to={`/contractor/tasks/${task.taskId}`}
                className="flex items-center justify-between rounded-[8px] border border-border px-4 py-4 hover:bg-surface-recessed transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-[8px] bg-primary/10 text-primary shrink-0">
                    <Wrench size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-mono-road text-sm text-primary">{task.taskId}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{task.status.replace('_', ' ')}</span>
                    </div>
                    <div className="text-lg font-medium text-ink truncate mt-1">{task.hazardType.replaceAll('_', ' ')}</div>
                    <div className="text-sm text-slate truncate mt-0.5">{task.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted">Deadline</div>
                  <div className="text-sm font-medium text-ink">{formatRelativeDate(task.deadline)}</div>
                  <div className="text-xs text-muted capitalize mt-1">{task.status.replace('_', ' ')}</div>
                </div>
                <ArrowRight size={16} className="text-muted ml-4" />
              </Link>
            ))}
          </div>
        </ContentCard>
      )}

      {data.dlpExposure.length > 0 && (
        <ContentCard
          title="Active DLP Records"
          subtitle="Defect liability periods currently in effect"
        >
          <div className="space-y-3">
            {data.dlpExposure.map((record) => (
              <div key={record.id} className="rounded-[8px] border border-border p-4">
                <DLPBadge record={record} />
              </div>
            ))}
          </div>
        </ContentCard>
      )}

      {data.recentActivity.length > 0 && (
        <ContentCard
          title="Recent Activity"
          subtitle="Latest updates on your assigned tasks"
        >
          <div className="space-y-3">
            {data.recentActivity.map((event) => (
              <div key={event.id} className="border-b border-border pb-3 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink">{event.title}</div>
                    <div className="text-sm text-slate mt-0.5">
                      {formatRelativeDate(event.occurredAt)}
                      {event.actorName ? ` · ${event.actorName}` : ''}
                    </div>
                    {event.description && (
                      <p className="text-sm text-slate mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      )}

      <div className="flex gap-3">
        <Link to="/contractor/tasks" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] bg-primary text-white hover:bg-primary-hover text-sm font-medium">
          <ArrowRight size={16} />
          View All Tasks
        </Link>
      </div>
    </div>
  )
}