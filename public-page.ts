import { z } from 'zod'
import { BADGES, ITEM_KINDS } from '@/lib/plans'
import { SOCIAL_PROVIDERS } from '@/lib/socials'
import { THEME_IDS } from '@/lib/theme'

/**
 * The shape of a public page, exactly as get_public_page() returns it.
 * Parsed (not just typed) so a database change can never put unexpected data
 * on a live page: anything that doesn't match is dropped, not rendered.
 */
const Item = z.object({
  id: z.string(),
  zone: z.enum(['spotlight', 'products', 'links']),
  kind: z.enum(ITEM_KINDS).catch('link'),
  title: z.string(),
  url: z.string().regex(/^https?:\/\//i),
  description: z.string().catch(''),
  image_path: z.string().nullable().catch(null),
  cta_label: z.string().nullable().catch(null),
  price_label: z.string().nullable().catch(null),
  badge: z.enum(BADGES).nullable().catch(null),
})

const Social = z.object({
  provider: z.enum(SOCIAL_PROVIDERS),
  url: z.string().regex(/^(https?:\/\/|mailto:)/i),
})

export const PublicPageSchema = z.object({
  username: z.string(),
  display_name: z.string(),
  descriptor: z.string().catch(''),
  bio: z.string().catch(''),
  location: z.string().catch(''),
  avatar_path: z.string().nullable().catch(null),
  entity_type: z.enum(['person', 'organization']).catch('person'),
  is_indexable: z.boolean().catch(false),
  theme: z.enum(THEME_IDS).catch('paper'),
  accent: z.string().catch(''),
  updated_at: z.string(),
  // One bad row shouldn't take the whole page down: invalid entries are skipped.
  socials: z.array(z.unknown()).transform((rows) => rows.flatMap((r) => {
    const p = Social.safeParse(r)
    return p.success ? [p.data] : []
  })),
  items: z.array(z.unknown()).transform((rows) => rows.flatMap((r) => {
    const p = Item.safeParse(r)
    return p.success ? [p.data] : []
  })),
})

export type PublicPage = z.infer<typeof PublicPageSchema>
export type PageItem = PublicPage['items'][number]
export type SocialLink = PublicPage['socials'][number]

/** Splits items by zone, keeping their order. Spotlight never shows more than 3. */
export function groupItems(items: PageItem[]) {
  return {
    spotlight: items.filter((i) => i.zone === 'spotlight').slice(0, 3),
    products: items.filter((i) => i.zone === 'products'),
    links: items.filter((i) => i.zone === 'links'),
  }
}

/** "www.youtube.com/watch?v=…" → "youtube.com". Shown under links so visitors see where they're going. */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** Two-letter initials for a profile without a photo. */
export function initials(name: string, fallback: string): string {
  const words = (name.trim() || fallback).split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? words[0]![0]! + words[words.length - 1]![0]! : (words[0] ?? '?').slice(0, 2)
  return letters.toUpperCase()
}
