import { useAuthStore } from '@/stores/authStore'
import { getPassportFieldVisibility, getPassportViewMode } from '@/types/permissions'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const initialized = useAuthStore((state) => state.initialized)
  const demoLogin = useAuthStore((state) => state.demoLogin)
  const logout = useAuthStore((state) => state.logout)
  const initialize = useAuthStore((state) => state.initialize)

  return { user, loading, initialized, demoLogin, logout, initialize }
}

export function usePermissions() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role ?? null

  return {
    role,
    passportViewMode: getPassportViewMode(role),
    passportFields: getPassportFieldVisibility(role),
    isCitizen: role === 'citizen',
    isGovernment: role === 'government',
    isContractor: role === 'contractor',
  }
}