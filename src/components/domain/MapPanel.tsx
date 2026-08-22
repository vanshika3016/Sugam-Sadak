import { cn } from '@/lib/cn'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import type { RoadAsset } from '@/types/entities'
import { RiskBandBadge } from '@/components/badges/StatusBadge'
import { useMemo } from 'react'

const markerColors: Record<RoadAsset['riskBand'], string> = {
  healthy: '#15803D',
  watch: '#B45309',
  maintenance_due: '#B45309',
  critical: '#B91C1C',
}

function createMarkerIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:999px;background:${color};border:2px solid white;box-shadow:0 1px 2px rgba(15,23,42,.25)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

interface MapPanelProps {
  assets: RoadAsset[]
  center?: [number, number]
  zoom?: number
  className?: string
  onSelectAsset?: (asset: RoadAsset) => void
  selectedAssetId?: string
  height?: string
}

export function MapPanel({
  assets,
  center = [28.6139, 77.209],
  zoom = 13,
  className,
  onSelectAsset,
  height = '420px',
}: MapPanelProps) {
  const icons = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(markerColors).map(([band, color]) => [band, createMarkerIcon(color)]),
      ) as Record<RoadAsset['riskBand'], L.DivIcon>,
    [],
  )

  return (
    <div className={cn('overflow-hidden rounded-[10px] border border-border', className)}>
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-2">
        <span className="text-caption text-muted">Legend</span>
        <RiskBandBadge band="healthy" />
        <RiskBandBadge band="watch" />
        <RiskBandBadge band="critical" />
      </div>
      <div style={{ height }}>
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {assets.map((asset) => (
            <Marker
              key={asset.id}
              position={[asset.coordinates.lat, asset.coordinates.lng]}
              icon={icons[asset.riskBand]}
              eventHandlers={{
                click: () => onSelectAsset?.(asset),
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-mono-road text-small text-primary">{asset.roadId}</div>
                  <div className="text-h3">{asset.name}</div>
                  <RiskBandBadge band={asset.riskBand} />
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
