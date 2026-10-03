import 'server-only'
import { cache } from 'react'
import { isConfigured } from '@/lib/env'
import { PublicPageSchema, type PublicPage } from '@/lib/public-page'
import { createPublicClient } from '@/lib/supabase/public'
import { USERNAME_PATTERN } from '@/lib/validation/username'

/**
 * Loads a published page, or null. Wrapped in cache() so the page and its
 * metadata share one database call per request.
 */
export const getPublicPage = cache(async (rawUsername: string): Promise<PublicPage | null> => {
  const username = decodeURIComponent(rawUsername).toLowerCase()
  if (!USERNAME_PATTERN.test(username) || !isConfigured()) return null

  const { data, error } = await createPublicClient().rpc('get_public_page', { p_username: username })
  if (error) {
    // A database outage must not look like "page doesn't exist" to the owner's
    // visitors forever — throw so the error page (and logs) show it.
    throw new Error(`get_public_page failed: ${error.message}`)
  }
  if (!data) return null
  const parsed = PublicPageSchema.safeParse(data)
  if (!parsed.success) throw new Error('get_public_page returned an unexpected shape')
  return parsed.data
})
