import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Wordmark } from '@/components/wordmark'
import { isConfigured } from '@/lib/env'
import { safeNextPath } from '@/lib/safe-redirect'
import { getUser } from '@/lib/supabase/server'
import { validateUsername } from '@/lib/validation/username'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } }

type Search = Promise<{ next?: string; claim?: string; sent?: string; email?: string; error?: string }>

export default async function LoginPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams
  const claim = sp.claim ? validateUsername(sp.claim) : null
  const claimName = claim?.ok ? claim.username : null
  const next = claimName ? `/dashboard?claim=${claimName}` : safeNextPath(sp.next)

  if (isConfigured() && (await getUser())) redirect(next)

  return (
    <main className="flex min-h-dvh flex-col items-center px-5 py-10">
      <Wordmark />
      <div className="mt-12 w-full max-w-sm">
        {!isConfigured() ? (
          <p className="notice notice-info">
            Sign-in isn’t connected yet. Add the Supabase settings from <code>.env.example</code> to enable it.
          </p>
        ) : sp.sent ? (
          <div role="status">
            <h1 className="text-3xl">Check your inbox</h1>
            <p className="mt-3 text-ink-muted">
              We sent a sign-in link to <strong className="text-ink">{sp.email}</strong>. Open it on this device or any
              other. The link works once and expires after an hour.
            </p>
            <p className="mt-6 text-sm text-ink-muted">
              Nothing arrived? Check spam, or{' '}
              <a className="font-semibold text-ink underline underline-offset-4" href="/login">
                send another link
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl">{claimName ? `Claim bizelinks.com/${claimName}` : 'Sign in or create your page'}</h1>
            <p className="mt-3 mb-8 text-ink-muted">
              {claimName
                ? 'Enter your email to create your account. You’ll confirm the username on the next step.'
                : 'New here? The same link creates your account.'}
            </p>
            {sp.error === 'link' && (
              <p className="notice notice-error mb-6" role="alert">
                That sign-in link has expired or was already used. Send yourself a new one below.
              </p>
            )}
            {claim && !claim.ok && (
              <p className="notice notice-info mb-6">{claim.message} You can choose one after signing in.</p>
            )}
            <LoginForm next={next} />
          </>
        )}
      </div>
    </main>
  )
}
