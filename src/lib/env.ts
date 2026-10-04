import { z } from 'zod'

/**
 * Environment contract. Values are checked the first time they're needed (not
 * at import), so the site can still build before Supabase is connected.
 *
 * BizeLinks deliberately needs NO Supabase secret/service-role key: every
 * privileged operation runs inside the database behind Row Level Security or a
 * narrowly-scoped function. There is no master key to leak.
 */
const PublicEnv = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().refine((v) => !v.endsWith('/'), 'No trailing slash'),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .startsWith('sb_publishable_', 'Use the new "Publishable key" (sb_publishable_…), not a secret key'),
})
export type PublicEnv = z.infer<typeof PublicEnv>

let cached: PublicEnv | undefined

export function publicEnv(): PublicEnv {
  if (cached) return cached
  // NEXT_PUBLIC_* must be referenced literally so Next.js can inline them.
  const parsed = PublicEnv.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  })
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`BizeLinks is missing configuration — ${fields}. See .env.example.`)
  }
  cached = parsed.data
  return cached
}

/** True when Supabase settings exist. Lets pages show a friendly notice instead of crashing. */
export function isConfigured(): boolean {
  return PublicEnv.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }).success
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://bizelinks.com'
}
