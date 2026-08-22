import { cn } from '@/lib/cn'
import type { EvidencePhoto } from '@/types/entities'

interface EvidenceGalleryProps {
  photos: EvidencePhoto[]
  className?: string
}

export function EvidenceGallery({ photos, className }: EvidenceGalleryProps) {
  if (photos.length === 0) {
    return <p className="text-small text-muted">No evidence uploaded.</p>
  }

  return (
    <div className={cn('grid grid-cols-2 gap-3 md:grid-cols-3', className)}>
      {photos.map((photo) => (
        <figure key={photo.id} className="overflow-hidden rounded-[10px] border border-border">
          <img
            src={photo.url}
            alt={photo.label ?? 'Evidence photo'}
            className="aspect-[4/3] w-full object-cover"
          />
          {photo.label ? (
            <figcaption className="text-small px-2 py-1 text-slate">{photo.label}</figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  )
}
