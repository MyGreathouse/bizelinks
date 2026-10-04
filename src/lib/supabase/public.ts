import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { publicEnv } from '@/lib/env'

/**
 * Supabase client for public pages. It never reads cookies and never signs
 * anyone in: it is always an anonymous visitor, so it can only call the public
 * database functions (get_public_page, list_indexable_pages, …).
 */
export function createPublicClient() {
  const env = publicEnv()
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

/** Public web address of an uploaded image (profile photo, product image). */
export function publicImageUrl(path: string | null | undefined): string | null {
  // Uploads always live at <user-id>/<file>; anything else is ignored.
  if (!path || !/^[0-9a-f-]{36}\/[A-Za-z0-9._-]{1,200}$/.test(path)) return null
  return `${publicEnv().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/page-images/${path}`
}
