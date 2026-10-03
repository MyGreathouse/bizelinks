import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Wordmark } from '@/components/wordmark'
import { isConfigured } from '@/lib/env'
import { getUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false, follow: false } }

/**
 * Second gate (the proxy is the first): the server re-verifies the user with
 * Supabase before rendering anything private. Hiding buttons is never the security.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isConfigured()) redirect('/login')
  const user = await getUser()
  if (!user) redirect('/login?next=/dashboard')

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="shell flex items-center justify-between py-3">
          <Wordmark href="/dashboard" />
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn btn-quiet">Sign out</button>
          </form>
        </div>
      </header>
      <div className="shell py-10">{children}</div>
    </div>
  )
}
