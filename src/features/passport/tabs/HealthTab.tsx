import { ContentCard } from '@/components/cards/ContentCard'
import { HazardCard } from '@/components/cards/HazardCard'
import { HealthScoreGauge } from '@/components/domain/HealthScoreGauge'
import type { InternalRoadView, PublicRoadView } from '@/types/entities'

interface HealthTabProps {
  internal: InternalRoadView | null
  publicView: PublicRoadView | null
  viewMode: 'public' | 'internal'
}

export function HealthTab({ internal, publicView, viewMode }: HealthTabProps) {
  return (
    <ContentCard title="Road Health" subtitle={internal ? 'Detailed health analysis' : 'Public health summary'}>
      {internal ? (
        <HealthScoreGauge health={internal.health} viewMode={viewMode} />
      ) : publicView ? (
        <HealthScoreGauge
          health={{
            score: 0,
            band: publicView.riskBand,
            factors: [
              {
                label: `${publicView.openIssueCount} open issue(s) on this road`,
                delta: 0,
                kind: 'base',
              },
            ],
          }}
          viewMode="public"
        />
      ) : null}
      {internal?.activeHazards.length ? (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-ink">Active Hazards</h3>
          {internal.activeHazards.map((report) => (
            <div key={report.id} className="rounded-[8px] border border-border p-4">
              <div className="text-lg font-semibold text-ink">{report.hazardType.replaceAll('_', ' ')}</div>
              <div className="text-sm text-slate mt-1">{report.locationLabel}</div>
              <div className="text-sm text-slate mt-1">Severity: {report.severity}</div>
              <div className="text-sm text-slate mt-1">Status: {report.status}</div>
            </div>
          ))}
        </div>
      ) : null}
    </ContentCard>
  )
}