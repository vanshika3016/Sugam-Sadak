import type { EvidencePhoto } from '@/types/entities'

export function createEvidencePhoto(file: File, label?: string): EvidencePhoto {
  return {
    id: `photo-${crypto.randomUUID()}`,
    url: URL.createObjectURL(file),
    label,
    capturedAt: new Date().toISOString(),
  }
}

export function createPlaceholderPhoto(label: string): EvidencePhoto {
  return {
    id: `photo-${crypto.randomUUID()}`,
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    label,
    capturedAt: new Date().toISOString(),
  }
}
