import { RiskBandBadge } from '@/components/badges/StatusBadge'
import { cn } from '@/lib/cn'
import type { ContributingFactor, HealthScoreResult } from '@/types/entities'
import type { PassportViewMode } from '@/types/enums'

interface HealthScoreGaugeProps {
  health: HealthScoreResult
  viewMode?: PassportViewMode
  className?: string
}

function FactorRow({ factor }: { factor: ContributingFactor }) {
  const sign = factor.delta > 0 ? '+' : ''
  return (
    <li className="flex items-start justify-between gap-3 text-small">
      <span className="text-slate">{factor.label}</span>
      {factor.kind !== 'base' ? (
        <span
          className={cn(
            'font-medium tabular-nums',
            factor.delta >= 0 ? 'text-success' : 'text-danger',
          )}
        >
          {sign}
          {factor.delta}
        </span>
      ) : null}
    </li>
  )
}

export function HealthScoreGauge({
  health,
  viewMode = 'internal',
  className,
}: HealthScoreGaugeProps) {
  const showExact = viewMode === 'internal'

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-4">
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20 bg-surface-recessed"
          aria-label={showExact ? `Health score ${health.score} out of 100` : `Health band ${health.band}`}
        >
          {showExact ? (
            <div className="text-center">
              <div className="text-metric text-ink">{health.score}</div>
              <div className="text-caption text-muted">/ 100</div>
            </div>
          ) : (
            <RiskBandBadge band={health.band} />
          )}
        </div>
        <div>
          {showExact ? <RiskBandBadge band={health.band} /> : null}
          {health.priorQuarterScore !== undefined && showExact ? (
            <p className="text-small mt-2 text-slate">
              Trend vs prior quarter: {health.score >= health.priorQuarterScore ? '↑' : '↓'}{' '}
              {Math.abs(health.score - health.priorQuarterScore)} points
            </p>
          ) : null}
          {!showExact ? (
            <p className="text-small text-slate">
              Exact score available to authorized officers only.
            </p>
          ) : null}
        </div>
      </div>

      {showExact ? (
        <div>
          <h3 className="text-caption text-muted">Contributing factors</h3>
          <ul className="mt-2 space-y-2">
            {health.factors.map((factor) => (
              <FactorRow key={factor.label} factor={factor} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
