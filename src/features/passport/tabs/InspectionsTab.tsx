import { ContentCard } from '@/components/cards/ContentCard'
import { formatDate } from '@/lib/format'
import type { InternalRoadView } from '@/types/entities'
import { ClipboardList } from 'lucide-react'

interface InspectionsTabProps {
  internal: InternalRoadView | null
  showTable: boolean
}

export function InspectionsTab({ internal, showTable }: InspectionsTabProps) {
  if (!internal || !showTable) {
    return null
  }

  return (
    <ContentCard title="Inspections" subtitle={`${internal.inspections.length} inspection(s)`}>
      {internal.inspections.length > 0 ? (
        <div className="overflow-x-auto rounded-[10px] border border-border">
          <table className="min-w-full border-collapse">
            <thead className="bg-surface-recessed">
              <tr>
                {['Date', 'Officer', 'Condition', 'Remarks', 'Result'].map((header) => (
                  <th key={header} className="text-xs px-4 py-3 text-left text-muted">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {internal.inspections.map((record, index) => (
                <tr key={index} className="border-t border-border">
                  {[
                    new Date(record.completedDate ?? record.scheduledDate ?? record.status).toLocaleDateString(),
                    record.officerName,
                    record.condition ?? '—',
                    record.remarks ?? '—',
                    record.result,
                  ].map((cell, cellIndex) => (
                    <td key={cellIndex} className="text-sm px-4 py-3 text-ink">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-slate text-center py-8">No inspections yet</p>
      )}
    </ContentCard>
  )
}