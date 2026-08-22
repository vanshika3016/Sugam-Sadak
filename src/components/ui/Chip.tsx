import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface ChipProps {
  active?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function Chip({ active, children, onClick, className }: ChipProps) {
  const Component = onClick ? 'button' : 'span'

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-[999px] border px-3 py-1 text-small transition-colors duration-150',
        active
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-surface text-slate hover:bg-surface-recessed',
        className,
      )}
    >
      {children}
    </Component>
  )
}
