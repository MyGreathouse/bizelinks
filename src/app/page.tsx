import Link from 'next/link'
import { ClaimBar } from '@/components/claim-bar'
import { SiteFooter } from '@/components/site-footer'
import { Wordmark } from '@/components/wordmark'

// Phase 1 home page. The full marketing site (example page, features,
// who it's for, how it works, FAQ) is built in Phase 2.
export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="shell flex items-center justify-between py-5">
        <Wordmark />
        <Link href="/login" className="btn btn-quiet">
          Sign in
        </Link>
      </header>

      <main className="shell flex flex-1 flex-col justify-center py-16 sm:py-24">
        <h1 className="max-w-[14ch] text-[clamp(2.75rem,8vw,5.25rem)] leading-[1.02] tracking-[-0.025em]">
          Your links. Your brand. One&nbsp;page.
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg text-ink-muted">
          Bring your content, products, services and favourite destinations together in one polished page you can
          share anywhere.
        </p>
        <div className="mt-10">
          <ClaimBar />
          <p className="mt-3 pl-1 text-sm text-ink-muted">Free to start. No card needed.</p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
