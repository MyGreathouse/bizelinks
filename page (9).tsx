import { getUser } from '@/lib/supabase/server'

// Phase 1 placeholder: proves sign-in works end to end.
// The real dashboard (profile editor, link manager, preview, publish) is Phase 3.
export default async function DashboardPage() {
  const user = await getUser()
  return (
    <main>
      <h1 className="text-3xl">You’re signed in</h1>
      <p className="mt-3 max-w-prose text-ink-muted">
        Signed in as <strong className="text-ink">{user?.email}</strong>. Page setup, the link manager and
        publishing arrive in the next phases.
      </p>
    </main>
  )
}
