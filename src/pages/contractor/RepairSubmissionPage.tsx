import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { ErrorState } from '@/components/data/ErrorState'
import { CardSkeleton } from '@/components/data/LoadingSkeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { authService } from '@/services/authService'
import { formatDate } from '@/lib/format'
import { getTaskById, submitCompletion } from '@/services/contractorTaskService'
import { HAZARD_TYPE_LABELS } from '@/types/enums'
import { Camera, Upload, AlertCircle, X, CheckCircle, Clock, MapPin } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'

type PhotoType = 'before' | 'after'

interface PhotoItem {
  id: string
  url: string
  label?: string
  file?: File
}

export function RepairSubmissionPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [beforePhotos, setBeforePhotos] = useState<PhotoItem[]>([])
  const [afterPhotos, setAfterPhotos] = useState<PhotoItem[]>([])
  const [workDescription, setWorkDescription] = useState('')
  const [materialsNotes, setMaterialsNotes] = useState('')
  const [uploadingPhotos, setUploadingPhotos] = useState<Set<string>>(new Set())

  const { data: task, loading: taskLoading, error, reload } = useAsyncData(
    () => getTaskById(taskId!),
    [taskId]
  )

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: PhotoType) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files are allowed', 'error')
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error')
        continue
      }

      const photoId = `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const newPhoto: PhotoItem = {
        id: photoId,
        url: URL.createObjectURL(file),
        label: type === 'before' ? 'Before repair' : 'After repair',
        file,
      }

      if (type === 'before') {
        setBeforePhotos((prev) => [...prev, newPhoto])
      } else {
        setAfterPhotos((prev) => [...prev, newPhoto])
      }

      try {
        setUploadingPhotos((prev) => new Set(prev).add(photoId))
        const path = `repair-evidence/${taskId}/${type}/${photoId}-${file.name}`
        const publicUrl = await authService.api.uploadPhoto(file, path)
        if (type === 'before') {
          setBeforePhotos((prev) =>
            prev.map((p) => (p.id === photoId ? { ...p, url: publicUrl, file: undefined } : p))
          )
        } else {
          setAfterPhotos((prev) =>
            prev.map((p) => (p.id === photoId ? { ...p, url: publicUrl, file: undefined } : p))
          )
        }
        showToast(`${type === 'before' ? 'Before' : 'After'} photo uploaded`, 'success')
      } catch (error) {
        showToast('Failed to upload photo, using local preview', 'warning')
      } finally {
        setUploadingPhotos((prev) => {
          const next = new Set(prev)
          next.delete(photoId)
          return next
        })
      }
    }
    event.target.value = ''
  }

  const handleRemovePhoto = (type: PhotoType, photoId: string) => {
    const photos = type === 'before' ? beforePhotos : afterPhotos
    const photo = photos.find((p) => p.id === photoId)
    if (photo?.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url)
    }
    if (type === 'before') {
      setBeforePhotos((prev) => prev.filter((p) => p.id !== photoId))
    } else {
      setAfterPhotos((prev) => prev.filter((p) => p.id !== photoId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    if (beforePhotos.length === 0 || afterPhotos.length === 0) {
      showToast('Please add both before and after photos', 'error')
      return
    }

    if (!workDescription.trim()) {
      showToast('Please provide a work description', 'error')
      return
    }

    setLoading(true)
    try {
      await submitCompletion(task.id, {
        beforePhotos: beforePhotos.map((p) => ({
          id: p.id,
          url: p.url,
          label: p.label,
          capturedAt: new Date().toISOString(),
        })),
        afterPhotos: afterPhotos.map((p) => ({
          id: p.id,
          url: p.url,
          label: p.label,
          capturedAt: new Date().toISOString(),
        })),
        workDescription,
        materialsNotes,
        completionDate: new Date().toISOString(),
      })
      showToast('Repair completion submitted successfully', 'success')
      navigate(`/contractor/tasks/${task.taskId}`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Submission failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (taskLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Repair Submission" subtitle="Loading task details..." />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (error || !task) {
    return <ErrorState message={error ?? 'Task not found.'} onRetry={reload} />
  }

  if (task.status !== 'in_progress') {
    return (
      <div className="space-y-6">
        <PageHeader title="Repair Submission" subtitle="Submit completion evidence for government inspection" />
        <Card className="border-warning bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="mt-0.5 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-ink">Task Not Ready for Submission</h3>
              <p className="text-body mt-2 text-slate">
                This task is not in the correct state for submission. Current status: {task.status}
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const renderPhotoGrid = (photos: PhotoItem[], type: PhotoType) => (
    <div className="grid grid-cols-3 gap-3">
      {photos.map((photo) => (
        <div key={photo.id} className="relative aspect-square rounded-[8px] border border-border bg-surface-recessed overflow-hidden">
          {uploadingPhotos.has(photo.id) ? (
            <div className="flex h-full items-center justify-center text-primary">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <img
              src={photo.url}
              alt={photo.label}
              className="h-full w-full object-cover rounded-[8px]"
            />
          )}
          <button
            type="button"
            onClick={() => handleRemovePhoto(type, photo.id)}
            className="absolute right-1 top-1 rounded-full bg-danger p-1 text-white"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <input
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={(e) => handlePhotoSelect(e, type)}
        className="hidden"
        id={`${type}-photo-upload`}
      />
      <button
        type="button"
        onClick={() => document.getElementById(`${type}-photo-upload`)?.click()}
        className="flex aspect-square items-center justify-center rounded-[8px] border-2 border-dashed border-border text-slate hover:bg-surface-recessed"
      >
        <Upload size={24} />
      </button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Repair Submission"
        subtitle={`Task ${task.taskId} · ${HAZARD_TYPE_LABELS[task.hazardType]}`}
      />

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <div className="text-xs text-muted">Location</div>
              <div className="text-sm font-medium text-ink">{task.location}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <div className="text-xs text-muted">Deadline</div>
              <div className="text-sm font-medium text-ink">{formatDate(task.deadline)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-primary/10 text-primary shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <div className="text-xs text-muted">SLA Remaining</div>
              <div className="text-sm font-medium text-ink">{task.slaDays} days</div>
            </div>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-5 border-warning/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-warning/10 text-warning shrink-0">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Before Photos</h2>
              <p className="text-sm text-slate">Photos showing the hazard condition before repair work began</p>
            </div>
          </div>
          <div className="mt-4">
            {beforePhotos.length === 0 ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={(e) => handlePhotoSelect(e, 'before')}
                  className="hidden"
                  id="before-photo-upload"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('before-photo-upload')?.click()}
                  className="flex w-full items-center justify-center gap-3 rounded-[10px] border-2 border-dashed border-warning/30 p-8 text-warning hover:bg-warning/5"
                >
                  <Camera size={24} />
                  <span>Add before photo</span>
                </button>
              </>
            ) : (
              renderPhotoGrid(beforePhotos, 'before')
            )}
          </div>
        </Card>

        <Card className="p-5 border-success/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-success/10 text-success shrink-0">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">After Photos</h2>
              <p className="text-sm text-slate">Photos showing the completed repair work</p>
            </div>
          </div>
          <div className="mt-4">
            {afterPhotos.length === 0 ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={(e) => handlePhotoSelect(e, 'after')}
                  className="hidden"
                  id="after-photo-upload"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('after-photo-upload')?.click()}
                  className="flex w-full items-center justify-center gap-3 rounded-[10px] border-2 border-dashed border-success/30 p-8 text-success hover:bg-success/5"
                >
                  <Camera size={24} />
                  <span>Add after photo</span>
                </button>
              </>
            ) : (
              renderPhotoGrid(afterPhotos, 'after')
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-ink mb-4">Work Description</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="workDescription" className="text-sm text-slate">
                Description of work performed *
              </label>
              <Input
                id="workDescription"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="Describe the repair work performed, materials used, etc."
                className="mt-2"
                required
              />
            </div>
            <div>
              <label htmlFor="materialsNotes" className="text-sm text-slate">
                Materials notes (optional)
              </label>
              <Input
                id="materialsNotes"
                value={materialsNotes}
                onChange={(e) => setMaterialsNotes(e.target.value)}
                placeholder="Any specific materials or techniques used"
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Submission Checklist</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
                  Before photos uploaded ({beforePhotos.length})
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
                  After photos uploaded ({afterPhotos.length})
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
                  Work description provided
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                  This evidence will be reviewed by government inspectors
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => navigate(`/contractor/tasks/${task.taskId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Inspection'}
          </Button>
        </div>
      </form>
    </div>
  )
}