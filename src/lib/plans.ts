/**
 * Every product limit lives here. The database enforces the same numbers
 * (supabase/migrations/…_core_schema.sql) — change both together.
 * No billing exists in the MVP; paid plans can hang off this later.
 */
export const LIMITS = {
  spotlight: 3,
  products: 12,
  links: 50,
  socials: 16,
  descriptorMax: 60,
  priceMax: 20,
  titleMax: 80,
  descriptionMax: 200,
  ctaMax: 24,
  bioMax: 160,
  displayNameMax: 60,
  locationMax: 60,
  urlMax: 2048,
  imageMaxBytes: 2 * 1024 * 1024,
  imageTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const

/** Where an item sits on the page. Placement, not type, decides its size. */
export const ZONES = ['spotlight', 'products', 'links'] as const
export type Zone = (typeof ZONES)[number]

/** What an item is. Decides its default button label. */
export const ITEM_KINDS = ['link', 'product', 'service', 'content', 'booking', 'newsletter', 'event'] as const
export type ItemKind = (typeof ITEM_KINDS)[number]

/** Verb-first default button labels. Users can override (max 24 chars). */
export const DEFAULT_CTA: Record<ItemKind, string> = {
  link: 'Visit',
  product: 'Shop now',
  service: 'Learn more',
  content: 'Watch or read',
  booking: 'Book a time',
  newsletter: 'Subscribe',
  event: 'Get tickets',
}

/** Small labels an item can wear. Fixed list, so nobody can write "FREE MONEY" in a badge. */
export const BADGES = ['new', 'popular', 'offer', 'limited'] as const
export type Badge = (typeof BADGES)[number]

export const BADGE_LABEL: Record<Badge, string> = {
  new: 'New',
  popular: 'Popular',
  offer: 'Offer',
  limited: 'Limited',
}
