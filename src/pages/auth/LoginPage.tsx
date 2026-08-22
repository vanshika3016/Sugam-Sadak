import { Button } from '@/components/ui/Button'
import { ContentCard } from '@/components/cards/ContentCard'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { getHomeRouteForRole } from '@/services/authService'
import { authService } from '@/services/authService'
import { ROLE_LABELS, type Role } from '@/types/enums'
import { Building2, HardHat, Route, UserRound, Shield, Lock, Mail, User, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const demoOptions: Array<{
  role: Role
  label: string
  subtitle: string
  icon: typeof UserRound
  accent: string
  color: string
}> = [
  {
    role: 'citizen',
    label: 'Citizen',
    subtitle: 'Report hazards, track status, view public passport',
    icon: UserRound,
    accent: 'border-primary bg-primary/5',
    color: 'text-primary',
  },
  {
    role: 'government',
    label: 'Government',
    subtitle: 'Verify, assign, inspect — ward operations',
    icon: Building2,
    accent: 'border-success bg-success/5',
    color: 'text-success',
  },
  {
    role: 'contractor',
    label: 'Contractor',
    subtitle: 'Accept tasks, submit repairs, view DLP exposure',
    icon: HardHat,
    accent: 'border-warning bg-warning/5',
    color: 'text-warning',
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const { demoLogin, loading } = useAuth()
  const { showToast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [showRealAuth, setShowRealAuth] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('citizen')

  const handleDemoLogin = async (role: Role, label: string) => {
    setError(null)
    try {
      const user = await demoLogin(role)
      showToast(`Signed in as ${label}`, 'success')
      navigate(getHomeRouteForRole(user.role))
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed')
    }
  }

  const handleRealAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (isSignUp) {
        await authService.api.signUpWithEmail(email, password, { name, role })
        showToast('Account created! Please check your email.', 'success')
        setIsSignUp(false)
      } else {
        await authService.api.signInWithEmail(email, password)
        const user = await authService.api.getCurrentUser()
        if (user) {
          showToast(`Welcome back, ${user.name}`, 'success')
          navigate(getHomeRouteForRole(user.role))
        }
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed')
    }
  }

  return (
    <div className="min-h-screen bg-surface-recessed px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center rounded-[16px] bg-primary p-5 text-white mb-6 shadow-[0_10px_30px_rgb(59,130,246,0.3)]">
            <Route size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-ink tracking-tight">Sugam Sadak</h1>
          <p className="text-body mt-3 text-slate max-w-xl mx-auto leading-relaxed">
            Every Road Has a History. Now It Has a Record.
          </p>
        </div>

        <ContentCard
          title={showRealAuth ? (isSignUp ? 'Create Account' : 'Sign In') : 'Demo Login'}
          subtitle={showRealAuth
            ? 'Use your Supabase credentials to access the platform'
            : 'One-click role switching for live demos — no credentials needed'}
          className="overflow-hidden"
        >
          {!showRealAuth ? (
            <>
              <div className="space-y-3">
                {demoOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.label}
                      type="button"
                      disabled={loading}
                      onClick={() => void handleDemoLogin(option.role, option.label)}
                      className={cn(
                        'rounded-[14px] border p-5 text-left transition-all duration-200 hover:bg-surface-recessed hover:border-primary/30 hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] disabled:opacity-60 disabled:cursor-not-allowed',
                        option.accent,
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn('inline-flex items-center justify-center w-14 h-14 rounded-[12px] bg-primary/10', option.color)}>
                          <Icon size={24} className="shrink-0" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-semibold text-ink">{option.label}</div>
                          <div className="text-sm mt-1 text-slate leading-relaxed">{option.subtitle}</div>
                          <div className="text-xs mt-2 text-muted">
                            Role tier: {ROLE_LABELS[option.role]}
                          </div>
                        </div>
                        <div className={cn('shrink-0 mt-1', option.color)}>
                          <Shield size={20} strokeWidth={2} />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowRealAuth(true)}
                >
                  Use real credentials instead
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-muted">
                  Demo accounts are pre-configured with sample data for Ward 12.
                  All demo actions persist in your browser session.
                </p>
              </div>
            </>
          ) : (
            <form onSubmit={handleRealAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="name" className="text-sm text-slate">Full Name</label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate size-5" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="mt-2 pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="role" className="text-sm text-slate">Role</label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="mt-2 w-full rounded-[8px] border border-border bg-surface px-3 py-2 text-body appearance-none"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="government">Government</option>
                      <option value="contractor">Contractor</option>
                    </select>
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="email" className="text-sm text-slate">Email</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate size-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="text-sm text-slate">Password</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate size-5" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 pl-10"
                    required
                  />
                </div>
              </div>

              {error ? <p className="text-body text-danger flex items-center gap-2"><AlertCircle size={16} />{error}</p> : null}

              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>

              <div className="text-center text-sm text-slate">
                {isSignUp ? (
                  <Button variant="ghost" onClick={() => setIsSignUp(false)}>
                    Already have an account? Sign in
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={() => setIsSignUp(true)}>
                    Don't have an account? Sign up
                  </Button>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowRealAuth(false)}
                >
                  Back to demo login
                </Button>
              </div>
            </form>
          )}
        </ContentCard>

        <div className="mt-8 text-center text-xs text-muted">
          <p>Sugam Sadak — Digital Road Passport Platform</p>
          <p className="mt-1">Built for Smart Cities Hackathon 2026</p>
        </div>
      </div>
    </div>
  )
}