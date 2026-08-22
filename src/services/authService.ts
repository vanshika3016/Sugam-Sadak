import { api } from '@/lib/api'
import type { User } from '@/types/entities'
import type { Role } from '@/types/enums'

export async function demoLogin(role: Role): Promise<User> {
  return api.demoLogin(role)
}

export async function logout(): Promise<void> {
  return api.signOut()
}

export function getCurrentUser(): User | null {
  // This is now async in the API, but we keep sync interface for compatibility
  // The actual async version is in the auth store
  return null
}

export function getHomeRouteForRole(role: Role): string {
  switch (role) {
    case 'citizen':
      return '/citizen/home'
    case 'government':
      return '/government/overview'
    case 'contractor':
      return '/contractor/dashboard'
  }
}

export { api }
export const authService = { api }