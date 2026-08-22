import { formatDate, locationKey } from '@/lib/format'
import type { DLPRecord, DLPCheckResult, HazardReport, CompletedRepair, DLPConfig } from '@/types/entities'

export function startDLP(repair: CompletedRepair, config: DLPConfig = { durationMonths: 12 }): DLPRecord {
  const expiresAt = new Date(repair.completedAt)
  expiresAt.setMonth(expiresAt.getMonth() + config.durationMonths)

  return {
    id: `dlp-${repair.repairId}`,
    roadAssetId: repair.roadAssetId,
    roadId: repair.roadId,
    contractorId: repair.contractorId,
    contractorName: repair.contractorName,
    repairId: repair.repairId,
    locationKey: repair.locationKey,
    startedAt: repair.completedAt,
    expiresAt: expiresAt.toISOString(),
    isActive: true,
  }
}

export function isActive(dlp: DLPRecord, at: Date = new Date()): boolean {
  return dlp.isActive && new Date(dlp.expiresAt) > at
}

export function checkRecurrence(
  newReport: HazardReport,
  activeRecords: DLPRecord[],
): DLPCheckResult {
  const reportLocationKey = locationKey(newReport.location)
  const matched = activeRecords.find(
    (record) =>
      record.roadAssetId === newReport.roadAssetId &&
      record.locationKey === reportLocationKey &&
      isActive(record),
  )

  if (!matched) {
    return { flagged: false, flagStatus: 'none' }
  }

  return {
    flagged: true,
    flagStatus: 'possible_recurrence',
    matchedDlpId: matched.id,
    contractorName: matched.contractorName,
    message: `Possible recurrence — under warranty (DLP active until ${formatDate(matched.expiresAt)})`,
  }
}

export function formatDlpBadgeLabel(record: DLPRecord): string {
  if (isActive(record)) {
    return `DLP Active — expires ${formatDate(record.expiresAt)}`
  }
  return 'DLP Expired'
}

export function expireDlpRecord(record: DLPRecord): DLPRecord {
  return { ...record, isActive: false }
}