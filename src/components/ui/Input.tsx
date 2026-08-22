import { cn } from '@/lib/cn'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ className, label, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <label className="flex flex-col gap-1.5" htmlFor={inputId}>
      {label ? <span className="text-caption text-muted">{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          'h-10 rounded-[8px] border border-border bg-surface px-3 text-body text-ink outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary',
          className,
        )}
        {...props}
      />
    </label>
  )
}
