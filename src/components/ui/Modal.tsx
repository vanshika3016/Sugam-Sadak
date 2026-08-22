import { cn } from '@/lib/cn'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-[10px] border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-h2 text-ink">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-[8px] p-1 text-slate hover:bg-surface-recessed"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

interface DrawerProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
}

export function Drawer({ open, title, children, onClose, className }: DrawerProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-ink/30"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <aside
        className={cn(
          'absolute bottom-0 right-0 top-0 w-full max-w-md overflow-y-auto border-l border-border bg-surface p-4 shadow-[var(--shadow-card)] md:max-w-lg',
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-h2 text-ink">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-[8px] p-1 text-slate hover:bg-surface-recessed"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  )
}
