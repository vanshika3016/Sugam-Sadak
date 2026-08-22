export const ROLES = ['citizen', 'government', 'contractor'] as const
export type Role = (typeof ROLES)[number]

export const HAZARD_STATUSES = [
  'reported',
  'verified',
  'assigned',
  'in_repair',
  'inspection',
  'resolved',
  'reopen_window',
  'closed',
] as const
export type HazardStatus = (typeof HAZARD_STATUSES)[number]

export const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const
export type Severity = (typeof SEVERITIES)[number]

export const RISK_BANDS = ['healthy', 'watch', 'maintenance_due', 'critical'] as const
export type RiskBand = (typeof RISK_BANDS)[number]

export const HAZARD_TYPES = [
  'pothole',
  'open_manhole',
  'broken_streetlight',
  'missing_barricade',
  'road_damage',
  'bridge_damage',
  'drainage_issue',
  'other',
] as const
export type HazardType = (typeof HAZARD_TYPES)[number]

export const DLP_FLAG_STATUSES = [
  'none',
  'possible_recurrence',
  'chargeable_confirmed',
  'not_chargeable',
] as const
export type DLPFlagStatus = (typeof DLP_FLAG_STATUSES)[number]

export const TASK_STATUSES = [
  'pending_acceptance',
  'accepted',
  'in_progress',
  'submitted',
  'completed',
  'failed_inspection',
] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const INSPECTION_STATUSES = ['pending', 'scheduled', 'completed'] as const
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number]

export const INSPECTION_RESULTS = ['pass', 'fail', 'pending'] as const
export type InspectionResult = (typeof INSPECTION_RESULTS)[number]

export const LIFECYCLE_STEPS = [
  'reported',
  'verified',
  'assigned',
  'in_repair',
  'inspection',
  'resolved',
] as const
export type LifecycleStep = (typeof LIFECYCLE_STEPS)[number]

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type Priority = (typeof PRIORITIES)[number]

export const ROAD_SURFACE_TYPES = ['asphalt', 'concrete', 'paver', 'gravel', 'unknown'] as const
export type RoadSurfaceType = (typeof ROAD_SURFACE_TYPES)[number]

export const ROAD_TYPES = ['primary', 'secondary', 'connector', 'internal'] as const
export type RoadType = (typeof ROAD_TYPES)[number]

export type PassportViewMode = 'public' | 'internal'

export const HAZARD_TYPE_LABELS: Record<HazardType, string> = {
  pothole: 'Pothole',
  open_manhole: 'Open Manhole',
  broken_streetlight: 'Broken Streetlight',
  missing_barricade: 'Missing Barricade',
  road_damage: 'Road Damage',
  bridge_damage: 'Bridge Damage',
  drainage_issue: 'Drainage Issue',
  other: 'Other',
}

export const HAZARD_STATUS_LABELS: Record<HazardStatus, string> = {
  reported: 'Reported',
  verified: 'Verified',
  assigned: 'Assigned',
  in_repair: 'In Repair',
  inspection: 'Inspection',
  resolved: 'Resolved',
  reopen_window: 'Reopen Window',
  closed: 'Closed',
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const RISK_BAND_LABELS: Record<RiskBand, string> = {
  healthy: 'Healthy',
  watch: 'Watch',
  maintenance_due: 'Maintenance Due',
  critical: 'Critical',
}

export const ROLE_LABELS: Record<Role, string> = {
  citizen: 'Citizen',
  government: 'Government (Ward JE / EE)',
  contractor: 'Contractor',
}
