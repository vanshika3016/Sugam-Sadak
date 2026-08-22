export const DLP_DURATION_MONTHS = 12
export const RECURRENCE_WINDOW_MONTHS = 6
export const LOCATION_PROXIMITY_METERS = 50
export const REOPEN_WINDOW_DAYS = 7

export const AGE_DEPRECIATION_MAX = 10
export const AGE_DEPRECIATION_PER_YEAR = 0.5

export const SEVERITY_PENALTIES = {
  low: 2,
  medium: 4,
  high: 8,
  critical: 12,
} as const

export const RECURRENCE_PENALTY = 5
export const MAINTENANCE_BONUS = 4

export const RISK_BAND_THRESHOLDS = {
  healthy: 80,
  watch: 60,
  maintenance_due: 40,
} as const

export const DEMO_WARD = 12

export const STORAGE_KEYS = {
  mockDatabase: 'sugam_sadak_mock_db_v1',
  session: 'sugam_sadak_session_v1',
} as const

export const PILOT_JURISDICTION = 'Urban Local Body — Pilot Municipality'
