import Link from 'next/link'
import { ClaimBar } from '@/components/claim-bar'
import { PublicProfile } from '@/components/public/public-profile'
import { SiteFooter } from '@/components/site-footer'
import { Wordmark } from '@/components/wordmark'
import { BRAND } from '@/lib/brand'
import { DEMO_PAGE } from '@/lib/demo-page'
import { siteUrl } from '@/lib/env'

const SPOTLIGHT_EXAMPLES = [
  { who: 'An author', items: ['Buy my new book', 'Read the first chapter', 'Book me to speak'] },
  { who: 'A consultant', items: ['Book a consultation', 'Download the free guide', 'Client results'] },
  { who: 'A musician', items: ['Listen to the new single', 'Tour dates', 'Booking enquiries'] },
]

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="shell flex items-center justify-between py-5">
        <Wordmark />
        <nav className="flex items-center gap-1" aria-label="Main">
          <Link href="/example" className="btn btn-quiet hidden sm:inline-flex">Example page</Link>
          <Link href="/login" className="btn btn-quiet">Sign in</Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero: the promise, the action, and the product itself */}
        <section className="shell grid grid-cols-1 items-center gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <div className="min-w-0">
            <h1 className="max-w-[13ch] text-[clamp(2.75rem,8vw,5rem)] leading-[1.02] tracking-[-0.025em]">
              {BRAND.tagline}
            </h1>
            <p className="mt-6 max-w-[44ch] text-lg text-ink-muted">{BRAND.summary}</p>
            <div className="mt-10">
              <ClaimBar />
              <p className="mt-3 pl-1 text-sm text-ink-muted">
                Free to start. No card needed.{' '}
                <Link href="/example" className="font-semibold text-ink underline underline-offset-4">See an example page</Link>
              </p>
            </div>
          </div>

          <figure className="mx-auto w-full max-w-[22rem]">
            <div
              className="h-[36rem] overflow-hidden rounded-[2.25rem] border-[10px] border-ink shadow-[var(--shadow-lift)] [&_.bl-page]:min-h-full [&>*]:[zoom:0.8]"
              inert
            >
              <PublicProfile page={DEMO_PAGE} imageUrl={() => null} pageUrl={`${siteUrl()}/example`} qrHref="/example/qr" />
            </div>
            <figcaption className="mt-4 text-center text-sm text-ink-muted">
              A real {BRAND.name} page, shown at 80% size.{' '}
              <Link href="/example" className="font-semibold text-ink underline underline-offset-4">Open it full size</Link>
            </figcaption>
          </figure>
        </section>

        {/* The problem */}
        <section className="border-t border-line">
          <div className="shell grid gap-6 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
            <h2 className="max-w-[16ch] text-[clamp(2rem,5vw,3rem)]">Your audience shouldn’t have to hunt for you.</h2>
            <div className="max-w-[48ch] space-y-4 text-lg text-ink-muted">
              <p>
                Your website is in one place, your shop in another, your booking page somewhere else again. Every extra
                tap is a chance for someone to give up.
              </p>
              <p className="text-ink">
                {BRAND.name} gives you one address that holds all of it, and puts the thing you most want people to do
                right at the top.
              </p>
            </div>
          </div>
        </section>

        {/* Spotlight */}
        <section className="border-t border-line bg-surface">
          <div className="shell py-16 sm:py-20">
            <h2 className="max-w-[18ch] text-[clamp(2rem,5vw,3rem)]">Put what matters most at the top.</h2>
            <p className="mt-4 max-w-[52ch] text-lg text-ink-muted">
              Spotlight pins your three priorities above everything else on your page, so visitors know what to do
              first. Change them whenever your priorities change.
            </p>
            <ul className="mt-10 grid gap-4 md:grid-cols-3">
              {SPOTLIGHT_EXAMPLES.map((ex) => (
                <li key={ex.who} className="rounded-[var(--radius-card)] border border-line bg-canvas p-5">
                  <h3 className="font-sans text-sm font-semibold text-ink-muted">{ex.who}</h3>
                  <ol className="mt-3 space-y-2">
                    {ex.items.map((item, i) => (
                      <li
                        key={item}
                        className={
                          i === 0
                            ? 'rounded-[14px] bg-ember px-4 py-3 font-semibold text-white'
                            : 'rounded-[12px] border-[1.5px] border-[#E6A58F] bg-surface px-4 py-2.5 font-medium'
                        }
                      >
                        {item}
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing action */}
        <section className="border-t border-line">
          <div className="shell py-16 sm:py-24">
            <h2 className="max-w-[16ch] text-[clamp(2rem,5vw,3rem)]">One link. Everything you do.</h2>
            <div className="mt-8"><ClaimBar size="md" /></div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
