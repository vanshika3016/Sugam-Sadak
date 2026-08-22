import type {
  DLPFlagStatus,
  HazardStatus,
  HazardType,
  InspectionResult,
  InspectionStatus,
  Priority,
  RiskBand,
  RoadSurfaceType,
  RoadType,
  Role,
  Severity,
  TaskStatus,
} from './enums'

export interface GeoPoint {
  lat: number
  lng: number
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  ward?: number
  contractorId?: string
  avatarInitial: string
}

export interface Contractor {
  id: string
  name: string
  rating: number
  onTimePercent: number
  activeTasks: number
  completedTasks: number
  overdueTasks: number
}

export interface EvidencePhoto {
  id: string
  url: string
  label?: string
  capturedAt: string
}

export interface RoadAsset {
  id: string
  roadId: string
  name: string
  ward: number
  jurisdiction: string
  location: string
  coordinates: GeoPoint
  roadType: RoadType
  surfaceType: RoadSurfaceType
  lengthMeters?: number
  widthMeters?: number
  constructionYear?: number
  constructingAgency?: string
  lastMaintenanceDate?: string
  lastUpdated: string
  healthScore: number
  riskBand: RiskBand
  activeHazardCount: number
  status: string
  allocatedBudgetInr?: number
  spentBudgetInr?: number
}

export interface HazardReport {
  id: string
  reportId: string
  roadAssetId: string
  roadId: string
  citizenId: string
  hazardType: HazardType
  severity: Severity
  status: HazardStatus
  description?: string
  location: GeoPoint
  locationLabel: string
  photos: EvidencePhoto[]
  reportedAt: string
  updatedAt: string
  assignedDepartment?: string
  assignedContractorId?: string
  assignedContractorName?: string
  taskId?: string
  priority: Priority
  dlpFlagStatus: DLPFlagStatus
  expectedNextStep?: string
}

export interface ContractorTask {
  id: string
  taskId: string
  reportId: string
  hazardReportId: string
  contractorId: string
  roadAssetId: string
  roadId: string
  roadName: string
  hazardType: HazardType
  severity: Severity
  location: string
  status: TaskStatus
  hazardStatus: HazardStatus
  priority: Priority
  slaDays: number
  deadline: string
  instructions?: string
  evidence: EvidencePhoto[]
  createdAt: string
  updatedAt: string
}

export interface MaintenanceRecord {
  id: string
  roadAssetId: string
  date: string
  workPerformed: string
  contractorId: string
  contractorName: string
  costInr: number
  result: string
  evidenceUrl?: string
  locationKey?: string
}

export interface InspectionRecord {
  id: string
  reportId: string
  roadAssetId: string
  taskId?: string
  officerId: string
  officerName: string
  status: InspectionStatus
  scheduledDate?: string
  completedDate?: string
  condition?: string
  remarks?: string
  result: InspectionResult
  evidence: EvidencePhoto[]
}

export interface DLPRecord {
  id: string
  roadAssetId: string
  roadId: string
  contractorId: string
  contractorName: string
  repairId: string
  locationKey: string
  startedAt: string
  expiresAt: string
  isActive: boolean
}

export interface LifecycleEvent {
  id: string
  roadAssetId: string
  roadId: string
  reportId?: string
  type: string
  title: string
  description?: string
  status?: HazardStatus
  actorName?: string
  occurredAt: string
}

export interface CostEvent {
  id: string
  roadAssetId: string
  date: string
  description: string
  amountInr: number
  category: string
}

export interface DocumentRecord {
  id: string
  roadAssetId: string
  title: string
  url: string
  uploadedAt: string
}

export interface AuditLogEntry {
  id: string
  reportId: string
  action: string
  actorId: string
  actorName: string
  details?: string
  occurredAt: string
}

export interface ContributingFactor {
  label: string
  delta: number
  kind: 'penalty' | 'bonus' | 'base'
}

export interface HealthScoreResult {
  score: number
  band: RiskBand
  factors: ContributingFactor[]
  priorQuarterScore?: number
}

export interface PublicRoadView {
  roadId: string
  name: string
  location: string
  ward: number
  riskBand: RiskBand
  status: string
  openIssueCount: number
  lastUpdated: string
}

export interface InternalRoadView extends RoadAsset {
  health: HealthScoreResult
  activeHazards: HazardReport[]
  maintenanceRecords: MaintenanceRecord[]
  inspections: InspectionRecord[]
  contractors: Array<{
    contractorId: string
    contractorName: string
    taskCount: number
    onTimePercent: number
    dlpStatus?: string
  }>
  costEvents: CostEvent[]
  documents: DocumentRecord[]
  lifecycleEvents: LifecycleEvent[]
  activeDlpRecords: DLPRecord[]
  allocatedBudgetInr: number
  spentBudgetInr: number
}

export interface CreateHazardInput {
  citizenId: string
  hazardType: HazardType
  severity: Severity
  description?: string
  location: GeoPoint
  locationLabel: string
  roadAssetId: string
  photos: EvidencePhoto[]
}

export interface RepairEvidence {
  beforePhotos: EvidencePhoto[]
  afterPhotos: EvidencePhoto[]
  workDescription: string
  materialsNotes?: string
  completionDate: string
}

export interface RoadAssetFilters {
  ward?: number
  riskBand?: RiskBand
  search?: string
}

export interface CaseFilters {
  severity?: Severity
  status?: HazardStatus
  ward?: number
  contractorId?: string
  search?: string
}

export interface ContractorDashboardData {
  assigned: number
  inProgress: number
  dueSoon: number
  overdue: number
  completed: number
  priorityTasks: ContractorTask[]
  recentActivity: LifecycleEvent[]
  dlpExposure: DLPRecord[]
  performanceSummary: {
    onTimePercent: number
    completedCount: number
    averageResolutionDays: number
  }
}

export interface DLPCheckResult {
  flagged: boolean
  flagStatus: DLPFlagStatus
  matchedDlpId?: string
  contractorName?: string
  message?: string
}

export interface DLPConfig {
  durationMonths: number
}

export interface CompletedRepair {
  roadAssetId: string
  roadId: string
  contractorId: string
  contractorName: string
  repairId: string
  locationKey: string
  completedAt: string
}

export interface HealthContext {
  openHazards: HazardReport[]
  maintenanceRecords: MaintenanceRecord[]
  dlpRecords: DLPRecord[]
  recurrenceWindowMonths: number
  locationProximityMeters: number
}

export interface MockDatabase {
  users: User[]
  contractors: Contractor[]
  roadAssets: RoadAsset[]
  hazardReports: HazardReport[]
  contractorTasks: ContractorTask[]
  maintenanceRecords: MaintenanceRecord[]
  inspections: InspectionRecord[]
  dlpRecords: DLPRecord[]
  lifecycleEvents: LifecycleEvent[]
  costEvents: CostEvent[]
  documents: DocumentRecord[]
  auditLogs: AuditLogEntry[]
  reportIdCounter: number
  taskIdCounter: number
}

export interface SessionState {
  currentUserId: string | null
}
