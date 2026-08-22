import { ActionCard } from '@/components/cards/ActionCard'
import { ContentCard } from '@/components/cards/ContentCard'
import { MetricCard } from '@/components/cards/MetricCard'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { LifecycleRibbon } from '@/components/domain/LifecycleRibbon'
import { MapPanel } from '@/components/domain/MapPanel'
import { Chip } from '@/components/ui/Chip'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { DEMO_WARD } from '@/lib/constants'
import { getForCitizen } from '@/services/hazardReportService'
import { getAll } from '@/services/roadAssetService'
import { AlertCircle, Map, Route, Clock, TrendingUp, MapPin, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CitizenHomePage() {
  const { user } = useAuth()

  const { data, loading } = useAsyncData(async () => {
    const [assets, reports] = await Promise.all([
      getAll({ ward: DEMO_WARD }),
      user ? getForCitizen(user.id) : Promise.resolve([]),
    ])

    const openReports = reports.filter((report) => !['resolved', 'closed'].includes(report.status))
    const nearbyAssets = assets
    const avgHealth =
      nearbyAssets.length > 0
        ? Math.round(nearbyAssets.reduce((sum, asset) => sum + asset.healthScore, 0) / nearbyAssets.length)
        : 0
    const openHazardsNearby = nearbyAssets.reduce((sum, asset) => sum + asset.activeHazardCount, 0)
    const heroAsset = nearbyAssets.find((asset) => asset.roadId === 'SS-W12-R211') ?? nearbyAssets[0]
    const activeReport = openReports[0]
    const criticalAssets = assets.filter((asset) => asset.riskBand === 'critical')

    return {
      nearbyAssets,
      openReports,
      avgHealth,
      openHazardsNearby,
      heroAsset,
      activeReport,
      criticalAssets,
    }
  }, [user?.id])

  return (
    <div className="space-y-6">
      <div className="rounded-[16px] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Chip active>Ward {user?.ward ?? DEMO_WARD}</Chip>
              <span className="text-caption text-muted">Pilot municipality</span>
            </div>
            <h1 className="text-2xl font-bold text-ink">Good morning, {user?.name.split(' ')[0]}</h1>
            <p className="text-body mt-1 text-slate">Report, track and explore the roads around you.</p>
          </div>
          <div className="text-right">
            <div className="text-caption text-muted">Your Ward</div>
            <div className="text-h2 font-mono-road text-primary">Ward {user?.ward ?? DEMO_WARD}</div>
          </div>
        </div>

        {loading || !data ? (
          <div className="grid gap-4 md:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <MetricCard
                label="Roads in your ward"
                value={data.nearbyAssets.length}
                icon={<Route size={20} />}
                trend={{ value: '+2 this quarter', positive: true }}
              />
              <MetricCard
                label="Open hazards nearby"
                value={data.openHazardsNearby}
                tint={data.openHazardsNearby > 0 ? 'warning' : 'success'}
                icon={<AlertCircle size={20} />}
                trend={{ value: data.openHazardsNearby > 0 ? 'Needs attention' : 'All clear', positive: data.openHazardsNearby === 0 }}
              />
              <MetricCard
                label="Area health index"
                value={data.avgHealth}
                tint={data.avgHealth >= 80 ? 'success' : data.avgHealth >= 60 ? 'warning' : 'danger'}
                icon={<Map size={20} />}
                trend={{ value: `${data.avgHealth >= 80 ? 'Healthy' : data.avgHealth >= 60 ? 'Watch' : 'Critical'} band`, positive: data.avgHealth >= 80 }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <ActionCard
                title="Report a Hazard"
                description="Report a road or public infrastructure issue in under 60 seconds."
                icon={<AlertCircle size={22} className="text-warning" />}
                to="/citizen/report"
                accent="warning"
                size="lg"
              />
              <ActionCard
                title="Explore Roads"
                description="View nearby road assets, hazards and maintenance activity on the map."
                icon={<Map size={22} className="text-primary" />}
                to="/citizen/map"
                accent="primary"
                size="lg"
              />
            </div>

            {data.criticalAssets.length > 0 ? (
              <ContentCard title="Nearby critical issues" subtitle="Roads requiring immediate attention" className="mb-6">
                <div className="space-y-3">
                  {data.criticalAssets.slice(0, 2).map((asset) => (
                    <Link
                      key={asset.id}
                      to={`/citizen/passport/${asset.roadId}`}
                      className="flex items-center justify-between rounded-[10px] border border-border px-4 py-4 hover:bg-surface-recessed transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-[8px] bg-danger/10 text-danger">
                          <AlertCircle size={18} />
                        </div>
                        <div>
                          <div className="font-mono-road text-sm text-primary">{asset.roadId}</div>
                          <div className="text-h3 mt-0.5 text-ink">{asset.name}</div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-danger px-2 py-1 rounded-full bg-danger/10">Critical</span>
                    </Link>
                  ))}
                </div>
              </ContentCard>
            ) : null}

            {data.activeReport ? (
              <ContentCard
                title="Your active report"
                subtitle={`${data.openReports.length} active report${data.openReports.length !== 1 ? 's' : ''}`}
                className="mb-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-warning/10 text-warning">
                        <AlertCircle size={16} />
                      </div>
                      <div className="text-h3 text-ink truncate">
                        {data.activeReport.hazardType.replaceAll('_', ' ')}
                      </div>
                    </div>
                    <p className="text-sm mt-1 text-slate truncate">
                      {data.activeReport.roadId} · {data.activeReport.locationLabel}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <LifecycleRibbon status={data.activeReport.status} />
                      <span className="text-xs text-muted">
                        Updated {new Date(data.activeReport.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/citizen/reports/${data.activeReport.reportId}`}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-primary text-white text-sm font-medium hover:bg-primary-hover shrink-0"
                  >
                    View Details
                  </Link>
                </div>
              </ContentCard>
            ) : (
              <ContentCard
                title="No active reports"
                subtitle="All your reported hazards have been resolved"
                className="mb-6"
              >
                <Link
                  to="/citizen/report"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-primary text-white text-sm font-medium hover:bg-primary-hover"
                >
                  Report a Hazard
                </Link>
              </ContentCard>
            )}

            <div className="grid gap-4 xl:grid-cols-2">
              <ContentCard title="Nearby roads map" subtitle="Tap a road to view its passport" className="h-full">
                <MapPanel assets={data.nearbyAssets} height="300px" />
              </ContentCard>

              <ContentCard
                title="Featured Road Passport"
                subtitle="SS-W12-R211 — Market Road"
                className="h-full"
              >
                {data.heroAsset ? (
                  <Link
                    to={`/citizen/passport/${data.heroAsset.roadId}`}
                    className="block rounded-[12px] border border-border p-4 hover:bg-surface-recessed transition-colors h-full"
                  >
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-[12px] bg-primary/10 text-primary shrink-0">
                        <Route size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono-road text-sm text-primary">{data.heroAsset.roadId}</div>
                        <div className="text-xl font-semibold mt-1 text-ink truncate">{data.heroAsset.name}</div>
                        <p className="text-sm mt-1 text-slate truncate">{data.heroAsset.location}</p>
                        <div className="flex items-center gap-2 mt-4 text-primary">
                          <span className="text-sm font-medium">View Passport</span>
                          <Route size={16} />
                        </div>
                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted">Health Score</span>
                            <span className="font-semibold text-ink">{data.heroAsset.healthScore}/100</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted">Status</span>
                            <span className="font-medium text-success">{data.heroAsset.riskBand}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : null}
              </ContentCard>
            </div>
          </>
        )}
      </div>
    </div>
  )
}