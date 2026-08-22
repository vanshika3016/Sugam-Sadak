import { MAINTENANCE_BONUS, RECURRENCE_PENALTY, RISK_BAND_THRESHOLDS, SEVERITY_PENALTIES } from '@/lib/constants'
import { haversineMeters, isWithinMonths, locationKey } from '@/lib/format'
import type { ContributingFactor, HealthContext, HealthScoreResult, RoadAsset } from '@/types/entities'
import type { RiskBand } from '@/types/enums'
import { AGE_DEPRECIATION_MAX, AGE_DEPRECIATION_PER_YEAR } from '@/lib/constants'

function scoreToBand(score: number): RiskBand {
  if (score >= RISK_BAND_THRESHOLDS.healthy) return 'healthy'
  if (score >= RISK_BAND_THRESHOLDS.watch) return 'watch'
  if (score >= RISK_BAND_THRESHOLDS.maintenance_due) return 'maintenance_due'
  return 'critical'
}

function countRecurrenceAtLocation(
  context: HealthContext,
): { count: number; label?: string } {
  const resolvedReports = context.openHazards.filter((h) => h.status === 'resolved')
  const openReports = context.openHazards.filter((h) =>
    ['reported', 'verified', 'assigned', 'in_repair', 'inspection'].includes(h.status),
  )

  let recurrenceCount = 0

  for (const open of openReports) {
    const priorAtLocation = resolvedReports.filter(
      (resolved) =>
        locationKey(resolved.location) === locationKey(open.location) &&
        isWithinMonths(resolved.reportedAt, open.reportedAt, context.recurrenceWindowMonths),
    )
    recurrenceCount += priorAtLocation.length
  }

  if (recurrenceCount > 0) {
    return {
      count: recurrenceCount,
      label: `−${RECURRENCE_PENALTY * recurrenceCount} recurrence: repeat report at this location within ${context.recurrenceWindowMonths} months`,
    }
  }

  return { count: 0 }
}

export function computeScore(asset: RoadAsset, context: HealthContext): HealthScoreResult {
  const factors: ContributingFactor[] = [{ label: 'Base healthy asset score', delta: 100, kind: 'base' }]
  let score = 100

  if (asset.constructionYear) {
    const ageYears = new Date().getFullYear() - asset.constructionYear
    const depreciation = Math.min(AGE_DEPRECIATION_MAX, ageYears * AGE_DEPRECIATION_PER_YEAR)
    if (depreciation > 0) {
      score -= depreciation
      factors.push({
        label: `−${depreciation} age-based depreciation (${ageYears} years)`,
        delta: -depreciation,
        kind: 'penalty',
      })
    }
  }

  const openHazards = context.openHazards.filter((h) =>
    ['reported', 'verified', 'assigned', 'in_repair', 'inspection'].includes(h.status),
  )

  for (const hazard of openHazards) {
    const penalty = SEVERITY_PENALTIES[hazard.severity]
    score -= penalty
    factors.push({
      label: `−${penalty} open hazard: ${hazard.hazardType.replaceAll('_', ' ')}, ${hazard.severity} severity`,
      delta: -penalty,
      kind: 'penalty',
    })
  }

  const recurrence = countRecurrenceAtLocation(context)
  if (recurrence.count > 0 && recurrence.label) {
    const penalty = RECURRENCE_PENALTY * recurrence.count
    score -= penalty
    factors.push({ label: recurrence.label, delta: -penalty, kind: 'penalty' })
  }

  const recentMaintenance = context.maintenanceRecords
    .filter((record) => isWithinMonths(record.date, new Date().toISOString(), 6))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  if (recentMaintenance) {
    const hasRecurrenceSinceRepair = openHazards.some(
      (hazard) =>
        new Date(hazard.reportedAt) > new Date(recentMaintenance.date) &&
        haversineMeters(hazard.location, asset.coordinates) <= context.locationProximityMeters,
    )

    if (!hasRecurrenceSinceRepair) {
      score += MAINTENANCE_BONUS
      factors.push({
        label: `+${MAINTENANCE_BONUS} recent repair, no recurrence`,
        delta: MAINTENANCE_BONUS,
        kind: 'bonus',
      })
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  const priorQuarterScore = Math.min(100, score + 6)

  return {
    score,
    band: scoreToBand(score),
    factors,
    priorQuarterScore,
  }
}

export function recomputeRoadHealth(
  asset: RoadAsset,
  context: HealthContext,
): Pick<RoadAsset, 'healthScore' | 'riskBand' | 'activeHazardCount' | 'lastUpdated'> {
  const result = computeScore(asset, context)
  const activeHazardCount = context.openHazards.filter((h) =>
    ['reported', 'verified', 'assigned', 'in_repair', 'inspection'].includes(h.status),
  ).length

  return {
    healthScore: result.score,
    riskBand: result.band,
    activeHazardCount,
    lastUpdated: new Date().toISOString(),
  }
}
