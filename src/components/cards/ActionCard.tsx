import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ActionCardProps {
  title: string
  description: string
  icon: ReactNode
  to: string
  accent?: 'primary' | 'warning' | 'success'
  className?: string
}

const accentClasses = {
  primary: 'border-l-primary',
  warning: 'border-l-warning',
  success: 'border-l-success',
}

export function ActionCard({
  title,
  description,
  icon,
  to,
  accent = 'primary',
  className,
}: ActionCardProps) {
  return (
    <Link to={to} className="block">
      <Card
        className={cn(
          'border-l-[3px] p-4 transition-colors duration-150 hover:bg-surface-recessed',
          accentClasses[accent],
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-[8px] bg-surface-recessed p-2">{icon}</div>
          <div className="flex-1">
            <h3 className="text-h3 text-ink">{title}</h3>
            <p className="text-small mt-1 text-slate">{description}</p>
            <div className="text-small mt-3 inline-flex items-center gap-1 font-medium text-primary">
              Continue
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
