import { api } from '@/lib/api'
import type { CaseFilters, CreateHazardInput, HazardReport } from '@/types/entities'
import type { Priority } from '@/types/enums'

export async function create(input: CreateHazardInput): Promise<HazardReport> {
  return api.createHazardReport(input)
}

export async function getById(reportId: string): Promise<HazardReport> {
  return api.getHazardReportById(reportId)
}

export async function getForCitizen(userId: string): Promise<HazardReport[]> {
  return api.getHazardReportsByCitizen(userId)
}

export async function getCases(filters?: CaseFilters): Promise<HazardReport[]> {
  return api.getHazardReports(filters)
}

export async function verify(reportId: string, officerId: string): Promise<HazardReport> {
  return api.verifyHazardReport(reportId, officerId)
}

export async function assignContractor(
  reportId: string,
  contractorId: string,
  officerId: string,
): Promise<HazardReport> {
  return api.assignContractor(reportId, contractorId, officerId)
}

export async function confirmDLPCharge(
  reportId: string,
  chargeable: boolean,
  officerId: string,
): Promise<HazardReport> {
  return api.confirmDLPCharge(reportId, chargeable, officerId)
}

export async function changePriority(reportId: string, priority: Priority): Promise<HazardReport> {
  return api.changePriority(reportId, priority)
}

export async function getAuditLogs(reportId: string) {
  return api.getAuditLogs(reportId)
}