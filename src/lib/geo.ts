import type { GeoPoint, RoadAsset } from '@/types/entities'
import { haversineMeters } from '@/lib/format'

export function findNearestRoadAsset(
  point: GeoPoint,
  assets: RoadAsset[],
): RoadAsset | null {
  if (assets.length === 0) return null

  return assets.reduce((nearest, asset) => {
    const nearestDistance = haversineMeters(point, nearest.coordinates)
    const assetDistance = haversineMeters(point, asset.coordinates)
    return assetDistance < nearestDistance ? asset : nearest
  })
}

export function filterRoadAssetsWithinRadius(
  point: GeoPoint,
  assets: RoadAsset[],
  radiusMeters: number,
): RoadAsset[] {
  return assets.filter(
    (asset) => haversineMeters(point, asset.coordinates) <= radiusMeters,
  )
}
