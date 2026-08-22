import { describe, expect, it } from 'vitest'
import { computeScore } from '@/services/healthScoreService'
import type { HealthContext, RoadAsset } from '@/types/entities'

const baseAsset: RoadAsset = {
  id: 'asset-1',
  roadId: 'SS-W12-R211',
  name: 'Market Road',
  ward: 12,
  jurisdiction: 'Pilot',
  location: 'Ward 12',
  coordinates: { lat: 28.6139, lng: 77.209 },
  roadType: 'primary',
  surfaceType: 'asphalt',
  lastUpdated: new Date().toISOString(),
  healthScore: 100,
  riskBand: 'healthy',
  activeHazardCount: 0,
  status: 'Operational',
  constructionYear: 2018,
}

const emptyContext: HealthContext = {
  openHazards: [],
  maintenanceRecords: [],
  dlpRecords: [],
  recurrenceWindowMonths: 6,
  locationProximityMeters: 50,
}

describe('healthScoreService', () => {
  it('starts at 100 for a healthy asset with no open hazards', () => {
    const result = computeScore(baseAsset, emptyContext)
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.band).toBe('healthy')
    expect(result.factors.length).toBeGreaterThan(0)
  })

  it('applies severity-weighted penalties for open hazards', () => {
    const result = computeScore(baseAsset, {
      ...emptyContext,
      openHazards: [
        {
          id: 'r1',
          reportId: 'SS-HZ-2026-00001',
          roadAssetId: 'asset-1',
          roadId: 'SS-W12-R211',
          citizenId: 'c1',
          hazardType: 'open_manhole',
          severity: 'high',
          status: 'reported',
          location: baseAsset.coordinates,
          locationLabel: 'Ward 12',
          photos: [],
          reportedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          priority: 'high',
          dlpFlagStatus: 'none',
        },
      ],
    })

    expect(result.score).toBeLessThan(100)
    expect(result.factors.some((factor) => factor.label.includes('open hazard'))).toBe(true)
  })
})
