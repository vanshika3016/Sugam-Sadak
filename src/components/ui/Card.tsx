import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[10px] border border-border bg-surface shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
