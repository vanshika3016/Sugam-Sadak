import { mockApi } from './mockApi'
import { supabaseApi } from './supabaseApi'

// Check if Supabase is configured with real credentials
const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!(url && key && url !== 'https://your-project.supabase.co' && key !== 'your-anon-key')
}

// Export the appropriate API based on configuration
export const api = isSupabaseConfigured() ? supabaseApi : mockApi

export { mockApi } from './mockApi'
export { supabaseApi } from './supabaseApi'

export default api