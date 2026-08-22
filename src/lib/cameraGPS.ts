export interface GPSValidationResult {
  valid: boolean
  accuracy?: number
  error?: string
  warnings: string[]
}

export interface CameraCapabilities {
  hasCamera: boolean
  hasEnvironmentCapture: boolean
  supportedMimeTypes: string[]
  maxResolution?: { width: number; height: number }
}

const INDIA_BOUNDS = {
  minLat: 6.0,
  maxLat: 38.0,
  minLng: 68.0,
  maxLng: 98.0,
}

export function validateGPSLocation(lat: number, lng: number, accuracy?: number): GPSValidationResult {
  const warnings: string[] = []
  
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: 'Invalid coordinates', warnings }
  }
  
  if (lat < INDIA_BOUNDS.minLat || lat > INDIA_BOUNDS.maxLat ||
      lng < INDIA_BOUNDS.minLng || lng > INDIA_BOUNDS.maxLng) {
    return { 
      valid: false, 
      error: 'Location appears to be outside India',
      warnings 
    }
  }
  
  if (accuracy !== undefined) {
    if (accuracy > 100) {
      warnings.push('Low GPS accuracy - location may be imprecise')
    }
    if (accuracy > 500) {
      warnings.push('Very low GPS accuracy - consider manual location entry')
    }
  }
  
  const latStr = lat.toString()
  const lngStr = lng.toString()
  const latDecimals = latStr.includes('.') ? latStr.split('.')[1].length : 0
  const lngDecimals = lngStr.includes('.') ? lngStr.split('.')[1].length : 0
  
  if (latDecimals > 6 || lngDecimals > 6) {
    warnings.push('Unusually high coordinate precision - possible GPS spoofing')
  }
  
  if (lat === 0 && lng === 0) {
    warnings.push('Coordinates are (0,0) - likely invalid')
  }
  
  return { valid: true, accuracy, warnings }
}

export function sanitizeCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  const cleanLat = Math.round(lat * 1e6) / 1e6
  const cleanLng = Math.round(lng * 1e6) / 1e6
  return { lat: cleanLat, lng: cleanLng }
}

export async function checkCameraPermissions(): Promise<PermissionState> {
  if (typeof navigator === 'undefined' || !navigator.permissions) {
    return 'prompt'
  }
  
  try {
    const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
    return permission.state
  } catch {
    return 'prompt'
  }
}

export async function checkLocationPermissions(): Promise<PermissionState> {
  if (typeof navigator === 'undefined' || !navigator.permissions) {
    return 'prompt'
  }
  
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
    return permission.state
  } catch {
    return 'prompt'
  }
}

export function getCameraCapabilities(): CameraCapabilities {
  const capabilities: CameraCapabilities = {
    hasCamera: false,
    hasEnvironmentCapture: false,
    supportedMimeTypes: [],
  }
  
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return capabilities
  }
  
  capabilities.hasCamera = true
  capabilities.hasEnvironmentCapture = 'mediaDevices' in navigator && 
    'getUserMedia' in navigator.mediaDevices
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const testMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    capabilities.supportedMimeTypes = testMimeTypes.filter(type => {
      try {
        return canvas.toDataURL(type).startsWith(`data:${type}`)
      } catch {
        return false
      }
    })
  }
  
  return capabilities
}

export async function capturePhoto(
  constraints: MediaStreamConstraints = { 
    video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
  }
): Promise<Blob> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    throw new Error('Camera not available')
  }
  
  const stream = await navigator.mediaDevices.getUserMedia(constraints)
  const track = stream.getVideoTracks()[0]
  
  try {
    const settings = track.getSettings()
    const canvas = document.createElement('canvas')
    canvas.width = settings.width || 1920
    canvas.height = settings.height || 1080
    
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not available')
    
    const video = document.createElement('video')
    video.srcObject = stream
    video.play()
    
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.play().then(resolve).catch(reject)
      }
      video.onerror = reject
    })
    
    await new Promise(resolve => setTimeout(resolve, 100))
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      }, 'image/jpeg', 0.85)
    })
  } finally {
    track.stop()
  }
}

export function stripExifData(blob: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((cleanBlob) => {
          resolve(cleanBlob || blob)
        }, 'image/jpeg', 0.85)
      } else {
        resolve(blob)
      }
    }
    img.src = URL.createObjectURL(blob)
  })
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files are allowed' }
  }
  
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported image format. Use JPEG, PNG, WebP, or HEIC.' }
  }
  
  return { valid: true }
}

export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

export function revokeImagePreview(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}