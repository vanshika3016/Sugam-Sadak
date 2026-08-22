import { ContentCard } from '@/components/cards/ContentCard'
import { formatDate } from '@/lib/format'
import type { InternalRoadView } from '@/types/entities'
import { Calendar } from 'lucide-react'

interface LifecycleTabProps {
  internal: InternalRoadView | null
}

export function LifecycleTab({ internal }: LifecycleTabProps) {
  if (!internal) {
    return (
      <ContentCard title="Lifecycle Timeline" subtitle="Complete asset history">
        <div className="text-center py-8">
          <Calendar size={48} className="text-slate mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-ink mb-2">Limited Public View</h3>
          <p className="text-slate">
            Full lifecycle history is available to authorized government personnel.
            <br />
            Sign in as an officer to see complete maintenance, inspection, and repair history.
          </p>
        </div>
      </ContentCard>
    )
  }

  return (
    <ContentCard title="Lifecycle Timeline" subtitle="Complete asset history">
      <div className="space-y-4">
        {internal.lifecycleEvents.map((event) => (
          <div key={event.id} className="flex gap-4 pb-4 last:pb-0 border-b border-border">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-[8px] bg-primary/10 text-primary shrink-0">
              <Calendar size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink">{event.title}</div>
              <div className="text-sm text-slate mt-1">
                {new Date(event.occurredAt).toLocaleDateString()}
                {event.actorName ? ` · ${event.actorName}` : ''}
              </div>
              {event.description ? (
                <p className="text-sm text-slate mt-2">{event.description}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </ContentCard>
  )
}