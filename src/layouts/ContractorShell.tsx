import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { Bell, ClipboardList, LayoutDashboard, LogOut, Route } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/contractor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contractor/tasks', label: 'Tasks', icon: ClipboardList },
]

export function ContractorShell() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-surface-recessed">
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/contractor/dashboard" className="flex items-center gap-3">
            <div className="rounded-[8px] bg-warning p-2 text-white">
              <Route size={18} />
            </div>
            <div>
              <div className="text-h3 text-ink">Sugam Sadak</div>
              <div className="text-small text-slate">Contractor Portal</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="rounded-[8px] border border-border p-2 text-slate"
            >
              <Bell size={18} />
            </button>
            <div className="hidden items-center gap-2 rounded-[999px] border border-border px-2 py-1 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning text-sm font-medium text-white">
                {user?.avatarInitial}
              </div>
              <span className="text-small text-ink">{user?.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
        <nav className="border-t border-border">
          <ul className="mx-auto flex max-w-6xl gap-1 px-4 py-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-body transition-colors duration-150',
                      isActive
                        ? 'bg-warning/10 font-medium text-warning'
                        : 'text-slate hover:bg-surface-recessed',
                    )
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
