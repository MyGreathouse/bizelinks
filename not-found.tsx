import Link from 'next/link'
import { ClaimBar } from '@/components/claim-bar'
import { SiteFooter } from '@/components/site-footer'
import { Wordmark } from '@/components/wordmark'

export const metadata = { title: 'Page not found', robots: { index: false } }

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="shell py-5"><Wordmark /></header>
      <main className="shell flex flex-1 flex-col justify-center py-16">
        <h1 className="max-w-[16ch] text-[clamp(2.25rem,6vw,3.75rem)]">Nothing lives at this address yet.</h1>
        <p className="mt-4 max-w-[46ch] text-lg text-ink-muted">
          The page may be unpublished, renamed, or never existed. If you’re looking for a person’s page, check the
          spelling of the link.
        </p>
        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold">Want this address for yourself?</p>
          <ClaimBar size="md" />
        </div>
        <p className="mt-8 text-sm"><Link href="/" className="font-semibold underline underline-offset-4">Go to the BizeLinks home page</Link></p>
      </main>
      <SiteFooter />
    </div>
  )
}
