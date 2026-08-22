import { ContentCard } from '@/components/cards/ContentCard'
import { MetricCard } from '@/components/cards/MetricCard'
import { HazardCard } from '@/components/cards/HazardCard'
import { HealthScoreGauge } from '@/components/domain/HealthScoreGauge'
import { EvidenceGallery } from '@/components/domain/EvidenceGallery'
import { formatDate, formatInr, formatRelativeDate } from '@/lib/format'
import type { InternalRoadView, PublicRoadView } from '@/types/entities'
import { Shield } from 'lucide-react'

interface OverviewTabProps {
  internal: import('@/types/entities').InternalRoadView | null
  publicView: import('@/types/entities').PublicRoadView | null
  asset: import('@/types/entities').InternalRoadView | import('@/types/entities').PublicRoadView
  showExactScore: boolean
}

export function OverviewTab({ internal, publicView, asset, showExactScore }: OverviewTabProps) {
  const rows = internal
    ? [
        ['Road Type', internal.roadType],
        ['Surface Type', internal.surfaceType],
        ['Length', internal.lengthMeters ? `${internal.lengthMeters} m` : 'Not yet recorded'],
        ['Width', internal.widthMeters ? `${internal.widthMeters} m` : 'Not yet recorded'],
        ['Construction Year', internal.constructionYear?.toString() ?? 'Not yet recorded'],
        ['Constructing Agency', internal.constructingAgency ?? 'Not yet recorded'],
        ['Last Maintenance', internal.lastMaintenanceDate ? formatDate(internal.lastMaintenanceDate) : 'Not yet recorded'],
        ['Open Issues', internal.activeHazardCount.toString()],
        ['Health Score', showExactScore ? `${internal.health.score}/100` : internal.riskBand],
        ['Risk Band', internal.riskBand],
      ]
    : [
        ['Open Issues', publicView?.openIssueCount.toString() ?? '0'],
        ['Health Band', publicView?.riskBand ?? '—'],
        ['Status', publicView?.status ?? '—'],
      ]

  return (
    <div className="space-y-6">
      <div className="rounded-[12px] border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="font-mono-road text-2xl font-bold text-primary">{asset.roadId ?? ''}</div>
            <div className="text-sm text-slate mt-1">
              Ward {internal?.ward ?? publicView?.ward} · {internal?.jurisdiction ?? publicView?.jurisdiction}
            </div>
          </div>
        </div>
      </div>

      <ContentCard title="Asset Overview" subtitle={internal ? 'Full asset specification' : 'Public summary'}>
        <dl className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-[8px] border border-border p-4">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-body mt-1 text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </ContentCard>
    </div>
  )
}