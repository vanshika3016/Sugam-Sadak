import { cn } from '@/lib/cn'
import { statusToLifecycleIndex } from '@/services/stateMachineService'
import { LIFECYCLE_STEPS } from '@/types/enums'
import type { HazardStatus } from '@/types/enums'

const STEP_LABELS: Record<(typeof LIFECYCLE_STEPS)[number], string> = {
  reported: 'Reported',
  verified: 'Verified',
  assigned: 'Assigned',
  in_repair: 'In Repair',
  inspection: 'Inspection',
  resolved: 'Resolved',
}

interface LifecycleRibbonProps {
  status: HazardStatus
  variant?: 'compact' | 'full'
  className?: string
}

export function LifecycleRibbon({ status, variant = 'compact', className }: LifecycleRibbonProps) {
  const activeIndex = statusToLifecycleIndex(status)

  if (variant === 'full') {
    return (
      <ol className={cn('space-y-4', className)}>
        {LIFECYCLE_STEPS.map((step, index) => {
          const complete = index <= activeIndex
          return (
            <li key={step} className="flex gap-3">
              <div
                className={cn(
                  'mt-1 h-3 w-3 rounded-full border-2',
                  complete ? 'border-primary bg-primary' : 'border-border bg-surface',
                )}
              />
              <div>
                <div className={cn('text-h3', complete ? 'text-ink' : 'text-muted')}>
                  {STEP_LABELS[step]}
                </div>
                {complete ? (
                  <div className="text-small text-slate">Step completed</div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-6 gap-1">
        {LIFECYCLE_STEPS.map((step, index) => {
          const complete = index <= activeIndex
          const current = index === activeIndex
          return (
            <div key={step} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-medium transition-all duration-200',
                  complete
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-surface text-muted',
                  current && 'scale-[1.08]',
                )}
              >
                {index + 1}
              </div>
              <span className="text-[10px] text-center leading-tight text-slate">
                {STEP_LABELS[step]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
