import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import {
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Map,
  Route,
  Search,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/government/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/government/cases', label: 'Cases', icon: ClipboardList },
  { to: '/government/inspections', label: 'Inspections', icon: BriefcaseBusiness },
  { to: '/government/map', label: 'Map', icon: Map },
]

export function GovShell() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-surface-recessed lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-border bg-surface lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <div className="rounded-[8px] bg-primary p-2 text-white">
            <Route size={18} />
          </div>
          <div>
            <div className="text-h3">Sugam Sadak</div>
            <div className="text-small text-slate">Government Console</div>
          </div>
        </div>
        <nav className="p-3">
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-[8px] px-3 py-2 text-body transition-colors duration-150',
                      isActive
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-slate hover:bg-surface-recessed',
                    )
                  }
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-surface">
          <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
            <label className="hidden max-w-md flex-1 items-center gap-2 rounded-[8px] border border-border px-3 py-2 md:flex">
              <Search size={16} className="text-muted" />
              <input
                className="w-full bg-transparent text-body outline-none"
                placeholder="Search Road ID, report, contractor..."
                aria-label="Search"
              />
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Notifications"
                className="rounded-[8px] border border-border p-2 text-slate"
              >
                <Bell size={18} />
              </button>
              <div className="hidden items-center gap-2 rounded-[999px] border border-border px-2 py-1 md:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-sm font-medium text-white">
                  {user?.avatarInitial}
                </div>
                <div>
                  <div className="text-small font-medium text-ink">{user?.name}</div>
                  <div className="text-[11px] text-muted">Ward JE / Executive Engineer</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => void logout()}>
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
