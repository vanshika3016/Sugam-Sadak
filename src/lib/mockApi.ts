import { getDatabase } from '@/services/mockStore'
import { locationKey } from '@/lib/format'
import type {
  User,
  Contractor,
  RoadAsset,
  HazardReport,
  ContractorTask,
  MaintenanceRecord,
  InspectionRecord,
  DLPRecord,
  LifecycleEvent,
  CostEvent,
  DocumentRecord,
  AuditLogEntry,
  CreateHazardInput,
  RepairEvidence,
  RoadAssetFilters,
  CaseFilters,
  ContractorDashboardData,
  PublicRoadView,
  InternalRoadView,
} from '@/types/entities'
import type { Priority } from '@/types/enums'

// Mock API implementation using mockStore
export const mockApi = {
  // Auth
  async getCurrentUser(): Promise<User | null> {
    return null
  },

  async signInWithEmail(email: string, password: string) {
    throw new Error('Email auth not supported in demo mode')
  },

  async signUpWithEmail(email: string, password: string, metadata: { name: string; role: string }) {
    throw new Error('Email auth not supported in demo mode')
  },

  async signOut() {
    // Handled by auth store
  },

  async demoLogin(role: 'citizen' | 'government' | 'contractor'): Promise<User> {
    const db = getDatabase()
    const demoUsers = db.users.filter(u => u.role === role)
    if (demoUsers.length === 0) throw new Error(`No demo user for role: ${role}`)
    return demoUsers[0]
  },

  // Users
  async getUsers(): Promise<User[]> {
    const db = getDatabase()
    return db.users
  },

  async getUserById(id: string): Promise<User | null> {
    const db = getDatabase()
    return db.users.find(u => u.id === id) ?? null
  },

  // Contractors
  async getContractors(): Promise<Contractor[]> {
    const db = getDatabase()
    return db.contractors
  },

  async getContractorById(id: string): Promise<Contractor | null> {
    const db = getDatabase()
    return db.contractors.find(c => c.id === id) ?? null
  },

  // Road Assets
  async getRoadAssets(filters?: RoadAssetFilters): Promise<RoadAsset[]> {
    const db = getDatabase()
    let assets = db.roadAssets
    if (filters?.ward) assets = assets.filter(a => a.ward === filters.ward)
    if (filters?.riskBand) assets = assets.filter(a => a.riskBand === filters.riskBand)
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      assets = assets.filter(a => 
        a.roadId.toLowerCase().includes(search) ||
        a.name.toLowerCase().includes(search) ||
        a.location.toLowerCase().includes(search)
      )
    }
    return assets
  },

  async getRoadAssetById(roadId: string): Promise<RoadAsset> {
    const db = getDatabase()
    const asset = db.roadAssets.find(a => a.roadId === roadId || a.id === roadId)
    if (!asset) throw new Error(`Road asset not found: ${roadId}`)
    return asset
  },

  async getPublicView(roadId: string): Promise<PublicRoadView> {
    const asset = await this.getRoadAssetById(roadId)
    return {
      roadId: asset.roadId,
      name: asset.name,
      location: asset.location,
      ward: asset.ward,
      riskBand: asset.riskBand,
      status: asset.status,
      openIssueCount: asset.activeHazardCount,
      lastUpdated: asset.lastUpdated,
    }
  },

  async getInternalView(roadId: string): Promise<InternalRoadView> {
    const asset = await this.getRoadAssetById(roadId)
    const db = getDatabase()
    
    const hazards = db.hazardReports.filter(h => h.roadAssetId === asset.id)
    const maintenance = db.maintenanceRecords.filter(m => m.roadAssetId === asset.id)
    const inspections = db.inspections.filter(i => i.roadAssetId === asset.id)
    const contractors = await this.getContractorsForRoadAsset(asset.id)
    const costs = db.costEvents.filter(c => c.roadAssetId === asset.id)
    const documents = db.documents.filter(d => d.roadAssetId === asset.id)
    const lifecycle = db.lifecycleEvents.filter(l => l.roadId === asset.roadId)
    const dlp = db.dlpRecords.filter(d => d.roadAssetId === asset.id && d.isActive)

    const health = { score: asset.healthScore, band: asset.riskBand, factors: [], priorQuarterScore: asset.healthScore + 6 }

    return {
      ...asset,
      health,
      activeHazards: hazards.filter(h => !['resolved', 'closed'].includes(h.status)),
      maintenanceRecords: maintenance,
      inspections,
      contractors,
      costEvents: costs,
      documents,
      lifecycleEvents: lifecycle,
      activeDlpRecords: dlp,
      allocatedBudgetInr: asset.allocatedBudgetInr ?? 250000,
      spentBudgetInr: asset.spentBudgetInr ?? 0,
    }
  },

  async findNearestRoadAsset(lat: number, lng: number): Promise<RoadAsset> {
    const db = getDatabase()
    let nearest = db.roadAssets[0]
    let minDist = Infinity
    for (const asset of db.roadAssets) {
      const dist = Math.sqrt(
        Math.pow(asset.coordinates.lat - lat, 2) + Math.pow(asset.coordinates.lng - lng, 2)
      )
      if (dist < minDist) {
        minDist = dist
        nearest = asset
      }
    }
    if (!nearest) throw new Error('No road assets available')
    return nearest
  },

  // Hazard Reports
  async createHazardReport(input: CreateHazardInput): Promise<HazardReport> {
    const db = getDatabase()
    const sequence = db.reportIdCounter++
    const reportId = `SS-HZ-2026-${String(sequence).padStart(6, '0')}`
    
    const newReport: HazardReport = {
      id: `report-${Date.now()}`,
      reportId,
      roadAssetId: input.roadAssetId,
      roadId: (await this.getRoadAssetById(input.roadAssetId)).roadId,
      citizenId: input.citizenId,
      hazardType: input.hazardType,
      severity: input.severity,
      status: 'reported',
      description: input.description,
      location: input.location,
      locationLabel: input.locationLabel,
      photos: input.photos,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedDepartment: 'Roads & Infrastructure',
      priority: input.severity === 'critical' ? 'urgent' : input.severity === 'high' ? 'high' : 'medium',
      dlpFlagStatus: 'none',
      expectedNextStep: 'Awaiting verification by Ward JE',
    }
    
    db.hazardReports.push(newReport)
    
    // Check for DLP recurrence
    const activeDlpRecords = db.dlpRecords.filter(
      d => d.roadAssetId === input.roadAssetId && d.isActive && new Date(d.expiresAt) > new Date()
    )
    
    if (activeDlpRecords.length) {
      const reportLocationKey = locationKey(input.location)
      const matched = activeDlpRecords.find(
        d => d.roadAssetId === input.roadAssetId && d.locationKey === reportLocationKey
      )
      if (matched) {
        newReport.dlpFlagStatus = 'possible_recurrence'
        newReport.expectedNextStep = 'Possible DLP recurrence — pending Executive Engineer review'
      }
    }
    
    // Append lifecycle event
    db.lifecycleEvents.push({
      id: `life-${Date.now()}`,
      roadAssetId: input.roadAssetId,
      roadId: newReport.roadId,
      reportId: newReport.reportId,
      type: 'hazard',
      title: `${input.hazardType.replace('_', ' ')} reported`,
      status: 'reported',
      occurredAt: new Date().toISOString(),
    })
    
    return newReport
  },

  async getHazardReportById(reportId: string): Promise<HazardReport> {
    const db = getDatabase()
    const report = db.hazardReports.find(r => r.id === reportId || r.reportId === reportId)
    if (!report) throw new Error(`Hazard report not found: ${reportId}`)
    return report
  },

  async getHazardReportsByCitizen(citizenId: string): Promise<HazardReport[]> {
    const db = getDatabase()
    return db.hazardReports.filter(h => h.citizenId === citizenId).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  },

  async getHazardReports(filters?: CaseFilters): Promise<HazardReport[]> {
    const db = getDatabase()
    let reports = db.hazardReports
    
    if (filters?.severity) reports = reports.filter(r => r.severity === filters.severity)
    if (filters?.status) reports = reports.filter(r => r.status === filters.status)
    if (filters?.contractorId) reports = reports.filter(r => r.assignedContractorId === filters.contractorId)
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      reports = reports.filter(r => 
        r.reportId.toLowerCase().includes(search) ||
        r.roadId.toLowerCase().includes(search) ||
        r.locationLabel.toLowerCase().includes(search)
      )
    }
    if (filters?.ward) {
      const assetIds = db.roadAssets.filter(a => a.ward === filters.ward).map(a => a.id)
      reports = reports.filter(r => assetIds.includes(r.roadAssetId))
    }
    
    return reports.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },

  async getHazardReportsByRoadAsset(roadAssetId: string): Promise<HazardReport[]> {
    const db = getDatabase()
    return db.hazardReports.filter(h => h.roadAssetId === roadAssetId)
  },

  async verifyHazardReport(reportId: string, officerId: string): Promise<HazardReport> {
    const db = getDatabase()
    const report = await this.getHazardReportById(reportId)
    const officer = await this.getUserById(officerId)
    
    report.status = 'verified'
    report.expectedNextStep = 'Assign contractor for repair'
    report.updatedAt = new Date().toISOString()
    
    db.lifecycleEvents.push({
      id: `life-${Date.now()}`,
      roadAssetId: report.roadAssetId,
      roadId: report.roadId,
      reportId: report.reportId,
      type: 'verification',
      title: 'Hazard verified by Ward JE',
      status: 'verified',
      actorName: officer?.name,
      occurredAt: new Date().toISOString(),
    })
    
    return report
  },

  async assignContractor(reportId: string, contractorId: string, officerId: string): Promise<HazardReport> {
    const db = getDatabase()
    const contractor = await this.getContractorById(contractorId)
    const officer = await this.getUserById(officerId)
    if (!contractor) throw new Error('Contractor not found')
    
    const report = await this.getHazardReportById(reportId)
    
    report.status = 'assigned'
    report.assignedContractorId = contractor.id
    report.assignedContractorName = contractor.name
    report.expectedNextStep = 'Contractor to accept and begin repair'
    report.updatedAt = new Date().toISOString()
    
    // Create contractor task
    const taskSequence = db.taskIdCounter++
    const taskId = `SS-TK-2026-${String(taskSequence).padStart(5, '0')}`
    
    const task: ContractorTask = {
      id: `task-${Date.now()}`,
      taskId,
      reportId: report.reportId,
      hazardReportId: report.id,
      contractorId: contractor.id,
      roadAssetId: report.roadAssetId,
      roadId: report.roadId,
      roadName: (await this.getRoadAssetById(report.roadAssetId)).name,
      hazardType: report.hazardType,
      severity: report.severity,
      location: report.locationLabel,
      status: 'pending_acceptance',
      hazardStatus: 'assigned',
      priority: report.priority,
      slaDays: 3,
      deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
      instructions: 'Complete repair and submit before/after evidence for inspection.',
      evidence: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    db.contractorTasks.push(task)
    report.taskId = task.id
    
    db.lifecycleEvents.push({
      id: `life-${Date.now()}`,
      roadAssetId: report.roadAssetId,
      roadId: report.roadId,
      reportId: report.reportId,
      type: 'assignment',
      title: `Assigned to ${contractor.name}`,
      status: 'assigned',
      actorName: officer?.name,
      occurredAt: new Date().toISOString(),
    })
    
    return report
  },

  async confirmDLPCharge(reportId: string, chargeable: boolean, officerId: string): Promise<HazardReport> {
    const db = getDatabase()
    const report = await this.getHazardReportById(reportId)
    const officer = await this.getUserById(officerId)
    
    report.dlpFlagStatus = chargeable ? 'chargeable_confirmed' : 'not_chargeable'
    report.updatedAt = new Date().toISOString()
    
    return report
  },

  async changePriority(reportId: string, priority: Priority): Promise<HazardReport> {
    const db = getDatabase()
    const report = await this.getHazardReportById(reportId)
    report.priority = priority
    report.updatedAt = new Date().toISOString()
    return report
  },

  async getAuditLogs(reportId: string): Promise<AuditLogEntry[]> {
    const db = getDatabase()
    return db.auditLogs
      .filter(a => a.reportId === reportId)
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
  },

  // Contractor Tasks
  async getContractorDashboard(contractorId: string): Promise<ContractorDashboardData> {
    const db = getDatabase()
    const tasks = db.contractorTasks.filter(t => t.contractorId === contractorId)
    const contractor = await this.getContractorById(contractorId)
    const dlpRecords = db.dlpRecords.filter(d => d.contractorId === contractorId && d.isActive)
    const lifecycleEvents = db.lifecycleEvents
      .filter(l => tasks.map(t => t.reportId).includes(l.reportId ?? ''))
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, 5)

    const now = Date.now()
    const dueSoonThreshold = now + 2 * 86400000

    return {
      assigned: tasks.filter(t => t.status === 'pending_acceptance').length,
      inProgress: tasks.filter(t => ['accepted', 'in_progress'].includes(t.status)).length,
      dueSoon: tasks.filter(t => !['completed', 'failed_inspection'].includes(t.status) && new Date(t.deadline).getTime() <= dueSoonThreshold && new Date(t.deadline).getTime() >= now).length,
      overdue: tasks.filter(t => !['completed', 'failed_inspection'].includes(t.status) && new Date(t.deadline).getTime() < now).length,
      completed: tasks.filter(t => t.status === 'completed').length,
      priorityTasks: tasks.filter(t => t.status !== 'completed').sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 5),
      recentActivity: lifecycleEvents,
      dlpExposure: dlpRecords,
      performanceSummary: {
        onTimePercent: contractor?.onTimePercent ?? 0,
        completedCount: contractor?.completedTasks ?? 0,
        averageResolutionDays: 2.4,
      },
    }
  },

  async getContractorTasks(contractorId: string): Promise<ContractorTask[]> {
    const db = getDatabase()
    return db.contractorTasks.filter(t => t.contractorId === contractorId).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  },

  async getContractorTaskById(taskId: string): Promise<ContractorTask> {
    const db = getDatabase()
    const task = db.contractorTasks.find(t => t.id === taskId || t.taskId === taskId)
    if (!task) throw new Error(`Task not found: ${taskId}`)
    return task
  },

  async acceptTask(taskId: string): Promise<ContractorTask> {
    const db = getDatabase()
    const task = await this.getContractorTaskById(taskId)
    task.status = 'accepted'
    task.updatedAt = new Date().toISOString()
    return task
  },

  async startRepair(taskId: string): Promise<ContractorTask> {
    const db = getDatabase()
    const task = await this.getContractorTaskById(taskId)
    
    // Update hazard report status
    const report = await this.getHazardReportById(task.reportId)
    report.status = 'in_repair'
    report.expectedNextStep = 'Repair in progress — submit completion evidence'
    report.updatedAt = new Date().toISOString()
    
    db.lifecycleEvents.push({
      id: `life-${Date.now()}`,
      roadAssetId: task.roadAssetId,
      roadId: task.roadId,
      reportId: task.reportId,
      type: 'repair',
      title: 'Repair started',
      status: 'in_repair',
      occurredAt: new Date().toISOString(),
    })
    
    task.status = 'in_progress'
    task.hazardStatus = 'in_repair'
    task.updatedAt = new Date().toISOString()
    
    return task
  },

  async submitCompletion(taskId: string, evidence: RepairEvidence): Promise<ContractorTask> {
    const db = getDatabase()
    const task = await this.getContractorTaskById(taskId)
    const report = await this.getHazardReportById(task.reportId)
    
    const allEvidence = [...evidence.beforePhotos, ...evidence.afterPhotos]
    
    // Create inspection record
    const inspection: InspectionRecord = {
      id: `inspection-${Date.now()}`,
      reportId: report.reportId,
      roadAssetId: task.roadAssetId,
      taskId: task.id,
      officerId: (await this.getUsers()).find(u => u.role === 'government')?.id ?? '',
      officerName: 'Rajesh Kumar',
      status: 'pending',
      scheduledDate: new Date().toISOString(),
      result: 'pending',
      evidence: allEvidence,
      remarks: evidence.workDescription,
    }
    db.inspections.push(inspection)
    
    db.lifecycleEvents.push({
      id: `life-${Date.now()}`,
      roadAssetId: task.roadAssetId,
      roadId: task.roadId,
      reportId: task.reportId,
      type: 'submission',
      title: 'Repair submitted for inspection',
      status: 'inspection',
      occurredAt: new Date().toISOString(),
    })
    
    task.status = 'submitted'
    task.hazardStatus = 'inspection'
    task.evidence = allEvidence
    task.updatedAt = new Date().toISOString()
    
    return task
  },

  async completeTaskAfterInspection(taskId: string): Promise<ContractorTask> {
    const db = getDatabase()
    const task = await this.getContractorTaskById(taskId)
    const report = await this.getHazardReportById(task.reportId)
    const contractor = await this.getContractorById(task.contractorId)
    
    if (report && contractor) {
      const repairId = `repair-${task.id}`
      const dlpRecord: DLPRecord = {
        id: `dlp-${Date.now()}`,
        roadAssetId: task.roadAssetId,
        roadId: task.roadId,
        contractorId: contractor.id,
        contractorName: contractor.name,
        repairId,
        locationKey: `${report.location.lat},${report.location.lng}`,
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 12 * 30 * 86400000).toISOString(),
        isActive: true,
      }
      db.dlpRecords.push(dlpRecord)
      
      const costInr = report.severity === 'high' ? 42500 : 18500
      db.maintenanceRecords.push({
        id: `maint-${Date.now()}`,
        roadAssetId: task.roadAssetId,
        date: new Date().toISOString(),
        workPerformed: `${report.hazardType.replace('_', ' ')} repair`,
        contractorId: contractor.id,
        contractorName: contractor.name,
        costInr,
        result: 'Completed',
        locationKey: `${report.location.lat},${report.location.lng}`,
      })
      
      db.costEvents.push({
        id: `cost-${Date.now()}`,
        roadAssetId: task.roadAssetId,
        date: new Date().toISOString(),
        description: `${report.hazardType.replace('_', ' ')} repair — ${contractor.name}`,
        amountInr: costInr,
        category: 'Routine maintenance',
      })
      
      db.lifecycleEvents.push({
        id: `life-${Date.now()}`,
        roadAssetId: task.roadAssetId,
        roadId: task.roadId,
        reportId: task.reportId,
        type: 'maintenance',
        title: 'Repair completed — DLP window started',
        description: `${contractor.name} — warranty active for 12 months`,
        status: 'resolved',
        occurredAt: new Date().toISOString(),
      })
      
      report.status = 'resolved'
      report.expectedNextStep = 'Case resolved — DLP window active'
      report.updatedAt = new Date().toISOString()
    }
    
    task.status = 'completed'
    task.hazardStatus = 'resolved'
    task.updatedAt = new Date().toISOString()
    
    return task
  },

  async reopenTaskAfterFailedInspection(taskId: string): Promise<ContractorTask> {
    const db = getDatabase()
    const task = await this.getContractorTaskById(taskId)
    
    const report = await this.getHazardReportById(task.reportId)
    report.status = 'in_repair'
    report.expectedNextStep = 'Inspection failed — repair required'
    report.updatedAt = new Date().toISOString()
    
    task.status = 'failed_inspection'
    task.hazardStatus = 'in_repair'
    task.updatedAt = new Date().toISOString()
    
    return task
  },

  // Inspections
  async getPendingInspections(): Promise<InspectionRecord[]> {
    const db = getDatabase()
    return db.inspections.filter(i => i.status === 'pending')
  },

  async getInspectionById(inspectionId: string): Promise<InspectionRecord> {
    const db = getDatabase()
    const inspection = db.inspections.find(i => i.id === inspectionId)
    if (!inspection) throw new Error(`Inspection not found: ${inspectionId}`)
    return inspection
  },

  async getAllInspections(): Promise<InspectionRecord[]> {
    const db = getDatabase()
    return db.inspections
  },

  async getInspectionsByRoadAsset(roadAssetId: string): Promise<InspectionRecord[]> {
    const db = getDatabase()
    return db.inspections.filter(i => i.roadAssetId === roadAssetId)
  },

  async approveInspection(inspectionId: string, input: { remarks?: string; officerId: string }): Promise<InspectionRecord> {
    const db = getDatabase()
    const inspection = await this.getInspectionById(inspectionId)
    const officer = await this.getUserById(input.officerId)
    
    inspection.status = 'completed'
    inspection.completedDate = new Date().toISOString()
    inspection.result = 'pass'
    inspection.remarks = input.remarks
    inspection.officerId = input.officerId
    inspection.officerName = officer?.name ?? inspection.officerName
    
    // Update hazard report to resolved
    const report = await this.getHazardReportById(inspection.reportId)
    report.status = 'resolved'
    report.updatedAt = new Date().toISOString()
    report.expectedNextStep = 'Case resolved — DLP window active'
    
    // Complete contractor task
    if (inspection.taskId) {
      await this.completeTaskAfterInspection(inspection.taskId)
    }
    
    db.lifecycleEvents.push({
      id: `life-${Date.now()}`,
      roadAssetId: inspection.roadAssetId,
      roadId: (await this.getRoadAssetById(inspection.roadAssetId)).roadId,
      reportId: inspection.reportId,
      type: 'inspection',
      title: 'Inspection passed — case resolved',
      status: 'resolved',
      actorName: officer?.name,
      occurredAt: new Date().toISOString(),
    })
    
    return inspection
  },

  async failInspection(inspectionId: string, input: { remarks?: string; officerId: string }): Promise<InspectionRecord> {
    const db = getDatabase()
    const inspection = await this.getInspectionById(inspectionId)
    const officer = await this.getUserById(input.officerId)
    
    inspection.status = 'completed'
    inspection.completedDate = new Date().toISOString()
    inspection.result = 'fail'
    inspection.remarks = input.remarks
    inspection.officerId = input.officerId
    inspection.officerName = officer?.name ?? inspection.officerName
    
    // Update hazard report back to in_repair
    const report = await this.getHazardReportById(inspection.reportId)
    report.status = 'in_repair'
    report.updatedAt = new Date().toISOString()
    report.expectedNextStep = 'Inspection failed — contractor must rework repair'
    
    // Reopen contractor task
    if (inspection.taskId) {
      await this.reopenTaskAfterFailedInspection(inspection.taskId)
    }
    
    db.lifecycleEvents.push({
      id: `life-${Date.now()}`,
      roadAssetId: inspection.roadAssetId,
      roadId: (await this.getRoadAssetById(inspection.roadAssetId)).roadId,
      reportId: inspection.reportId,
      type: 'inspection',
      title: 'Inspection failed — repair reopened',
      status: 'in_repair',
      actorName: officer?.name,
      occurredAt: new Date().toISOString(),
    })
    
    return inspection
  },

  // DLP
  async getActiveDLPRecords(roadAssetId: string): Promise<DLPRecord[]> {
    const db = getDatabase()
    return db.dlpRecords.filter(d => d.roadAssetId === roadAssetId && d.isActive)
  },

  async getContractorDLPRecords(contractorId: string): Promise<DLPRecord[]> {
    const db = getDatabase()
    return db.dlpRecords.filter(d => d.contractorId === contractorId && d.isActive)
  },

  // Lifecycle
  async appendLifecycleEvent(event: Omit<LifecycleEvent, 'id'>): Promise<LifecycleEvent> {
    const db = getDatabase()
    const newEvent: LifecycleEvent = {
      ...event,
      id: `life-${Date.now()}`,
    }
    db.lifecycleEvents.push(newEvent)
    return newEvent
  },

  async getLifecycleEvents(roadId: string): Promise<LifecycleEvent[]> {
    const db = getDatabase()
    return db.lifecycleEvents.filter(l => l.roadId === roadId).sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
  },

  async syncRoadAssetHealth(roadAssetId: string): Promise<RoadAsset> {
    const db = getDatabase()
    const asset = db.roadAssets.find(a => a.id === roadAssetId)
    if (asset) {
      asset.lastUpdated = new Date().toISOString()
    }
    return asset!
  },

  // Maintenance Records
  async getMaintenanceRecords(roadAssetId: string): Promise<MaintenanceRecord[]> {
    const db = getDatabase()
    return db.maintenanceRecords.filter(m => m.roadAssetId === roadAssetId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  // Cost Events
  async getCostEvents(roadAssetId: string): Promise<CostEvent[]> {
    const db = getDatabase()
    return db.costEvents.filter(c => c.roadAssetId === roadAssetId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  // Documents
  async getDocuments(roadAssetId: string): Promise<DocumentRecord[]> {
    const db = getDatabase()
    return db.documents.filter(d => d.roadAssetId === roadAssetId).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  },

  // Contractors for road asset
  async getContractorsForRoadAsset(roadAssetId: string): Promise<Array<{ contractorId: string; contractorName: string; taskCount: number; onTimePercent: number; dlpStatus?: string }>> {
    const db = getDatabase()
    const tasks = db.contractorTasks.filter(t => t.roadAssetId === roadAssetId)
    const contractorMap = new Map<string, { name: string; count: number }>()
    for (const task of tasks) {
      const contractor = await this.getContractorById(task.contractorId)
      if (contractor) {
        const existing = contractorMap.get(contractor.id)
        contractorMap.set(contractor.id, { name: contractor.name, count: (existing?.count ?? 0) + 1 })
      }
    }
    const dlpRecords = db.dlpRecords.filter(r => r.roadAssetId === roadAssetId && r.isActive)
    return Array.from(contractorMap.entries()).map(([contractorId, value]) => {
      const activeDlp = dlpRecords.find(r => r.contractorId === contractorId)
      return {
        contractorId,
        contractorName: value.name,
        taskCount: value.count,
        onTimePercent: 0,
        dlpStatus: activeDlp ? `Active until ${new Date(activeDlp.expiresAt).toLocaleDateString()}` : undefined,
      }
    })
  },

  // Audit Log
  async appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'occurredAt' | 'prevEntryHash' | 'entryHash'>): Promise<void> {
    const db = getDatabase()
    db.auditLogs.push({
      ...entry,
      id: `audit-${Date.now()}`,
      occurredAt: new Date().toISOString(),
    })
  },

  // File Upload
  async uploadPhoto(file: File, path: string): Promise<string> {
    return URL.createObjectURL(file)
  },

  // Realtime subscriptions (no-op in mock)
  subscribeToHazardReports(callback: (payload: any) => void) { return { unsubscribe: () => {} } },
  subscribeToContractorTasks(contractorId: string, callback: (payload: any) => void) { return { unsubscribe: () => {} } },
  subscribeToInspections(callback: (payload: any) => void) { return { unsubscribe: () => {} } },
  subscribeToTable(table: string, callback: (payload: any) => void) { return { unsubscribe: () => {} } },
  unsubscribe(channel: any) {},
}