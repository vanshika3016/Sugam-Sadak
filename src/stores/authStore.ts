import { create } from 'zustand'
import * as authService from '@/services/authService'
import type { User } from '@/types/entities'
import type { Role } from '@/types/enums'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  initialize: () => Promise<void>
  demoLogin: (role: Role) => Promise<User>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  initialize: async () => {
    const user = await authService.api.getCurrentUser()
    set({ user, initialized: true })
  },
  demoLogin: async (role) => {
    set({ loading: true })
    try {
      const user = await authService.demoLogin(role)
      set({ user, loading: false })
      return user
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  logout: async () => {
    await authService.logout()
    set({ user: null })
  },
}))