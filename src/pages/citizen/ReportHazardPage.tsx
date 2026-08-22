// @ts-nocheck
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { findNearest } from '@/services/roadAssetService'
import { create as createHazardReport } from '@/services/hazardReportService'
import { HAZARD_TYPE_LABELS, SEVERITY_LABELS, type HazardType, type Severity } from '@/types/enums'
import { AlertCircle, Camera, MapPin, Upload, X, Map, Check, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'

const HAZARD_TYPES: Array<{ value: HazardType; label: string; icon: string }> = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'open_manhole', label: 'Open Manhole', icon: '🚧' },
  { value: 'broken_streetlight', label: 'Broken Streetlight', icon: '💡' },
  { value: 'missing_barricade', label: 'Missing Barricade', icon: '🚧' },
  { value: 'road_damage', label: 'Road Damage', icon: '🛣️' },
  { value: 'bridge_damage', label: 'Bridge Damage', icon: '🌉' },
  { value: 'drainage_issue', label: 'Drainage Issue', icon: '💧' },
  { value: 'other', label: 'Other', icon: '📝' },
]

const SEVERITY_OPTIONS: Array<{ value: Severity; label: string; color: string; icon: string; description: string }> = [
  { value: 'low', label: 'Low', color: 'bg-success', icon: '🟢', description: 'Minor issue, no immediate danger' },
  { value: 'medium', label: 'Medium', color: 'bg-warning', icon: '🟡', description: 'Needs attention within days' },
  { value: 'high', label: 'High', color: 'bg-warning', icon: '🟠', description: 'Safety concern, fix within 72 hours' },
  { value: 'critical', label: 'Critical', color: 'bg-danger', icon: '🔴', description: 'Immediate danger, emergency response' },
]

export function ReportHazardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [hazardType, setHazardType] = useState<HazardType>('open_manhole')
  const [severity, setSeverity] = useState<Severity>('high')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.209 })
  const [locationLabel, setLocationLabel] = useState('Ward 12 · Near Community Centre')
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; label?: string; file?: File }>>([])
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState<Set<string>>(new Set())
  const [nearestAsset, setNearestAsset] = useState<{ roadId: string; name: string; location: string } | null>(null)
  const [showAssetSuggestion, setShowAssetSuggestion] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const handleLocationDetect = async () => {
    setUsingCurrentLocation(true)
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setLocation({ lat: latitude, lng: longitude })
            findNearest(latitude, longitude).then((asset) => {
              setLocationLabel(`${asset.location}`)
              setNearestAsset({ roadId: asset.roadId, name: asset.name, location: asset.location })
              setShowAssetSuggestion(true)
              setUsingCurrentLocation(false)
            })
          },
          () => {
            showToast('Unable to get location. Using default.', 'warning')
            setUsingCurrentLocation(false)
          }
        )
      }
    } catch {
      showToast('Location detection failed. Using default.', 'warning')
      setUsingCurrentLocation(false)
    }
  }

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const newPhoto = {
        id: photoId,
        url: URL.createObjectURL(file),
        label: 'Hazard photo',
        file,
      }
      setPhotos((prev) => [...prev, newPhoto])

      try {
        setUploadingPhotos((prev) => new Set(prev).add(photoId))
        const path = `hazard-reports/${user?.id}/${photoId}-${file.name}`
        const publicUrl = await authService.api.uploadPhoto(file, path)
        setPhotos((prev) =>
          prev.map((p) => (p.id === photoId ? { ...p, url: publicUrl, file: undefined } : p))
        )
        showToast('Photo uploaded', 'success')
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

  const handleRemovePhoto = (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId)
    if (photo?.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url)
    }
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const asset = await findNearest(location.lat, location.lng)
      const report = await createHazardReport({
        citizenId: user.id,
        hazardType,
        severity,
        description,
        location,
        locationLabel,
        roadAssetId: asset.id,
        photos: photos.map((p) => ({
          id: p.id,
          url: p.url,
          label: p.label,
          capturedAt: new Date().toISOString(),
        })),
      })
      showToast('Hazard reported successfully', 'success')
      navigate(`/citizen/report/success/${report.reportId}`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to report hazard', 'error')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, label: 'Hazard Type', icon: AlertCircle },
    { number: 2, label: 'Severity', icon: AlertCircle },
    { number: 3, label: 'Location', icon: MapPin },
    { number: 4, label: 'Details', icon: CheckCircle },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-ink">Report a Hazard</h1>
        <p className="text-body mt-2 text-slate max-w-xl mx-auto">
          Report road infrastructure issues in under 60 seconds. Your report helps keep our roads safe.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="hidden md:flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300',
              currentStep > step.number
                ? 'bg-success text-white'
                : currentStep === step.number
                ? 'bg-primary text-white shadow-[0_0_0_3px_rgb(59,130,246,0.2)]'
                : 'bg-surface-recessed text-muted border border-border'
            )}>
              {currentStep > step.number ? <Check size={14} /> : step.number}
            </div>
            <span className={cn('ml-2 text-sm font-medium hidden sm:block', currentStep >= step.number ? 'text-ink' : 'text-muted')}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={cn('ml-4 w-16 h-0.5 rounded', currentStep > step.number ? 'bg-success' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile step indicator */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between text-xs">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center gap-1">
              <div className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all duration-300',
                currentStep > step.number
                  ? 'bg-success text-white'
                  : currentStep === step.number
                  ? 'bg-primary text-white'
                  : 'bg-surface-recessed text-muted border border-border'
              )}>
                {currentStep > step.number ? <Check size={10} /> : step.number}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-center text-sm text-muted">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.label}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Hazard Type */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">What type of hazard?</h2>
            <span className="text-xs text-muted">Step 1 of 4</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HAZARD_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => { setHazardType(type.value); setCurrentStep(Math.max(currentStep, 2)); }}
                className={cn(
                  'rounded-[12px] border-2 p-4 text-center transition-all duration-150',
                  hazardType === type.value
                    ? 'border-primary bg-primary/5 shadow-[0_0_0_2px_rgb(59,130,246,0.2)]'
                    : 'border-border hover:bg-surface-recessed hover:border-primary/30'
                )}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-sm font-medium text-ink">{type.label}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Step 2: Severity */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">How severe is it?</h2>
            <span className="text-xs text-muted">Step 2 of 4</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SEVERITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { setSeverity(option.value); setCurrentStep(Math.max(currentStep, 3)); }}
                className={cn(
                  'rounded-[12px] border-2 p-4 text-center transition-all duration-150 relative',
                  severity === option.value
                    ? 'border-primary bg-primary/5 shadow-[0_0_0_2px_rgb(59,130,246,0.2)]'
                    : 'border-border hover:bg-surface-recessed hover:border-primary/30'
                )}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium text-ink">{option.label}</div>
                <div className={`mx-auto h-2 w-2 rounded-full ${option.color} mt-2`} />
                <div className="text-xs text-muted mt-2 line-clamp-2">{option.description}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Step 3: Location */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">Where is it?</h2>
            <span className="text-xs text-muted">Step 3 of 4</span>
          </div>
          <div className="space-y-4">
            {showAssetSuggestion && nearestAsset && (
              <div className="rounded-[10px] bg-primary/5 border border-primary/20 p-4 animate-slide-in">
                <div className="flex items-center gap-3">
                  <Map size={20} className="text-primary shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-primary">Nearest Road Asset Detected</div>
                    <div className="text-sm font-mono-road text-primary mt-0.5">{nearestAsset.roadId}</div>
                    <div className="text-sm text-slate mt-0.5">{nearestAsset.name} · {nearestAsset.location}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAssetSuggestion(false)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-primary" />
              <div className="flex-1">
                <div className="text-sm text-slate">Detected location</div>
                <div className="text-lg font-medium text-ink">{locationLabel}</div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleLocationDetect}
                disabled={usingCurrentLocation}
              >
                {usingCurrentLocation ? 'Detecting...' : 'Use current location'}
              </Button>
            </div>
            <div className="text-sm text-slate flex items-center gap-2">
              <Map size={14} className="text-muted" />
              Coordinates: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </div>
          </div>
        </Card>

        {/* Step 4: Details */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">Add details</h2>
            <span className="text-xs text-muted">Step 4 of 4</span>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="text-sm text-slate">
                Description (optional)
              </label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the hazard, size, traffic impact, etc."
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Photos */}
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-ink mb-4">Add photos (optional)</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
            id="photo-upload"
          />
          {photos.length === 0 ? (
            <button
              type="button"
              onClick={() => document.getElementById('photo-upload')?.click()}
              className="flex w-full items-center justify-center gap-3 rounded-[10px] border-2 border-dashed border-border p-8 text-slate hover:bg-surface-recessed"
            >
              <Camera size={24} />
              <span>Tap to add photo</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-[8px] border border-border bg-surface-recessed overflow-hidden">
                  {uploadingPhotos.has(photo.id) ? (
                    <div className="flex h-full items-center justify-center text-primary">
                      <Loader2 size={24} className="animate-spin" />
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
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute right-1 top-1 rounded-full bg-danger p-1 text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => document.getElementById('photo-upload')?.click()}
                className="flex aspect-square items-center justify-center rounded-[8px] border-2 border-dashed border-border text-slate hover:bg-surface-recessed"
              >
                <Upload size={24} />
              </button>
            </div>
          )}
        </Card>

        {/* Review */}
        <Card className="p-4 bg-surface border-primary/20">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
              <Check size={18} />
            </div>
            <div className="text-sm text-slate">
              <strong className="text-ink">Review your report:</strong>
              <div className="mt-2 space-y-1 text-sm">
                <div><strong>Type:</strong> <span className="text-ink">{HAZARD_TYPE_LABELS[hazardType]}</span></div>
                <div><strong>Severity:</strong> <span className="text-ink">{SEVERITY_LABELS[severity]}</span></div>
                <div><strong>Location:</strong> <span className="text-ink">{locationLabel}</span></div>
                <div><strong>Road Asset:</strong> <span className="font-mono-road text-primary">{nearestAsset?.roadId || 'SS-W12-R211'}</span></div>
                <div><strong>Photos:</strong> <span className="text-ink">{photos.length}</span></div>
              </div>
            </div>
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Report'
          )}
        </Button>
      </form>
    </div>
  )
}