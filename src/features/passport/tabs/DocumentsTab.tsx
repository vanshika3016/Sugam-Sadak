import { ContentCard } from '@/components/cards/ContentCard'
import { EvidenceGallery } from '@/components/domain/EvidenceGallery'
import type { InternalRoadView } from '@/types/entities'
import { FileText } from 'lucide-react'

interface DocumentsTabProps {
  internal: InternalRoadView | null
  showTable: boolean
}

export function DocumentsTab({ internal, showTable }: DocumentsTabProps) {
  if (!internal || !showTable) {
    return null
  }

  return (
    <ContentCard title="Documents & Evidence" subtitle={`${internal.documents.length} document(s)`}>
      {internal.documents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {internal.documents.map((doc) => (
            <div key={doc.id} className="rounded-[8px] border border-border p-4">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-primary" />
                <div>
                  <div className="font-medium text-ink">{doc.title}</div>
                  <div className="text-sm text-slate">{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate text-center py-8">No documents uploaded yet</p>
      )}
    </ContentCard>
  )
}