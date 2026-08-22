import { SeverityBadge, StatusBadge } from '@/components/badges/StatusBadge'
import { ContentCard } from '@/components/cards/ContentCard'
import { FilterBar } from '@/components/data/FilterBar'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { EmptyState } from '@/components/data/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { getTasks } from '@/services/contractorTaskService'
import { formatRelativeDate } from '@/lib/format'
import { type TaskStatus } from '@/types/enums'
import { Wrench } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const STATUS_FILTERS: Array<{ value: TaskStatus; label: string }> = [
  { value: 'pending_acceptance', label: 'Pending Acceptance' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'completed', label: 'Completed' },
]

export function ContractorTasksPage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')

  const { data, loading } = useAsyncData(async () => {
    if (!user?.contractorId) return { tasks: [], totalTasks: 0 }
    const allTasks = await getTasks(user.contractorId)

    let filteredTasks = allTasks

    if (statusFilter !== 'all') {
      filteredTasks = filteredTasks.filter((t) => t.status === statusFilter)
    }

    return {
      tasks: filteredTasks,
      totalTasks: allTasks.length,
    }
  }, [statusFilter, user?.contractorId])

  const handleFilterChange = (value: string) => {
    setStatusFilter(value === 'all' ? 'all' : (value as TaskStatus))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (!data || data.tasks.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Assigned Tasks"
          subtitle="View and manage your assigned repair tasks"
        />
        <EmptyState
          icon={<Wrench size={48} />}
          title="No tasks found"
          description={
            statusFilter !== 'all'
              ? 'No tasks match your current filter. Try adjusting it.'
              : 'You have no assigned tasks at the moment.'
          }
          actionLabel="Clear filters"
          actionTo={() => setStatusFilter('all')}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Tasks"
        subtitle={`Managing ${data.totalTasks} total task${data.totalTasks !== 1 ? 's' : ''}`}
      />

      <FilterBar
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              ...STATUS_FILTERS.map((f) => ({ value: f.value, label: f.label })),
            ],
            onChange: handleFilterChange,
          },
        ]}
      />

      <ContentCard
        title={`Tasks (${data.tasks.length})`}
        subtitle={statusFilter !== 'all' ? 'Filtered results' : 'All tasks'}
      >
        <div className="space-y-3">
          {data.tasks.map((task) => (
            <Link key={task.id} to={`/contractor/tasks/${task.taskId}`}>
              <div className="flex items-center justify-between rounded-[8px] border border-border px-4 py-4 hover:bg-surface-recessed">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-mono-road text-small text-primary">{task.taskId}</div>
                    <StatusBadge status={task.hazardStatus} />
                  </div>
                  <div className="text-h3 mt-1 text-ink">{task.hazardType.replaceAll('_', ' ')}</div>
                  <div className="text-small mt-1 text-slate">{task.location}</div>
                  <div className="text-small mt-1 text-slate">{task.roadName}</div>
                </div>
                <div className="ml-4 text-right">
                  <SeverityBadge severity={task.severity} />
                  <div className="text-small mt-2 text-slate">Deadline</div>
                  <div className="text-small text-ink">{formatRelativeDate(task.deadline)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ContentCard>
    </div>
  )
}
