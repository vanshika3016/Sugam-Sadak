import { api } from '@/lib/api'
import type {
  ContractorDashboardData,
  ContractorTask,
  RepairEvidence,
} from '@/types/entities'

export async function getDashboard(contractorId: string): Promise<ContractorDashboardData> {
  return api.getContractorDashboard(contractorId)
}

export async function getTasks(contractorId: string): Promise<ContractorTask[]> {
  return api.getContractorTasks(contractorId)
}

export async function getTaskById(taskId: string): Promise<ContractorTask> {
  return api.getContractorTaskById(taskId)
}

export async function acceptTask(taskId: string): Promise<ContractorTask> {
  return api.acceptTask(taskId)
}

export async function startRepair(taskId: string): Promise<ContractorTask> {
  return api.startRepair(taskId)
}

export async function submitCompletion(
  taskId: string,
  evidence: RepairEvidence,
): Promise<ContractorTask> {
  return api.submitCompletion(taskId, evidence)
}

export async function completeTaskAfterInspection(taskId: string): Promise<ContractorTask> {
  return api.completeTaskAfterInspection(taskId)
}

export async function reopenTaskAfterFailedInspection(taskId: string): Promise<ContractorTask> {
  return api.reopenTaskAfterFailedInspection(taskId)
}