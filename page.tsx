import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { PublicProfile } from '@/components/public/public-profile'
import { siteUrl } from '@/lib/env'
import { getPublicPage } from '@/lib/get-public-page'
import { jsonLdString, profileJsonLd, profileMetadata } from '@/lib/seo'
import { publicImageUrl } from '@/lib/supabase/public'
import { THEMES } from '@/lib/theme'

// Rendered fresh on every visit for now, so edits appear instantly. Caching
// with publish-triggered refresh is added once the editor exists (see DECISIONS D-14).
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const page = await getPublicPage(username)
  if (!page) return { title: 'Page not found', robots: { index: false, follow: false } }
  return profileMetadata(page, `${siteUrl()}/${page.username}`, publicImageUrl(page.avatar_path))
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const { username } = await params
  const page = await getPublicPage(username)
  return { themeColor: page ? THEMES[page.theme].bg : '#FAF8F5' }
}

export default async function PublicPageRoute({ params }: Props) {
  const { username } = await params
  const page = await getPublicPage(username)
  if (!page) notFound()

  const pageUrl = `${siteUrl()}/${page.username}`
  const avatarUrl = publicImageUrl(page.avatar_path)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(profileJsonLd(page, pageUrl, avatarUrl)) }}
      />
      <PublicProfile
        page={page}
        imageUrl={publicImageUrl}
        pageUrl={pageUrl}
        qrHref={`/${page.username}/qr`}
        reportHref={`/report/${page.username}`}
      />
    </>
  )
}
