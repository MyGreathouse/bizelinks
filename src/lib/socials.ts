/**
 * Social platforms a page can link to. The database CHECK lists the same ids —
 * add a platform in both places. Shown as labelled chips (no brand logos), so
 * every platform reads clearly and the list can grow without new artwork.
 */
export const SOCIAL_PROVIDERS = [
  'instagram', 'tiktok', 'youtube', 'facebook', 'linkedin', 'x', 'threads', 'pinterest',
  'snapchat', 'spotify', 'whatsapp', 'telegram', 'discord', 'github', 'email', 'website',
] as const
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]

export const SOCIAL_LABEL: Record<SocialProvider, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  x: 'X',
  threads: 'Threads',
  pinterest: 'Pinterest',
  snapchat: 'Snapchat',
  spotify: 'Spotify',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  discord: 'Discord',
  github: 'GitHub',
  email: 'Email',
  website: 'Website',
}

export function isSocialProvider(v: string): v is SocialProvider {
  return (SOCIAL_PROVIDERS as readonly string[]).includes(v)
}

/** Social URLs that describe the person/organisation (for search engines' sameAs). */
export function isProfileUrl(provider: SocialProvider): boolean {
  return provider !== 'email' && provider !== 'whatsapp'
}
