import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types/enums'
import { getHomeRouteForRole } from '@/services/authService'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, initialized } = useAuth()

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-recessed">
        <p className="text-body text-slate">Loading Sugam Sadak…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user, initialized } = useAuth()

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-recessed">
        <p className="text-body text-slate">Loading Sugam Sadak…</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />
  }

  return <Outlet />
}
