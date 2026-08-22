import { ContentCard } from '@/components/cards/ContentCard'
import { Card } from '@/components/ui/Card'
import type { InternalRoadView } from '@/types/entities'
import { Building2 } from 'lucide-react'

interface ContractorsTabProps {
  internal: InternalRoadView | null
  showTable: boolean
}

export function ContractorsTab({ internal, showTable }: ContractorsTabProps) {
  if (!internal || !showTable) {
    return null
  }

  return (
    <ContentCard title="Contractors" subtitle={`${internal.contractors.length} contractor(s) on this asset`}>
      {internal.contractors.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {internal.contractors.map((contractor) => (
            <Card key={contractor.contractorId} className="p-4">
              <div className="font-semibold text-ink">{contractor.contractorName}</div>
              <div className="text-sm text-slate mt-1">{contractor.taskCount} task(s) on this asset</div>
              <div className="text-xs text-muted mt-1">
                On-time {contractor.onTimePercent}% · {contractor.dlpStatus ?? 'No active DLP'}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-slate text-center py-8">No contractors assigned to this asset yet</p>
      )}
    </ContentCard>
  )
}