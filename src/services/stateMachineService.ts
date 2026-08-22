import type { HazardStatus } from '@/types/enums'

const TRANSITIONS: Record<HazardStatus, HazardStatus[]> = {
  reported: ['verified', 'closed'],
  verified: ['assigned', 'closed'],
  assigned: ['in_repair', 'closed'],
  in_repair: ['inspection', 'closed'],
  inspection: ['resolved', 'in_repair', 'closed'],
  resolved: ['reopen_window', 'closed'],
  reopen_window: ['reported', 'closed'],
  closed: [],
}

export function canTransition(from: HazardStatus, to: HazardStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function assertTransition(from: HazardStatus, to: HazardStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid hazard status transition: ${from} → ${to}`)
  }
}

export function nextStatuses(from: HazardStatus): HazardStatus[] {
  return TRANSITIONS[from] ?? []
}

export function statusToLifecycleIndex(status: HazardStatus): number {
  const map: Partial<Record<HazardStatus, number>> = {
    reported: 0,
    verified: 1,
    assigned: 2,
    in_repair: 3,
    inspection: 4,
    resolved: 5,
    reopen_window: 5,
    closed: 5,
  }
  return map[status] ?? 0
}
