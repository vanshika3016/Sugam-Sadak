import { RiskBandBadge } from '@/components/badges/StatusBadge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { formatRelativeDate } from '@/lib/format'
import type { RoadAsset } from '@/types/entities'
import { MapPin } from 'lucide-react'

interface RoadAssetCardProps {
  asset: RoadAsset
  showExactScore?: boolean
  onClick?: () => void
  className?: string
}

export function RoadAssetCard({
  asset,
  showExactScore = false,
  onClick,
  className,
}: RoadAssetCardProps) {
  const inner = (
    <>
      <div className="font-mono-road text-small text-primary">{asset.roadId}</div>
      <div className="text-h3 mt-1 text-ink">{asset.name}</div>
      <div className="text-small mt-1 inline-flex items-center gap-1 text-slate">
        <MapPin size={14} />
        {asset.location}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RiskBandBadge band={asset.riskBand} />
        {showExactScore ? (
          <span className="text-small text-slate">Score {asset.healthScore}/100</span>
        ) : null}
        <span className="text-small text-muted">{asset.activeHazardCount} open issues</span>
      </div>
      <div className="text-small mt-2 text-muted">
        Updated {formatRelativeDate(asset.lastUpdated)}
      </div>
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn('w-full text-left', className)}>
        <Card className="p-4 transition-colors duration-150 hover:bg-surface-recessed">{inner}</Card>
      </button>
    )
  }

  return <Card className={cn('p-4', className)}>{inner}</Card>
}
