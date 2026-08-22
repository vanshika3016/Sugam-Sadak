import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { Bell, ChevronDown, LogOut, Route } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/citizen/home', label: 'Home', icon: 'home' },
  { to: '/citizen/map', label: 'Map', icon: 'map' },
  { to: '/citizen/reports', label: 'Reports', icon: 'reports' },
  { to: '/citizen/passport/SS-W12-R211', label: 'Passport', icon: 'passport' },
] as const

function NavIcon({ type, active }: { type: string; active: boolean }) {
  const className = cn('h-5 w-5', active ? 'text-white' : 'text-slate')
  if (type === 'home') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6h-6v6H5.5A1.5 1.5 0 0 1 4 19v-8.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  }
  if (type === 'map') return <Route className={className} strokeWidth={1.5} />
  return <Route className={className} strokeWidth={1.5} />
}

export function CitizenShell() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-surface-recessed pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/citizen/home" className="flex items-center gap-3">
            <div className="rounded-[8px] bg-primary p-2 text-white">
              <Route size={18} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-h3 text-ink">Sugam Sadak</div>
              <div className="text-small text-slate">Digital Road Infrastructure</div>
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                {user?.avatarInitial}
              </div>
              <span className="text-small text-ink">{user?.name}</span>
              <ChevronDown size={16} className="text-muted" />
            </div>
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-[999px] border border-border bg-surface px-3 py-2 shadow-[var(--shadow-card)]">
        <ul className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to.replace(/\/SS-W12-R211$/, ''))
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-[999px] transition-colors duration-150',
                    active ? 'bg-primary' : 'hover:bg-surface-recessed',
                  )}
                  aria-label={item.label}
                >
                  <NavIcon type={item.icon} active={active} />
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
