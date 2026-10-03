import type { MetadataRoute } from 'next'
import { isConfigured, siteUrl } from '@/lib/env'
import { createPublicClient } from '@/lib/supabase/public'

// Rebuilt at most once an hour. Only pages whose owners allow search engines are listed.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/example`, changeFrequency: 'monthly', priority: 0.5 },
  ]
  if (!isConfigured()) return entries
  try {
    const { data } = await createPublicClient().rpc('list_indexable_pages')
    for (const row of (data ?? []) as { username: string; updated_at: string }[]) {
      entries.push({ url: `${base}/${row.username}`, lastModified: row.updated_at, changeFrequency: 'weekly', priority: 0.7 })
    }
  } catch {
    // A database hiccup should shrink the sitemap, not break it.
  }
  return entries
}
