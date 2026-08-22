import { ContentCard } from '@/components/cards/ContentCard'
import { MetricCard } from '@/components/cards/MetricCard'
import { RoadAssetCard } from '@/components/cards/RoadAssetCard'
import { DLPBadge } from '@/components/badges/DLPBadge'
import { HealthScoreGauge } from '@/components/domain/HealthScoreGauge'
import { LifecycleRibbon } from '@/components/domain/LifecycleRibbon'
import { MapPanel } from '@/components/domain/MapPanel'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/badges/StatusBadge'
import { useEffect, useState } from 'react'
import { getAll, getInternalView } from '@/services/roadAssetService'
import type { InternalRoadView, RoadAsset } from '@/types/entities'
import { PILOT_JURISDICTION } from '@/lib/constants'

interface RoleFoundationPageProps {
  roleLabel: string
  description: string
}

export function RoleFoundationPage({ roleLabel, description }: RoleFoundationPageProps) {
  const [assets, setAssets] = useState<RoadAsset[]>([])
  const [heroAsset, setHeroAsset] = useState<InternalRoadView | null>(null)

  useEffect(() => {
    void getAll().then(setAssets)
    void getInternalView('SS-W12-R211').then(setHeroAsset)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Phase 1 foundation"
        title={`${roleLabel} shell ready`}
        subtitle={description}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Road assets seeded" value={assets.length} />
        <MetricCard label="Hero asset" value="SS-W12-R211" tint="warning" />
        <MetricCard label="Pilot scope" value="Single ULB" />
      </div>

      <ContentCard
        title="Shared domain components"
        subtitle="Lifecycle, health score, DLP, and map panel are wired to mock services."
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <StatusBadge status="in_repair" />
            <LifecycleRibbon status="in_repair" />
            {heroAsset ? (
              <>
                <HealthScoreGauge health={heroAsset.health} viewMode="internal" />
                {heroAsset.activeDlpRecords[0] ? (
                  <DLPBadge record={heroAsset.activeDlpRecords[0]} />
                ) : (
                  <p className="text-small text-slate">
                    DLP activates after repair completion during the P0 walkthrough.
                  </p>
                )}
              </>
            ) : null}
          </div>
          <div className="space-y-4">
            {assets[0] ? <RoadAssetCard asset={assets[0]} showExactScore /> : null}
            <MapPanel assets={assets} height="280px" />
          </div>
        </div>
      </ContentCard>

      <ContentCard title="Pilot framing" subtitle={PILOT_JURISDICTION}>
        <p className="text-body text-slate">
          P0 screens will build on this foundation next. Mock services persist in sessionStorage
          and can be replaced by Supabase without changing UI components.
        </p>
      </ContentCard>
    </div>
  )
}
