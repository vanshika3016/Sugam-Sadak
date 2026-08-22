import { openDB, IDBPDatabase } from 'idb'

interface QueuedReport {
  id: string
  data: any
  timestamp: number
  retries: number
}

const DB_NAME = 'sugam-sadak-offline'
const STORE_NAME = 'hazard-reports'
const MAX_RETRIES = 3

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export async function queueReport(reportData: any): Promise<string> {
  const db = await getDB()
  const id = `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const queuedReport: QueuedReport = {
    id,
    data: reportData,
    timestamp: Date.now(),
    retries: 0,
  }
  await db.put(STORE_NAME, queuedReport)
  return id
}

export async function getQueuedReports(): Promise<QueuedReport[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

export async function removeQueuedReport(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function incrementRetry(id: string): Promise<void> {
  const db = await getDB()
  const report = await db.get(STORE_NAME, id)
  if (report) {
    report.retries += 1
    await db.put(STORE_NAME, report)
  }
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB()
  const count = await db.count(STORE_NAME)
  return count
}

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

let syncInProgress = false

export async function syncQueuedReports(submitFn: (data: any) => Promise<any>): Promise<void> {
  if (syncInProgress || !isOnline()) return
  
  syncInProgress = true
  try {
    const reports = await getQueuedReports()
    for (const report of reports) {
      if (report.retries >= MAX_RETRIES) {
        await removeQueuedReport(report.id)
        continue
      }
      
      try {
        await submitFn(report.data)
        await removeQueuedReport(report.id)
      } catch (error) {
        await incrementRetry(report.id)
      }
    }
  } finally {
    syncInProgress = false
  }
}

export function setupOfflineSync(submitFn: (data: any) => Promise<any>): () => void {
  let intervalId: number
  
  function handleOnline() {
    syncQueuedReports(submitFn)
  }
  
  function startPeriodicSync() {
    syncQueuedReports(submitFn)
    intervalId = window.setInterval(() => {
      if (isOnline()) {
        syncQueuedReports(submitFn)
      }
    }, 30000)
  }
  
  window.addEventListener('online', handleOnline)
  startPeriodicSync()
  
  return () => {
    window.removeEventListener('online', handleOnline)
    clearInterval(intervalId)
  }
}

export { type QueuedReport }