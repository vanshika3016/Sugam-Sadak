import { EmptyState } from '@/components/data/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  phase?: string
}

export function PlaceholderPage({ title, phase = 'P0 vertical slice' }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} subtitle={`Scheduled for ${phase} — Phase 1 foundation is complete.`} />
      <EmptyState
        icon={Construction}
        title={`${title} coming next`}
        message="Routing, permissions, mock services, and shared components are in place."
      />
    </div>
  )
}
