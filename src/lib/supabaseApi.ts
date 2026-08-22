import { supabase } from '@/lib/supabase'
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

// Helper to convert Supabase row to app types
function toUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    role: row.role,
    ward: row.ward,
    contractorId: row.contractor_id,
    avatarInitial: row.avatar_initial,
  }
}

function toContractor(row: any): Contractor {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    onTimePercent: row.on_time_percent,
    activeTasks: row.active_tasks,
    completedTasks: row.completed_tasks,
    overdueTasks: row.overdue_tasks,
  }
}

function toRoadAsset(row: any): RoadAsset {
  const coords = row.coordinates ? JSON.parse(row.coordinates) : { lat: 0, lng: 0 }
  return {
    id: row.id,
    roadId: row.road_id,
    name: row.name,
    ward: row.ward,
    jurisdiction: row.jurisdiction,
    location: row.location,
    coordinates: { lat: coords.coordinates?.[1] ?? coords.lat ?? 0, lng: coords.coordinates?.[0] ?? coords.lng ?? 0 },
    roadType: row.road_type,
    surfaceType: row.surface_type,
    lengthMeters: row.length_meters,
    widthMeters: row.width_meters,
    constructionYear: row.construction_year,
    constructingAgency: row.constructing_agency,
    lastMaintenanceDate: row.last_maintenance_date,
    lastUpdated: row.last_updated,
    healthScore: row.health_score,
    riskBand: row.risk_band,
    activeHazardCount: row.active_hazard_count,
    status: row.status,
  }
}

function toHazardReport(row: any): HazardReport {
  const loc = row.location ? JSON.parse(row.location) : { lat: 0, lng: 0 }
  return {
    id: row.id,
    reportId: row.report_id,
    roadAssetId: row.road_asset_id,
    roadId: row.road_id,
    citizenId: row.citizen_id,
    hazardType: row.hazard_type,
    severity: row.severity,
    status: row.status,
    description: row.description,
    location: { lat: loc.coordinates?.[1] ?? loc.lat ?? 0, lng: loc.coordinates?.[0] ?? loc.lng ?? 0 },
    locationLabel: row.location_label,
    photos: row.photos ?? [],
    reportedAt: row.reported_at,
    updatedAt: row.updated_at,
    assignedDepartment: row.assigned_department,
    assignedContractorId: row.assigned_contractor_id,
    assignedContractorName: row.assigned_contractor_name,
    taskId: row.task_id,
    priority: row.priority,
    dlpFlagStatus: row.dlp_flag_status,
    expectedNextStep: row.expected_next_step,
  }
}

function toContractorTask(row: any): ContractorTask {
  return {
    id: row.id,
    taskId: row.task_id,
    reportId: row.report_id,
    hazardReportId: row.hazard_report_id,
    contractorId: row.contractor_id,
    roadAssetId: row.road_asset_id,
    roadId: row.road_id,
    roadName: row.road_name,
    hazardType: row.hazard_type,
    severity: row.severity,
    location: row.location,
    status: row.status,
    hazardStatus: row.hazard_status,
    priority: row.priority,
    slaDays: row.sla_days,
    deadline: row.deadline,
    instructions: row.instructions,
    evidence: row.evidence ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toMaintenanceRecord(row: any): MaintenanceRecord {
  return {
    id: row.id,
    roadAssetId: row.road_asset_id,
    date: row.date,
    workPerformed: row.work_performed,
    contractorId: row.contractor_id,
    contractorName: row.contractor_name,
    costInr: row.cost_inr,
    result: row.result,
    evidenceUrl: row.evidence_url,
    locationKey: row.location_key,
  }
}

function toInspectionRecord(row: any): InspectionRecord {
  return {
    id: row.id,
    reportId: row.report_id,
    roadAssetId: row.road_asset_id,
    taskId: row.task_id,
    officerId: row.officer_id,
    officerName: row.officer_name,
    status: row.status,
    scheduledDate: row.scheduled_date,
    completedDate: row.completed_date,
    condition: row.condition,
    remarks: row.remarks,
    result: row.result,
    evidence: row.evidence ?? [],
  }
}

function toDLPRecord(row: any): DLPRecord {
  return {
    id: row.id,
    roadAssetId: row.road_asset_id,
    roadId: row.road_id,
    contractorId: row.contractor_id,
    contractorName: row.contractor_name,
    repairId: row.repair_id,
    locationKey: row.location_key,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    isActive: row.is_active,
  }
}

function toLifecycleEvent(row: any): LifecycleEvent {
  return {
    id: row.id,
    roadAssetId: row.road_asset_id,
    roadId: row.road_id,
    reportId: row.report_id,
    type: row.type,
    title: row.title,
    description: row.description,
    status: row.status,
    actorName: row.actor_name,
    occurredAt: row.occurred_at,
  }
}

function toCostEvent(row: any): CostEvent {
  return {
    id: row.id,
    roadAssetId: row.road_asset_id,
    date: row.date,
    description: row.description,
    amountInr: row.amount_inr,
    category: row.category,
  }
}

function toDocumentRecord(row: any): DocumentRecord {
  return {
    id: row.id,
    roadAssetId: row.road_asset_id,
    title: row.title,
    url: row.url,
    uploadedAt: row.uploaded_at,
  }
}

function toAuditLogEntry(row: any): AuditLogEntry {
  return {
    id: row.id,
    reportId: row.report_id,
    action: row.action,
    actorId: row.actor_id,
    actorName: row.actor_name,
    details: row.details,
    occurredAt: row.occurred_at,
  }
}

// Supabase API implementation
export const supabaseApi = {
  // Auth
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single()
    if (error || !data) return null
    return toUser(data)
  },

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signUpWithEmail(email: string, password: string, metadata: { name: string; role: string }) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async demoLogin(role: 'citizen' | 'government' | 'contractor'): Promise<User> {
    const demoEmails: Record<string, string> = {
      citizen: 'demo-citizen@sugamsadak.in',
      government: 'demo-government@sugamsadak.in',
      contractor: 'demo-contractor@sugamsadak.in',
    }
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: demoEmails[role],
      password: 'demo123456',
    })
    if (error) throw error
    if (!authData.user) throw new Error('Demo user not found')
    const user = await this.getUserById(authData.user.id)
    if (!user) throw new Error('Demo user not found')
    return user
  },

  // Users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error
    return data.map(toUser)
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
    if (error) return null
    return toUser(data)
  },

  // Contractors
  async getContractors(): Promise<Contractor[]> {
    const { data, error } = await supabase.from('contractors').select('*')
    if (error) throw error
    return data.map(toContractor)
  },

  async getContractorById(id: string): Promise<Contractor | null> {
    const { data, error } = await supabase.from('contractors').select('*').eq('id', id).single()
    if (error) return null
    return toContractor(data)
  },

  // Road Assets
  async getRoadAssets(filters?: RoadAssetFilters): Promise<RoadAsset[]> {
    let query = supabase.from('road_assets').select('*')
    if (filters?.ward) query = query.eq('ward', filters.ward)
    if (filters?.riskBand) query = query.eq('risk_band', filters.riskBand)
    if (filters?.search) {
      query = query.or(`road_id.ilike.%${filters.search}%,name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
    }
    const { data, error } = await query
    if (error) throw error
    return data.map(toRoadAsset)
  },

  async getRoadAssetById(roadId: string): Promise<RoadAsset> {
    const { data, error } = await supabase.from('road_assets').select('*').or(`road_id.eq.${roadId},id.eq.${roadId}`).single()
    if (error) throw new Error(`Road asset not found: ${roadId}`)
    return toRoadAsset(data)
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
    const [hazards, maintenance, inspections, contractors, costs, documents, lifecycle, dlp] = await Promise.all([
      this.getHazardReportsByRoadAsset(asset.id),
      this.getMaintenanceRecords(asset.id),
      this.getInspectionsByRoadAsset(asset.id),
      this.getContractorsForRoadAsset(asset.id),
      this.getCostEvents(asset.id),
      this.getDocuments(asset.id),
      this.getLifecycleEvents(asset.roadId),
      this.getActiveDLPRecords(asset.id),
    ])

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
    const { data, error } = await supabase.rpc('find_nearest_road_asset', { lat, lng })
    if (error || !data?.length) throw new Error('No road assets available')
    return toRoadAsset(data[0])
  },

  // Hazard Reports
  async createHazardReport(input: CreateHazardInput): Promise<HazardReport> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { count } = await supabase.from('hazard_reports').select('*', { count: 'exact', head: true })
    const sequence = (count ?? 0) + 1
    const reportId = `SS-HZ-2026-${String(sequence).padStart(6, '0')}`

    const locationGeoJSON = JSON.stringify({ type: 'Point', coordinates: [input.location.lng, input.location.lat] })

    const { data, error } = await supabase.from('hazard_reports').insert({
      report_id: reportId,
      road_asset_id: input.roadAssetId,
      road_id: (await this.getRoadAssetById(input.roadAssetId)).roadId,
      citizen_id: input.citizenId,
      hazard_type: input.hazardType,
      severity: input.severity,
      status: 'reported',
      description: input.description,
      location: locationGeoJSON,
      location_label: input.locationLabel,
      photos: input.photos,
      assigned_department: 'Roads & Infrastructure',
      priority: input.severity === 'critical' ? 'urgent' : input.severity === 'high' ? 'high' : 'medium',
      dlp_flag_status: 'none',
      expected_next_step: 'Awaiting verification by Ward JE',
    }).select().single()

    if (error) throw error

    // Check for DLP recurrence
    const { data: activeDlpRecords } = await supabase
      .from('dlp_records')
      .select('*')
      .eq('road_asset_id', input.roadAssetId)
      .eq('is_active', true)

    if (activeDlpRecords?.length) {
      const reportLocationKey = locationKey(input.location)
      const matched = activeDlpRecords.find(
        (record) =>
          record.roadAssetId === input.roadAssetId &&
          record.locationKey === reportLocationKey &&
          new Date(record.expiresAt) > new Date(),
      )

      if (matched) {
        await supabase.from('hazard_reports').update({
          dlp_flag_status: 'possible_recurrence',
          expected_next_step: 'Possible DLP recurrence — pending Executive Engineer review',
          updated_at: new Date().toISOString(),
        }).eq('id', data.id)

        data.dlp_flag_status = 'possible_recurrence'
        data.expected_next_step = 'Possible DLP recurrence — pending Executive Engineer review'
      }
    }

    // Append lifecycle event
    await this.appendLifecycleEvent({
      roadAssetId: input.roadAssetId,
      roadId: (await this.getRoadAssetById(input.roadAssetId)).roadId,
      reportId: reportId,
      type: 'hazard',
      title: `${input.hazardType.replace('_', ' ')} reported`,
      status: 'reported',
      occurredAt: new Date().toISOString(),
    })

    await this.syncRoadAssetHealth(input.roadAssetId)

    return toHazardReport(data)
  },

  async getHazardReportById(reportId: string): Promise<HazardReport> {
    const { data, error } = await supabase.from('hazard_reports').select('*').or(`id.eq.${reportId},report_id.eq.${reportId}`).single()
    if (error) throw new Error(`Hazard report not found: ${reportId}`)
    return toHazardReport(data)
  },

  async getHazardReportsByCitizen(citizenId: string): Promise<HazardReport[]> {
    const { data, error } = await supabase.from('hazard_reports').select('*').eq('citizen_id', citizenId).order('updated_at', { ascending: false })
    if (error) throw error
    return data.map(toHazardReport)
  },

  async getHazardReports(filters?: CaseFilters): Promise<HazardReport[]> {
    let query = supabase.from('hazard_reports').select('*')
    if (filters?.severity) query = query.eq('severity', filters.severity)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.contractorId) query = query.eq('assigned_contractor_id', filters.contractorId)
    if (filters?.search) {
      query = query.or(`report_id.ilike.%${filters.search}%,road_id.ilike.%${filters.search}%,location_label.ilike.%${filters.search}%`)
    }
    if (filters?.ward) {
      const { data: assets } = await supabase.from('road_assets').select('id').eq('ward', filters.ward)
      if (assets?.length) {
        query = query.in('road_asset_id', assets.map(a => a.id))
      }
    }
    const { data, error } = await query.order('updated_at', { ascending: false })
    if (error) throw error
    return data.map(toHazardReport)
  },

  async getHazardReportsByRoadAsset(roadAssetId: string): Promise<HazardReport[]> {
    const { data, error } = await supabase.from('hazard_reports').select('*').eq('road_asset_id', roadAssetId)
    if (error) throw error
    return data.map(toHazardReport)
  },

  async verifyHazardReport(reportId: string, officerId: string): Promise<HazardReport> {
    const officer = await this.getUserById(officerId)
    const { data, error } = await supabase.from('hazard_reports').update({
      status: 'verified',
      expected_next_step: 'Assign contractor for repair',
      updated_at: new Date().toISOString(),
    }).eq('id', reportId).select().single()
    if (error) throw error

    await this.appendLifecycleEvent({
      roadAssetId: data.road_asset_id,
      roadId: data.road_id,
      reportId: data.report_id,
      type: 'verification',
      title: 'Hazard verified by Ward JE',
      status: 'verified',
      actorName: officer?.name,
      occurredAt: new Date().toISOString(),
    })

    await this.appendAuditLog({
      reportId: data.report_id,
      action: 'Verified hazard report',
      actorId: officerId,
      actorName: officer?.name ?? 'Officer',
    })

    await this.syncRoadAssetHealth(data.road_asset_id)
    return toHazardReport(data)
  },

  async assignContractor(reportId: string, contractorId: string, officerId: string): Promise<HazardReport> {
    const contractor = await this.getContractorById(contractorId)
    const officer = await this.getUserById(officerId)
    if (!contractor) throw new Error('Contractor not found')

    const report = await this.getHazardReportById(reportId)

    const { error: reportError } = await supabase.from('hazard_reports').update({
      status: 'assigned',
      assigned_contractor_id: contractor.id,
      assigned_contractor_name: contractor.name,
      expected_next_step: 'Contractor to accept and begin repair',
      updated_at: new Date().toISOString(),
    }).eq('id', report.id)
    if (reportError) throw reportError

    const { count } = await supabase.from('contractor_tasks').select('*', { count: 'exact', head: true })
    const taskSequence = (count ?? 0) + 1
    const taskId = `SS-TK-2026-${String(taskSequence).padStart(5, '0')}`

    const { data: task, error: taskError } = await supabase.from('contractor_tasks').insert({
      task_id: taskId,
      report_id: report.reportId,
      hazard_report_id: report.id,
      contractor_id: contractor.id,
      road_asset_id: report.roadAssetId,
      road_id: report.roadId,
      road_name: (await this.getRoadAssetById(report.roadAssetId)).name,
      hazard_type: report.hazardType,
      severity: report.severity,
      location: report.locationLabel,
      status: 'pending_acceptance',
      hazard_status: 'assigned',
      priority: report.priority,
      sla_days: 3,
      deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
      instructions: 'Complete repair and submit before/after evidence for inspection.',
    }).select().single()
    if (taskError) throw taskError

    await supabase.from('hazard_reports').update({ task_id: task.id }).eq('id', report.id)

    await this.appendLifecycleEvent({
      roadAssetId: report.roadAssetId,
      roadId: report.roadId,
      reportId: report.reportId,
      type: 'assignment',
      title: `Assigned to ${contractor.name}`,
      status: 'assigned',
      actorName: officer?.name,
      occurredAt: new Date().toISOString(),
    })

    return this.getHazardReportById(reportId)
  },

  async confirmDLPCharge(reportId: string, chargeable: boolean, officerId: string): Promise<HazardReport> {
    const officer = await this.getUserById(officerId)
    const { data, error } = await supabase.from('hazard_reports').update({
      dlp_flag_status: chargeable ? 'chargeable_confirmed' : 'not_chargeable',
      updated_at: new Date().toISOString(),
    }).eq('id', reportId).select().single()
    if (error) throw error

    await this.appendAuditLog({
      reportId: data.report_id,
      action: chargeable ? 'Confirmed contractor-chargeable DLP recurrence' : 'Marked recurrence as not chargeable',
      actorId: officerId,
      actorName: officer?.name ?? 'Officer',
    })

    return toHazardReport(data)
  },

  async changePriority(reportId: string, priority: Priority): Promise<HazardReport> {
    const { data, error } = await supabase.from('hazard_reports').update({
      priority,
      updated_at: new Date().toISOString(),
    }).eq('id', reportId).select().single()
    if (error) throw error
    return toHazardReport(data)
  },

  async getAuditLogs(reportId: string): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase.from('audit_logs').select('*').eq('report_id', reportId).order('occurred_at', { ascending: false })
    if (error) throw error
    return data.map(toAuditLogEntry)
  },

  // Contractor Tasks
  async getContractorDashboard(contractorId: string): Promise<ContractorDashboardData> {
    const { data: tasks, error } = await supabase.from('contractor_tasks').select('*').eq('contractor_id', contractorId)
    if (error) throw error
    const taskList = tasks.map(toContractorTask)

    const contractor = await this.getContractorById(contractorId)
    const { data: dlpRecords } = await supabase.from('dlp_records').select('*').eq('contractor_id', contractorId).eq('is_active', true)
    const { data: lifecycleEvents } = await supabase.from('lifecycle_events').select('*').in('report_id', taskList.map(t => t.reportId)).order('occurred_at', { ascending: false }).limit(5)

    const now = Date.now()
    const dueSoonThreshold = now + 2 * 86400000

    return {
      assigned: taskList.filter(t => t.status === 'pending_acceptance').length,
      inProgress: taskList.filter(t => ['accepted', 'in_progress'].includes(t.status)).length,
      dueSoon: taskList.filter(t => !['completed', 'failed_inspection'].includes(t.status) && new Date(t.deadline).getTime() <= dueSoonThreshold && new Date(t.deadline).getTime() >= now).length,
      overdue: taskList.filter(t => !['completed', 'failed_inspection'].includes(t.status) && new Date(t.deadline).getTime() < now).length,
      completed: taskList.filter(t => t.status === 'completed').length,
      priorityTasks: taskList.filter(t => t.status !== 'completed').sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 5),
      recentActivity: lifecycleEvents?.map(toLifecycleEvent) ?? [],
      dlpExposure: dlpRecords?.map(toDLPRecord) ?? [],
      performanceSummary: {
        onTimePercent: contractor?.onTimePercent ?? 0,
        completedCount: contractor?.completedTasks ?? 0,
        averageResolutionDays: 2.4,
      },
    }
  },

  async getContractorTasks(contractorId: string): Promise<ContractorTask[]> {
    const { data, error } = await supabase.from('contractor_tasks').select('*').eq('contractor_id', contractorId).order('deadline', { ascending: true })
    if (error) throw error
    return data.map(toContractorTask)
  },

  async getContractorTaskById(taskId: string): Promise<ContractorTask> {
    const { data, error } = await supabase.from('contractor_tasks').select('*').or(`id.eq.${taskId},task_id.eq.${taskId}`).single()
    if (error) throw new Error(`Task not found: ${taskId}`)
    return toContractorTask(data)
  },

  async acceptTask(taskId: string): Promise<ContractorTask> {
    const { data, error } = await supabase.from('contractor_tasks').update({
      status: 'accepted',
      updated_at: new Date().toISOString(),
    }).eq('id', taskId).select().single()
    if (error) throw error
    return toContractorTask(data)
  },

  async startRepair(taskId: string): Promise<ContractorTask> {
    const task = await this.getContractorTaskById(taskId)

    await supabase.from('hazard_reports').update({
      status: 'in_repair',
      expected_next_step: 'Repair in progress — submit completion evidence',
      updated_at: new Date().toISOString(),
    }).eq('id', task.hazardReportId)

    await this.appendLifecycleEvent({
      roadAssetId: task.roadAssetId,
      roadId: task.roadId,
      reportId: task.reportId,
      type: 'repair',
      title: 'Repair started',
      status: 'in_repair',
      occurredAt: new Date().toISOString(),
    })

    const { data, error } = await supabase.from('contractor_tasks').update({
      status: 'in_progress',
      hazard_status: 'in_repair',
      updated_at: new Date().toISOString(),
    }).eq('id', task.id).select().single()
    if (error) throw error

    await this.syncRoadAssetHealth(task.roadAssetId)
    return toContractorTask(data)
  },

  async submitCompletion(taskId: string, evidence: RepairEvidence): Promise<ContractorTask> {
    const task = await this.getContractorTaskById(taskId)
    const report = await this.getHazardReportById(task.reportId)

    const allEvidence = [...evidence.beforePhotos, ...evidence.afterPhotos]

    const { error: inspectionError } = await supabase.from('inspections').insert({
      report_id: report.reportId,
      road_asset_id: task.roadAssetId,
      task_id: task.id,
      officer_id: (await this.getUsers()).find(u => u.role === 'government')?.id ?? '',
      officer_name: 'Rajesh Kumar',
      status: 'pending',
      scheduled_date: new Date().toISOString(),
      result: 'pending',
      evidence: allEvidence,
      remarks: evidence.workDescription,
    })
    if (inspectionError) throw inspectionError

    await this.appendLifecycleEvent({
      roadAssetId: task.roadAssetId,
      roadId: task.roadId,
      reportId: task.reportId,
      type: 'submission',
      title: 'Repair submitted for inspection',
      status: 'inspection',
      occurredAt: new Date().toISOString(),
    })

    const { data, error } = await supabase.from('contractor_tasks').update({
      status: 'submitted',
      hazard_status: 'inspection',
      evidence: allEvidence,
      updated_at: new Date().toISOString(),
    }).eq('id', task.id).select().single()
    if (error) throw error

    await this.syncRoadAssetHealth(task.roadAssetId)
    return toContractorTask(data)
  },

  async completeTaskAfterInspection(taskId: string): Promise<ContractorTask> {
    const task = await this.getContractorTaskById(taskId)
    const report = await this.getHazardReportById(task.reportId)
    const contractor = await this.getContractorById(task.contractorId)

    if (report && contractor) {
      const repairId = `repair-${task.id}`
      const dlpRecord = {
        road_asset_id: task.roadAssetId,
        road_id: task.roadId,
        contractor_id: contractor.id,
        contractor_name: contractor.name,
        repair_id: repairId,
        location_key: `${report.location.lat},${report.location.lng}`,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 12 * 30 * 86400000).toISOString(),
        is_active: true,
      }
      await supabase.from('dlp_records').insert(dlpRecord)

      const costInr = report.severity === 'high' ? 42500 : 18500
      await supabase.from('maintenance_records').insert({
        road_asset_id: task.roadAssetId,
        date: new Date().toISOString(),
        work_performed: `${report.hazardType.replace('_', ' ')} repair`,
        contractor_id: contractor.id,
        contractor_name: contractor.name,
        cost_inr: costInr,
        result: 'Completed',
        location_key: `${report.location.lat},${report.location.lng}`,
      })

      await supabase.from('cost_events').insert({
        road_asset_id: task.roadAssetId,
        date: new Date().toISOString(),
        description: `${report.hazardType.replace('_', ' ')} repair — ${contractor.name}`,
        amount_inr: costInr,
        category: 'Routine maintenance',
      })

      await this.appendLifecycleEvent({
        roadAssetId: task.roadAssetId,
        roadId: task.roadId,
        reportId: task.reportId,
        type: 'maintenance',
        title: 'Repair completed — DLP window started',
        description: `${contractor.name} — warranty active for 12 months`,
        status: 'resolved',
        occurredAt: new Date().toISOString(),
      })

      await supabase.from('hazard_reports').update({
        status: 'resolved',
        expected_next_step: 'Case resolved — DLP window active',
        updated_at: new Date().toISOString(),
      }).eq('id', report.id)
    }

    await this.syncRoadAssetHealth(task.roadAssetId)

    const { data, error } = await supabase.from('contractor_tasks').update({
      status: 'completed',
      hazard_status: 'resolved',
      updated_at: new Date().toISOString(),
    }).eq('id', task.id).select().single()
    if (error) throw error
    return toContractorTask(data)
  },

  async reopenTaskAfterFailedInspection(taskId: string): Promise<ContractorTask> {
    const task = await this.getContractorTaskById(taskId)

    await supabase.from('hazard_reports').update({
      status: 'in_repair',
      expected_next_step: 'Inspection failed — repair required',
      updated_at: new Date().toISOString(),
    }).eq('id', task.hazardReportId)

    await this.syncRoadAssetHealth(task.roadAssetId)

    const { data, error } = await supabase.from('contractor_tasks').update({
      status: 'failed_inspection',
      hazard_status: 'in_repair',
      updated_at: new Date().toISOString(),
    }).eq('id', task.id).select().single()
    if (error) throw error
    return toContractorTask(data)
  },

  // Inspections
  async getPendingInspections(): Promise<InspectionRecord[]> {
    const { data, error } = await supabase.from('inspections').select('*').eq('status', 'pending')
    if (error) throw error
    return data.map(toInspectionRecord)
  },

  async getInspectionById(inspectionId: string): Promise<InspectionRecord> {
    const { data, error } = await supabase.from('inspections').select('*').eq('id', inspectionId).single()
    if (error) throw new Error(`Inspection not found: ${inspectionId}`)
    return toInspectionRecord(data)
  },

  async getAllInspections(): Promise<InspectionRecord[]> {
    const { data, error } = await supabase.from('inspections').select('*')
    if (error) throw error
    return data.map(toInspectionRecord)
  },

  async getInspectionsByRoadAsset(roadAssetId: string): Promise<InspectionRecord[]> {
    const { data, error } = await supabase.from('inspections').select('*').eq('road_asset_id', roadAssetId)
    if (error) throw error
    return data.map(toInspectionRecord)
  },

  async approveInspection(inspectionId: string, input: { remarks?: string; officerId: string }): Promise<InspectionRecord> {
    const officer = await this.getUserById(input.officerId)
    const inspection = await this.getInspectionById(inspectionId)

    const { data: updatedInspection, error: inspectionError } = await supabase.from('inspections').update({
      status: 'completed',
      completed_date: new Date().toISOString(),
      result: 'pass',
      remarks: input.remarks,
      officer_id: input.officerId,
      officer_name: officer?.name ?? inspection.officerName,
      updated_at: new Date().toISOString(),
    }).eq('id', inspectionId).select().single()
    if (inspectionError) throw inspectionError

    await supabase.from('hazard_reports').update({
      status: 'resolved',
      updated_at: new Date().toISOString(),
      expected_next_step: 'Case resolved — DLP window active',
    }).eq('report_id', inspection.reportId)

    if (inspection.taskId) {
      await this.completeTaskAfterInspection(inspection.taskId)
    }

    await this.appendLifecycleEvent({
      roadAssetId: inspection.roadAssetId,
      roadId: (await this.getRoadAssetById(inspection.roadAssetId)).roadId,
      reportId: inspection.reportId,
      type: 'inspection',
      title: 'Inspection passed — case resolved',
      status: 'resolved',
      actorName: officer?.name,
      occurredAt: new Date().toISOString(),
    })

    await this.syncRoadAssetHealth(inspection.roadAssetId)
    return toInspectionRecord(updatedInspection)
  },

  async failInspection(inspectionId: string, input: { remarks?: string; officerId: string }): Promise<InspectionRecord> {
    const officer = await this.getUserById(input.officerId)
    const inspection = await this.getInspectionById(inspectionId)

    const { data: updatedInspection, error: inspectionError } = await supabase.from('inspections').update({
      status: 'completed',
      completed_date: new Date().toISOString(),
      result: 'fail',
      remarks: input.remarks,
      officer_id: input.officerId,
      officer_name: officer?.name ?? inspection.officerName,
      updated_at: new Date().toISOString(),
    }).eq('id', inspectionId).select().single()
    if (inspectionError) throw inspectionError

    await supabase.from('hazard_reports').update({
      status: 'in_repair',
      updated_at: new Date().toISOString(),
      expected_next_step: 'Inspection failed — contractor must rework repair',
    }).eq('report_id', inspection.reportId)

    if (inspection.taskId) {
      await this.reopenTaskAfterFailedInspection(inspection.taskId)
    }

    await this.appendLifecycleEvent({
      roadAssetId: inspection.roadAssetId,
      roadId: (await this.getRoadAssetById(inspection.roadAssetId)).roadId,
      reportId: inspection.reportId,
      type: 'inspection',
      title: 'Inspection failed — repair reopened',
      status: 'in_repair',
      actorName: officer?.name,
      occurredAt: new Date().toISOString(),
    })

    await this.syncRoadAssetHealth(inspection.roadAssetId)
    return toInspectionRecord(updatedInspection)
  },

  // DLP
  async getActiveDLPRecords(roadAssetId: string): Promise<DLPRecord[]> {
    const { data, error } = await supabase.from('dlp_records').select('*').eq('road_asset_id', roadAssetId).eq('is_active', true)
    if (error) throw error
    return data.map(toDLPRecord)
  },

  async getContractorDLPRecords(contractorId: string): Promise<DLPRecord[]> {
    const { data, error } = await supabase.from('dlp_records').select('*').eq('contractor_id', contractorId).eq('is_active', true)
    if (error) throw error
    return data.map(toDLPRecord)
  },

  // Lifecycle
  async appendLifecycleEvent(event: Omit<LifecycleEvent, 'id'>): Promise<LifecycleEvent> {
    const { data, error } = await supabase.from('lifecycle_events').insert({
      road_asset_id: event.roadAssetId,
      road_id: event.roadId,
      report_id: event.reportId,
      type: event.type,
      title: event.title,
      description: event.description,
      status: event.status,
      actor_name: event.actorName,
      occurred_at: event.occurredAt,
    }).select().single()
    if (error) throw error
    return toLifecycleEvent(data)
  },

  async getLifecycleEvents(roadId: string): Promise<LifecycleEvent[]> {
    const { data, error } = await supabase.from('lifecycle_events').select('*').eq('road_id', roadId).order('occurred_at', { ascending: false })
    if (error) throw error
    return data.map(toLifecycleEvent)
  },

  async syncRoadAssetHealth(roadAssetId: string): Promise<RoadAsset> {
    const { data, error } = await supabase.from('road_assets').update({
      last_updated: new Date().toISOString(),
    }).eq('id', roadAssetId).select().single()
    if (error) throw error
    return toRoadAsset(data)
  },

  // Maintenance Records
  async getMaintenanceRecords(roadAssetId: string): Promise<MaintenanceRecord[]> {
    const { data, error } = await supabase.from('maintenance_records').select('*').eq('road_asset_id', roadAssetId).order('date', { ascending: false })
    if (error) throw error
    return data.map(toMaintenanceRecord)
  },

  // Cost Events
  async getCostEvents(roadAssetId: string): Promise<CostEvent[]> {
    const { data, error } = await supabase.from('cost_events').select('*').eq('road_asset_id', roadAssetId).order('date', { ascending: false })
    if (error) throw error
    return data.map(toCostEvent)
  },

  // Documents
  async getDocuments(roadAssetId: string): Promise<DocumentRecord[]> {
    const { data, error } = await supabase.from('documents').select('*').eq('road_asset_id', roadAssetId).order('uploaded_at', { ascending: false })
    if (error) throw error
    return data.map(toDocumentRecord)
  },

  // Contractors for road asset
  async getContractorsForRoadAsset(roadAssetId: string): Promise<Array<{ contractorId: string; contractorName: string; taskCount: number; onTimePercent: number; dlpStatus?: string }>> {
    const { data: tasks } = await supabase.from('contractor_tasks').select('contractor_id').eq('road_asset_id', roadAssetId)
    const contractorMap = new Map<string, { name: string; count: number }>()
    for (const task of tasks ?? []) {
      const contractor = await this.getContractorById(task.contractor_id)
      if (contractor) {
        const existing = contractorMap.get(contractor.id)
        contractorMap.set(contractor.id, { name: contractor.name, count: (existing?.count ?? 0) + 1 })
      }
    }
    const { data: dlpRecords } = await supabase.from('dlp_records').select('*').eq('road_asset_id', roadAssetId).eq('is_active', true)
    return Array.from(contractorMap.entries()).map(([contractorId, value]) => {
      const contractor = { id: contractorId, name: value.name, onTimePercent: 0 }
      const activeDlp = dlpRecords?.find(r => r.contractor_id === contractorId)
      return {
        contractorId,
        contractorName: value.name,
        taskCount: value.count,
        onTimePercent: contractor.onTimePercent,
        dlpStatus: activeDlp ? `Active until ${new Date(activeDlp.expires_at).toLocaleDateString()}` : undefined,
      }
    })
  },

  // Audit Log
  async appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'occurredAt' | 'prevEntryHash' | 'entryHash'>): Promise<void> {
    const { data: prevLog } = await supabase.from('audit_logs').select('entry_hash').order('occurred_at', { ascending: false }).limit(1)
    const prevHash = prevLog?.[0]?.entry_hash ?? '0'
    const { data: { user } } = await supabase.auth.getUser()
    const actorId = user?.id ?? entry.actorId

    const entryHash = await supabase.rpc('compute_audit_hash', {
      prev_hash: prevHash,
      actor_id: actorId,
      action: entry.action,
      occurred_at: new Date().toISOString(),
    })

    await supabase.from('audit_logs').insert({
      report_id: entry.reportId,
      action: entry.action,
      actor_id: actorId,
      actor_name: entry.actorName,
      details: entry.details,
      occurred_at: new Date().toISOString(),
      prev_entry_hash: prevHash,
      entry_hash: entryHash.data,
    })
  },

  // File Upload
  async uploadPhoto(file: File, path: string): Promise<string> {
    const { data, error } = await supabase.storage.from('hazard-photos').upload(path, file)
    if (error) throw error
    const { data: urlData } = supabase.storage.from('hazard-photos').getPublicUrl(data.path)
    return urlData.publicUrl
  },

  // Realtime subscriptions
  subscribeToHazardReports(callback: (payload: any) => void) {
    return supabase.channel('hazard-reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hazard_reports' }, callback)
      .subscribe()
  },

  subscribeToContractorTasks(contractorId: string, callback: (payload: any) => void) {
    return supabase.channel(`contractor-tasks-${contractorId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contractor_tasks', filter: `contractor_id=eq.${contractorId}` }, callback)
      .subscribe()
  },

  subscribeToInspections(callback: (payload: any) => void) {
    return supabase.channel('inspections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inspections' }, callback)
      .subscribe()
  },

  subscribeToTable(table: string, callback: (payload: any) => void) {
    return supabase.channel(`table-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe()
  },

  unsubscribe(channel: any) {
    supabase.removeChannel(channel)
  },
}

export default supabaseApi