import { cn } from '@/lib/cn'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface ToastItem {
  id: string
  message: string
  tone?: 'success' | 'error' | 'info' | 'warning'
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastItem['tone']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, tone: ToastItem['tone'] = 'info') => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 2800)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-20 right-4 z-[60] flex flex-col gap-2 md:bottom-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-[10px] border px-4 py-3 text-body shadow-[var(--shadow-card)] transition-all duration-200',
              toast.tone === 'success' && 'border-success/20 bg-success-tint text-success',
              toast.tone === 'error' && 'border-danger/20 bg-danger-tint text-danger',
              toast.tone === 'warning' && 'border-warning/20 bg-warning-tint text-warning',
              toast.tone === 'info' && 'border-border bg-surface text-ink',
            )}
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
