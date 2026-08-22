import { useEffect, useRef } from 'react'
import { authService } from '@/services/authService'

interface RealtimeOptions {
  table: string
  filter?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  onChange: (payload: any) => void
  enabled?: boolean
}

export function useRealtime({
  table,
  filter,
  event = '*',
  onChange,
  enabled = true,
}: RealtimeOptions) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!enabled) return

    const channel = authService.api.subscribeToTable(table, (payload) => {
      if (filter) {
        // Simple filter matching - in production use Supabase's built-in filters
        const newRecord = payload.new
        const oldRecord = payload.old
        const match = filter.split('=').reduce((obj, part) => {
          const [key, value] = part.split('=')
          obj[key] = value
          return obj
        }, {} as Record<string, string>)
        
        const record = newRecord || oldRecord
        if (record && Object.entries(match).every(([k, v]) => record[k] == v)) {
          onChangeRef.current(payload)
        }
      } else {
        onChangeRef.current(payload)
      }
    })

    return () => {
      authService.api.unsubscribe(channel)
    }
  }, [table, filter, event, enabled])
}

// Convenience hooks for common subscriptions
export function useHazardReportsRealtime(onChange: (payload: any) => void, enabled = true) {
  useRealtime({ table: 'hazard_reports', event: '*', onChange, enabled })
}

export function useContractorTasksRealtime(contractorId: string, onChange: (payload: any) => void, enabled = true) {
  useRealtime({ table: 'contractor_tasks', filter: `contractor_id=${contractorId}`, event: '*', onChange, enabled })
}

export function useInspectionsRealtime(onChange: (payload: any) => void, enabled = true) {
  useRealtime({ table: 'inspections', event: '*', onChange, enabled })
}