import { api } from '@/lib/api'
import type { LifecycleEvent } from '@/types/entities'

export function appendLifecycleEvent(event: Omit<LifecycleEvent, 'id'>): Promise<LifecycleEvent> {
  return api.appendLifecycleEvent(event)
}

export async function getTimeline(roadId: string): Promise<LifecycleEvent[]> {
  return api.getLifecycleEvents(roadId)
}

export async function syncRoadAssetHealth(roadAssetId: string): Promise<void> {
  await api.syncRoadAssetHealth(roadAssetId)
}

export async function syncAllRoadHealth(): Promise<void> {
  // This would iterate all road assets and sync health
  // For now, it's a no-op since health is computed on-demand
}