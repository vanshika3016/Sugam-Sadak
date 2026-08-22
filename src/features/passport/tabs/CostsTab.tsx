// @ts-nocheck
import { ContentCard } from '@/components/cards/ContentCard'
import { MetricCard } from '@/components/cards/MetricCard'
import { formatDate, formatInr } from '@/lib/format'
import type { InternalRoadView } from '@/types/entities'
import { DollarSign } from 'lucide-react'

interface CostsTabProps {
  internal: InternalRoadView | null
  showTable: boolean
}

export function CostsTab({ internal, showTable }: CostsTabProps) {
  if (!internal || !showTable) {
    return null
  }

  return (
    <ContentCard title="Cost History" subtitle="Allocated vs Spent">
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <MetricCard label="Allocated" value={formatInr(internal.allocatedBudgetInr)} />
        <MetricCard label="Spent" value={formatInr(internal.spentBudgetInr)} tint="warning" />
      </div>
      {internal.costEvents.length > 0 ? (
        <div className="overflow-x-auto rounded-[10px] border border-border">
          <table className="min-w-full border-collapse">
<thead className="bg-surface-recessed">
              <tr>
                {['Date', 'Description', 'Category', 'Amount'].map((header) => {
                  return <th key={header} className="text-xs px-4 py-3 text-left text-muted">{header}</th>
                })}
              </tr>
            </thead>
            <tbody>
              {internal.costEvents.map((event, index) => (
                <tr key={index} className="border-t border-border">
                  {[
                    formatDate(event.date),
                    event.description,
                    event.category,
                    event.amountInr.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }),
                  ].map((cell, cellIndex) => (
                    <td key={cellIndex} className="text-sm px-4 py-3 text-ink">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-slate text-center py-8">No cost events recorded</p>
      )}
    </ContentCard>
  )
}