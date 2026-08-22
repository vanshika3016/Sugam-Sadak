import { api } from '@/lib/api'
import type {
  GeoPoint,
  InternalRoadView,
  PublicRoadView,
  RoadAsset,
  RoadAssetFilters,
} from '@/types/entities'

export async function getAll(filters?: RoadAssetFilters): Promise<RoadAsset[]> {
  return api.getRoadAssets(filters)
}

export async function getById(roadId: string): Promise<RoadAsset> {
  return api.getRoadAssetById(roadId)
}

export async function search(query: string): Promise<RoadAsset[]> {
  return api.getRoadAssets({ search: query })
}

export async function findNearest(lat: number, lng: number): Promise<RoadAsset> {
  return api.findNearestRoadAsset(lat, lng)
}

export async function getPublicView(roadId: string): Promise<PublicRoadView> {
  return api.getPublicView(roadId)
}

export async function getInternalView(roadId: string): Promise<InternalRoadView> {
  return api.getInternalView(roadId)
}

export async function getMapPoints(): Promise<Array<RoadAsset & { point: GeoPoint }>> {
  const assets = await api.getRoadAssets()
  return assets.map((asset) => ({ ...asset, point: asset.coordinates }))
}