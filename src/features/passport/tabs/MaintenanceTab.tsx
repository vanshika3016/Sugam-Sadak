import { ContentCard } from '@/components/cards/ContentCard'
import { formatDate, formatInr } from '@/lib/format'
import type { InternalRoadView } from '@/types/entities'
import { Settings } from 'lucide-react'

interface MaintenanceTabProps {
  internal: InternalRoadView | null
  showTable: boolean
}

export function MaintenanceTab({ internal, showTable }: MaintenanceTabProps) {
  if (!internal || !showTable) {
    return null
  }

  return (
    <ContentCard title="Maintenance History" subtitle={`${internal.maintenanceRecords.length} record(s)`}>
      {internal.maintenanceRecords.length > 0 ? (
        <div className="overflow-x-auto rounded-[10px] border border-border">
          <table className="min-w-full border-collapse">
            <thead className="bg-surface-recessed">
              <tr>
                {['Date', 'Work Performed', 'Contractor', 'Cost', 'Result'].map((header) => (
                  <th key={header} className="text-xs px-4 py-3 text-left text-muted">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {internal.maintenanceRecords.map((record, index) => (
                <tr key={index} className="border-t border-border">
                  {[
                    formatDate(record.date),
                    record.workPerformed,
                    record.contractorName,
                    record.costInr.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }),
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
        <p className="text-slate text-center py-8">No maintenance records yet</p>
      )}
    </ContentCard>
  )
}