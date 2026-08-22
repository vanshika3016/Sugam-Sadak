import { create } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeSubscription {
  channel: RealtimeChannel
  unsubscribe: () => void
}

interface DataStore {
  version: number
  notify: () => void
  subscriptions: RealtimeSubscription[]
  addSubscription: (sub: RealtimeSubscription) => void
  removeAllSubscriptions: () => void
}

export const useDataStore = create<DataStore>((set, get) => ({
  version: 0,
  notify: () => set((state) => ({ version: state.version + 1 })),
  subscriptions: [],
  addSubscription: (sub) => set((state) => ({ subscriptions: [...state.subscriptions, sub] })),
  removeAllSubscriptions: () => {
    get().subscriptions.forEach((s) => s.unsubscribe())
    set({ subscriptions: [] })
  },
}))