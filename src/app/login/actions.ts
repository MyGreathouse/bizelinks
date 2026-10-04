'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { siteUrl } from '@/lib/env'
import { safeNextPath } from '@/lib/safe-redirect'
import { createClient } from '@/lib/supabase/server'

export type LoginState = { error?: string; email?: string }

const Email = z.email({ message: 'Enter an email address like name@example.com.' }).max(254)

/**
 * Passwordless sign-in: we email a one-time link. The same step creates the
 * account for new people, so there is one flow for "sign up" and "sign in".
 */
export async function sendMagicLink(_prev: LoginState, form: FormData): Promise<LoginState> {
  const raw = String(form.get('email') ?? '').trim()
  const parsed = Email.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, email: raw }

  const next = safeNextPath(String(form.get('next') ?? ''))
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    if (error.status === 429)
      return { error: 'Too many sign-in emails were requested. Wait a minute, then try again.', email: raw }
    console.error('signInWithOtp failed', error.status, error.code)
    return { error: 'The sign-in email couldn’t be sent. Try again in a moment.', email: raw }
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(parsed.data)}`)
}
