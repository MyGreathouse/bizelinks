import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { publicEnv } from '@/lib/env'

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * It acts as the signed-in user (or as an anonymous visitor), so the database's
 * Row Level Security rules always apply.
 */
export async function createClient() {
  // Read cookies first: this marks the page as "per visitor", so private pages
  // are never generated at build time or cached and shared between people.
  const cookieStore = await cookies()
  const env = publicEnv()
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy refreshes the session instead, so this is safe to ignore.
        }
      },
    },
  })
}

/** The verified signed-in user, or null. Always checks with Supabase — never trusts the cookie alone. */
export async function getUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
}
