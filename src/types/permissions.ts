import type { PassportViewMode, Role } from './enums'

export interface PassportFieldVisibility {
  showExactHealthScore: boolean
  showContractorIdentity: boolean
  showCostData: boolean
  showFullLifecycle: boolean
  showMaintenanceTable: boolean
  showInspectionsTable: boolean
  showContractorsTab: boolean
  showCostHistoryTab: boolean
  showDocumentsTab: boolean
}

export function getPassportViewMode(role: Role | null): PassportViewMode {
  return role === 'citizen' ? 'public' : 'internal'
}

export function getPassportFieldVisibility(role: Role | null): PassportFieldVisibility {
  const isPublic = role === 'citizen'

  return {
    showExactHealthScore: !isPublic,
    showContractorIdentity: !isPublic,
    showCostData: !isPublic,
    showFullLifecycle: !isPublic,
    showMaintenanceTable: !isPublic,
    showInspectionsTable: !isPublic,
    showContractorsTab: !isPublic,
    showCostHistoryTab: !isPublic,
    showDocumentsTab: !isPublic,
  }
}

export function canVerifyCases(role: Role | null): boolean {
  return role === 'government'
}

export function canAssignContractor(role: Role | null): boolean {
  return role === 'government'
}

export function canInspect(role: Role | null): boolean {
  return role === 'government'
}

export function canManageTasks(role: Role | null): boolean {
  return role === 'contractor'
}

export function canCreateHazardReport(role: Role | null): boolean {
  return role === 'citizen'
}
