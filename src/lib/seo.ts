import type { Metadata } from 'next'
import { BRAND } from '@/lib/brand'
import type { PublicPage } from '@/lib/public-page'
import { isProfileUrl } from '@/lib/socials'

/** Search and share-preview details for a public page. */
export function profileMetadata(page: PublicPage, pageUrl: string, avatarUrl: string | null): Metadata {
  const name = page.display_name.trim() || `@${page.username}`
  const title = `${name} | ${BRAND.name}`
  const description = (
    page.bio || page.descriptor || `Links, products and the latest from ${name}, all in one place.`
  ).slice(0, 160)
  const image = avatarUrl ?? '/og-default.png'

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: pageUrl },
    robots: page.is_indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: 'profile',
      url: pageUrl,
      title,
      description,
      siteName: BRAND.name,
      images: [{ url: image, alt: avatarUrl ? name : `${BRAND.name}: ${BRAND.tagline}` }],
    },
    twitter: { card: avatarUrl ? 'summary' : 'summary_large_image', title, description, images: [image] },
  }
}

/** schema.org ProfilePage, so search engines understand who the page is about. */
export function profileJsonLd(page: PublicPage, pageUrl: string, avatarUrl: string | null): Record<string, unknown> {
  const name = page.display_name.trim() || page.username
  const sameAs = page.socials.filter((s) => isProfileUrl(s.provider)).map((s) => s.url)
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: pageUrl,
    dateModified: page.updated_at,
    mainEntity: {
      '@type': page.entity_type === 'organization' ? 'Organization' : 'Person',
      name,
      ...(page.descriptor || page.bio ? { description: page.descriptor || page.bio } : {}),
      ...(avatarUrl ? { image: avatarUrl } : {}),
      ...(sameAs.length ? { sameAs } : {}),
      url: pageUrl,
    },
  }
}

/** JSON for a <script type="application/ld+json">, made safe to embed in HTML. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}
