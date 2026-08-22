import { api } from '@/lib/api'
import type { InspectionRecord } from '@/types/entities'

export async function getPending(): Promise<InspectionRecord[]> {
  return api.getPendingInspections()
}

export async function getById(inspectionId: string): Promise<InspectionRecord> {
  return api.getInspectionById(inspectionId)
}

export async function getAll(): Promise<InspectionRecord[]> {
  return api.getAllInspections()
}

export async function approve(
  inspectionId: string,
  input: { remarks?: string; officerId: string },
): Promise<InspectionRecord> {
  return api.approveInspection(inspectionId, input)
}

export async function failInspection(
  inspectionId: string,
  input: { remarks?: string; officerId: string },
): Promise<InspectionRecord> {
  return api.failInspection(inspectionId, input)
}