// @ts-nocheck
import { DLPBadge } from '@/components/badges/DLPBadge'
import { RiskBandBadge } from '@/components/badges/StatusBadge'
import { ContentCard } from '@/components/cards/ContentCard'
import { MetricCard } from '@/components/cards/MetricCard'
import { ErrorState } from '@/components/data/ErrorState'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { Chip } from '@/components/ui/Chip'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePermissions } from '@/hooks/useAuth'
import { formatDate, formatInr, formatRelativeDate } from '@/lib/format'
import { getInternalView, getPublicView } from '@/services/roadAssetService'
import type { InternalRoadView, PublicRoadView } from '@/types/entities'
import { useMemo, useState } from 'react'
import { Shield, AlertCircle, MapPin, Calendar, DollarSign, Building2, ClipboardList, FileText, Image, Settings, TrendingUp, Wrench, CheckCircle, XCircle, HardHat, Map, Route, BarChart3, Layers, Award, BadgeCheck } from 'lucide-react'

import { OverviewTab } from './tabs/OverviewTab'
import { HealthTab } from './tabs/HealthTab'
import { LifecycleTab } from './tabs/LifecycleTab'
import { MaintenanceTab } from './tabs/MaintenanceTab'
import { InspectionsTab } from './tabs/InspectionsTab'
import { ContractorsTab } from './tabs/ContractorsTab'
import { CostsTab } from './tabs/CostsTab'
import { DocumentsTab } from './tabs/DocumentsTab'

const TABS = [
  { key: 'overview', label: 'Overview', icon: Shield, public: true },
  { key: 'health', label: 'Health', icon: Shield, public: true },
  { key: 'lifecycle', label: 'Lifecycle', icon: Calendar, public: true },
  { key: 'maintenance', label: 'Maintenance', icon: Settings, public: false },
  { key: 'inspections', label: 'Inspections', icon: ClipboardList, public: false },
  { key: 'contractors', label: 'Contractors', icon: Building2, public: false },
  { key: 'costs', label: 'Costs', icon: DollarSign, public: false },
  { key: 'documents', label: 'Documents', icon: FileText, public: false },
] as const

type TabKey = typeof TABS[number]['key']

interface RoadPassportPageProps {
  roadId: string
}

function TabPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return <div style={{ display: active ? 'block' : 'none' }}>{children}</div>
}

function ViewModeBadge({ mode }: { mode: 'public' | 'internal' }) {
  if (mode === 'public') {
    return (
      <Chip variant="outline" className="text-xs">
        <BadgeCheck size={10} className="mr-1" />
        Public View
      </Chip>
    )
  }
  return (
    <Chip className="text-xs">
      <Shield size={10} className="mr-1" />
      Internal View
    </Chip>
  )
}

export function RoadPassportPage({ roadId }: RoadPassportPageProps) {
  const { passportViewMode, passportFields } = usePermissions()
  const [tab, setTab] = useState<TabKey>('overview')

  const { data, loading, error, reload } = useAsyncData(async () => {
    if (passportViewMode === 'public') {
      const publicView = await getPublicView(roadId)
      return { mode: 'public' as const, publicView }
    }
    const internalView = await getInternalView(roadId)
    return { mode: 'internal' as const, internalView }
  }, [roadId, passportViewMode])

  const visibleTabs = useMemo(() => {
    if (passportViewMode === 'public') {
      return TABS.filter(t => t.public).map(t => t.key)
    }
    return TABS.map(t => t.key)
  }, [passportViewMode])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Digital Road Passport" title="Loading..." subtitle="Fetching road asset data" />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return <ErrorState message={error ?? 'Road passport not found.'} onRetry={reload} />
  }

  const internal = data.mode === 'internal' ? data.internalView : null
  const publicView = data.mode === 'public' ? data.publicView : null
  const asset = internal ?? publicView

  if (!asset) {
    return <ErrorState message="Road asset not found." onRetry={reload} />
  }

  const activeDlpCount = internal?.activeDlpRecords.length ?? 0

  const header = (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Digital Road Passport"
        title={asset.name}
        subtitle={asset.location}
        action={<ViewModeBadge mode={passportViewMode} />}
      />

      <div className="rounded-[16px] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-[12px] bg-primary/10 text-primary">
                <Shield size={24} />
              </div>
              <div>
                <div className="font-mono-road text-3xl font-bold text-primary">{roadId}</div>
                <div className="text-sm text-slate mt-1">
                  Ward {asset.ward} · {asset.jurisdiction}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {passportFields.showExactHealthScore && internal ? (
              <MetricCard
                label="Health Score"
                value={`${internal.health.score}/100`}
                tint={
                  internal.health.band === 'healthy' ? 'success'
                  : internal.health.band === 'critical' ? 'danger'
                  : 'warning'
                }
                className="min-w-[160px]"
                trend={{ value: internal.health.priorQuarterScore ? `${internal.health.score - internal.health.priorQuarterScore >= 0 ? '+' : ''}${internal.health.score - internal.health.priorQuarterScore} vs last quarter` : 'No prior data', positive: internal.health.priorQuarterScore ? internal.health.score >= internal.health.priorQuarterScore : true }}
              />
            ) : (
              <div className="rounded-[12px] border border-border bg-surface-recessed px-6 py-4 min-w-[160px]">
                <div className="text-xs text-muted">Health Band</div>
                <div className="mt-2 flex items-center gap-2">
                  <RiskBandBadge band={asset.riskBand} />
                  <span className="text-sm font-medium text-ink capitalize">{asset.riskBand}</span>
                </div>
              </div>
            )}
            <div className="rounded-[12px] border border-border bg-surface-recessed px-6 py-4 min-w-[140px]">
              <div className="text-xs text-muted">Status</div>
              <div className="text-xl font-semibold text-ink mt-1">{asset.status}</div>
            </div>
            <div className="rounded-[12px] border border-border bg-surface-recessed px-6 py-4 min-w-[160px]">
              <div className="text-xs text-muted">Last Updated</div>
              <div className="text-xl font-semibold text-ink mt-1">
                {formatRelativeDate(asset.lastUpdated)}
              </div>
            </div>
            {activeDlpCount > 0 && (
              <div className="rounded-[12px] border border-warning/30 bg-warning/5 px-6 py-4 min-w-[180px]">
                <div className="flex items-center gap-2 text-xs font-medium text-warning">
                  <AlertCircle size={12} />
                  <span>{activeDlpCount} Active DLP</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {internal?.activeDlpRecords.length && (
          <div className="mt-4 space-y-2">
            {internal.activeDlpRecords.map((record) => (
              <div key={record.id} className="rounded-[10px] border border-warning/20 bg-warning/5 p-4">
                <DLPBadge record={record} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex flex-wrap gap-2 mb-4">
            {visibleTabs.map((item) => {
              const tabDef = TABS.find(t => t.key === item)
              return (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border transition-colors duration-150 text-sm font-medium ${
                    tab === item
                      ? 'bg-primary text-white border-primary shadow-[0_2px_8px_rgb(59,130,246,0.3)]'
                      : 'bg-surface text-slate border-border hover:bg-surface-recessed'
                  }`}
                >
                  <tabDef.icon size={14} />
                  {tabDef.label}
                </button>
              )
            })}
          </div>

          <div className="mt-6 space-y-6">
            <TabPanel active={tab === 'overview'}>
              <OverviewTab
                internal={internal}
                publicView={publicView}
                asset={asset}
                showExactScore={passportFields.showExactHealthScore}
              />
            </TabPanel>
            <TabPanel active={tab === 'health'}>
              <HealthTab
                internal={internal}
                publicView={publicView}
                viewMode={passportViewMode}
              />
            </TabPanel>
            <TabPanel active={tab === 'lifecycle'}>
              <LifecycleTab internal={internal} />
            </TabPanel>
            <TabPanel active={tab === 'maintenance'}>
              <MaintenanceTab
                internal={internal}
                showTable={passportFields.showMaintenanceTable}
              />
            </TabPanel>
            <TabPanel active={tab === 'inspections'}>
              <InspectionsTab
                internal={internal}
                showTable={passportFields.showInspectionsTable}
              />
            </TabPanel>
            <TabPanel active={tab === 'contractors'}>
              <ContractorsTab
                internal={internal}
                showTable={passportFields.showContractorsTab}
              />
            </TabPanel>
            <TabPanel active={tab === 'costs'}>
              <CostsTab
                internal={internal}
                showTable={passportFields.showCostHistoryTab}
              />
            </TabPanel>
            <TabPanel active={tab === 'documents'}>
              <DocumentsTab
                internal={internal}
                showTable={passportFields.showDocumentsTab}
              />
            </TabPanel>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {header}
    </>
  )
}