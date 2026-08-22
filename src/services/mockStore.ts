import { createSeedDatabase } from '@/data/seed'
import { STORAGE_KEYS } from '@/lib/constants'
import { syncAllRoadHealth } from '@/services/lifecycleService'
import { useDataStore } from '@/stores/dataStore'
import type { MockDatabase, SessionState } from '@/types/entities'

let database: MockDatabase | null = null
let session: SessionState = { currentUserId: null }

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(key, JSON.stringify(value))
}

function notifySubscribers(): void {
  if (typeof window !== 'undefined') {
    useDataStore.getState().notify()
  }
}

export function initMockStore(forceReset = false): MockDatabase {
  if (!forceReset) {
    const stored = readStorage<MockDatabase>(STORAGE_KEYS.mockDatabase)
    if (stored) {
      database = stored
      syncAllRoadHealth()
      return database
    }
  }

  database = createSeedDatabase()
  syncAllRoadHealth()
  persistDatabase()
  return database
}

export function getDatabase(): MockDatabase {
  if (!database) {
    return initMockStore()
  }
  return database
}

export function persistDatabase(): void {
  if (!database) return
  writeStorage(STORAGE_KEYS.mockDatabase, database)
  notifySubscribers()
}

export function resetDatabase(): MockDatabase {
  database = createSeedDatabase()
  syncAllRoadHealth()
  persistDatabase()
  return database
}

export function updateDatabase(mutator: (db: MockDatabase) => void): MockDatabase {
  const db = getDatabase()
  mutator(db)
  persistDatabase()
  return db
}

export function getSession(): SessionState {
  const stored = readStorage<SessionState>(STORAGE_KEYS.session)
  if (stored) {
    session = stored
  }
  return session
}

export function setSession(next: SessionState): void {
  session = next
  writeStorage(STORAGE_KEYS.session, session)
}

export function clearSession(): void {
  session = { currentUserId: null }
  writeStorage(STORAGE_KEYS.session, session)
}
