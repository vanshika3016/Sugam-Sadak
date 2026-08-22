interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyPrefix: string
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 3,
  windowMs: 5 * 60 * 1000,
  keyPrefix: 'sugam_sadak_ratelimit',
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

function getStorageKey(key: string, prefix: string): string {
  return `${prefix}:${key}`
}

function getClientKey(): string {
  if (typeof window === 'undefined') return 'server'
  
  let clientId = localStorage.getItem('sugam_sadak_client_id')
  if (!clientId) {
    clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('sugam_sadak_client_id', clientId)
  }
  return clientId
}

export function checkRateLimit(
  action: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
  const { maxRequests, windowMs, keyPrefix } = { ...DEFAULT_CONFIG, ...config }
  const clientKey = getClientKey()
  const storageKey = getStorageKey(`${action}:${clientKey}`, keyPrefix)
  
  if (typeof window === 'undefined') {
    return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowMs }
  }
  
  const now = Date.now()
  const stored = localStorage.getItem(storageKey)
  
  let entry: RateLimitEntry
  if (stored) {
    try {
      entry = JSON.parse(stored)
    } catch {
      entry = { count: 0, resetTime: now + windowMs }
    }
  } else {
    entry = { count: 0, resetTime: now + windowMs }
  }
  
  if (now > entry.resetTime) {
    entry = { count: 0, resetTime: now + windowMs }
  }
  
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: entry.resetTime,
      retryAfter 
    }
  }
  
  entry.count += 1
  localStorage.setItem(storageKey, JSON.stringify(entry))
  
  return { 
    allowed: true, 
    remaining: maxRequests - entry.count, 
    resetTime: entry.resetTime 
  }
}

export function resetRateLimit(action: string, config: Partial<RateLimitConfig> = {}): void {
  const { keyPrefix } = { ...DEFAULT_CONFIG, ...config }
  const clientKey = getClientKey()
  const storageKey = getStorageKey(`${action}:${clientKey}`, keyPrefix)
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem(storageKey)
  }
}

export function getRateLimitInfo(action: string, config: Partial<RateLimitConfig> = {}): { count: number; remaining: number; resetTime: number } {
  const { maxRequests, windowMs, keyPrefix } = { ...DEFAULT_CONFIG, ...config }
  const clientKey = getClientKey()
  const storageKey = getStorageKey(`${action}:${clientKey}`, keyPrefix)
  
  if (typeof window === 'undefined') {
    return { count: 0, remaining: maxRequests, resetTime: Date.now() + windowMs }
  }
  
  const stored = localStorage.getItem(storageKey)
  const now = Date.now()
  
  if (!stored) {
    return { count: 0, remaining: maxRequests, resetTime: now + windowMs }
  }
  
  try {
    const entry = JSON.parse(stored)
    if (now > entry.resetTime) {
      return { count: 0, remaining: maxRequests, resetTime: now + windowMs }
    }
    return { 
      count: entry.count, 
      remaining: Math.max(0, maxRequests - entry.count), 
      resetTime: entry.resetTime 
    }
  } catch {
    return { count: 0, remaining: maxRequests, resetTime: now + windowMs }
  }
}

export function formatRetryTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`
  }
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`
}