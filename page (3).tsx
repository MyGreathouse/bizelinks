import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Wordmark } from '@/components/wordmark'
import { BRAND } from '@/lib/brand'
import { USERNAME_PATTERN } from '@/lib/validation/username'
import { ReportForm } from './report-form'

export const metadata: Metadata = { title: 'Report a page', robots: { index: false, follow: false } }

type Props = { params: Promise<{ username: string }>; searchParams: Promise<{ sent?: string }> }

export default async function ReportPage({ params, searchParams }: Props) {
  const { username } = await params
  const { sent } = await searchParams
  const u = username.toLowerCase()
  if (!USERNAME_PATTERN.test(u)) notFound()

  return (
    <div className="min-h-dvh">
      <header className="shell py-5"><Wordmark /></header>
      <main className="shell max-w-xl! pb-20 pt-6">
        {sent ? (
          <>
            <h1 className="text-[clamp(2rem,6vw,2.75rem)]">Report sent</h1>
            <p className="mt-4 text-lg text-ink-muted">
              Thank you. Our team reviews every report and removes pages that break the {BRAND.name} rules. We don’t
              tell the page owner who reported them.
            </p>
            <p className="mt-8"><Link href="/" className="btn btn-secondary">Go to the {BRAND.name} home page</Link></p>
          </>
        ) : (
          <>
            <h1 className="text-[clamp(2rem,6vw,2.75rem)]">Report a page</h1>
            <p className="mt-4 text-lg text-ink-muted">
              You’re reporting <strong className="text-ink">{BRAND.domain}/{u}</strong>. Reports are anonymous.
            </p>
            <ReportForm username={u} />
          </>
        )}
      </main>
    </div>
  )
}
