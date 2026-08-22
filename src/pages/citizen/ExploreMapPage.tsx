import { ContentCard } from '@/components/cards/ContentCard'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { MapPanel } from '@/components/domain/MapPanel'
import { PageHeader } from '@/components/layout/PageHeader'
import { RiskBandBadge } from '@/components/badges/StatusBadge'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getAll } from '@/services/roadAssetService'
import { DEMO_WARD } from '@/lib/constants'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { RoadAsset } from '@/types/entities'

export function ExploreMapPage() {
  const [selectedAsset, setSelectedAsset] = useState<RoadAsset | null>(null)

  const { data: assets, loading } = useAsyncData(() => getAll({ ward: DEMO_WARD }), [])

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Explore Roads"
        subtitle="View nearby road assets, their health status, and hazards"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MapPanel
            assets={assets ?? []}
            height="500px"
            onSelectAsset={setSelectedAsset}
            selectedAssetId={selectedAsset?.id}
          />
        </div>

        <div className="space-y-4">
          <ContentCard title="Road Assets" subtitle={`Showing ${assets?.length ?? 0} roads in Ward ${DEMO_WARD}`}>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {assets?.map((asset) => (
                <Link
                  key={asset.id}
                  to={`/citizen/passport/${asset.roadId}`}
                  className={`block rounded-[8px] border p-3 transition-colors duration-150 hover:bg-surface-recessed ${
                    selectedAsset?.id === asset.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setSelectedAsset(asset)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono-road text-small text-primary">{asset.roadId}</div>
                      <div className="text-h3 mt-1 text-ink">{asset.name}</div>
                      <div className="text-small mt-1 text-slate">{asset.location}</div>
                    </div>
                    <RiskBandBadge band={asset.riskBand} />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-small text-slate">
                    <span>Health: {asset.healthScore}/100</span>
                    {asset.activeHazardCount > 0 && (
                      <span className="text-warning">{asset.activeHazardCount} active hazard(s)</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </ContentCard>

          {selectedAsset && (
            <ContentCard title="Selected Road">
              <div className="space-y-3">
                <div>
                  <div className="text-small text-slate">Road ID</div>
                  <div className="font-mono-road text-h2 text-primary">{selectedAsset.roadId}</div>
                </div>
                <div>
                  <div className="text-small text-slate">Name</div>
                  <div className="text-h3 text-ink">{selectedAsset.name}</div>
                </div>
                <div>
                  <div className="text-small text-slate">Location</div>
                  <div className="text-small text-ink">{selectedAsset.location}</div>
                </div>
                <div>
                  <div className="text-small text-slate">Health Score</div>
                  <div className="text-h3 text-ink">{selectedAsset.healthScore}/100</div>
                </div>
                <div>
                  <div className="text-small text-slate">Status</div>
                  <div className="text-small text-ink">{selectedAsset.status}</div>
                </div>
                <Link
                  to={`/citizen/passport/${selectedAsset.roadId}`}
                  className="block w-full rounded-[8px] bg-primary px-4 py-2 text-center text-small text-white transition-colors duration-150 hover:bg-primary-hover"
                >
                  View Road Passport
                </Link>
              </div>
            </ContentCard>
          )}
        </div>
      </div>
    </div>
  )
}
