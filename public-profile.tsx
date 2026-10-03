import Link from 'next/link'
import { BRAND } from '@/lib/brand'
import { groupItems, type PublicPage } from '@/lib/public-page'
import { pageStyle } from '@/lib/theme'
import { LinkList } from './link-list'
import { ProductsSection } from './product-card'
import { ProfileHeader } from './profile-header'
import { SharePanel } from './share-panel'
import { SocialLinks } from './social-links'
import { SpotlightSection } from './spotlight-section'

export interface PublicProfileProps {
  page: PublicPage
  /** Turns a stored image path into a web address (or null). */
  imageUrl: (path: string | null) => string | null
  /** Full address of this page, e.g. https://bizelinks.com/elias */
  pageUrl: string
  /** Where the QR code SVG is served from. */
  qrHref: string
  /** Where "Report this page" goes; omitted on the example page. */
  reportHref?: string
  /** Shows the strip that marks this as an example. */
  isExample?: boolean
}

/**
 * A complete public page. Server-rendered HTML with one tiny interactive island
 * (copy/share), so it is fast on any phone. Order of the page follows the
 * questions a visitor has: who is this, what matters most, what else is there.
 */
export function PublicProfile({ page, imageUrl, pageUrl, qrHref, reportHref, isExample }: PublicProfileProps) {
  const { spotlight, products, links } = groupItems(page.items)
  const name = page.display_name.trim() || `@${page.username}`
  const displayUrl = pageUrl.replace(/^https?:\/\//, '')
  const isEmpty = page.items.length === 0 && page.socials.length === 0
  const linksHeading = products.length > 0 ? (page.entity_type === 'organization' ? 'More from us' : 'More from me') : null

  return (
    <div className="bl-page" style={pageStyle(page.theme, page.accent)}>
      {isExample && (
        <div className="bl-example">
          <p className="bl-col flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
            <span>This is an example page with demonstration links.</span>
            <Link href="/login">Create your own</Link>
          </p>
        </div>
      )}

      <div className="bl-col bl-topbar">
        <SharePanel url={pageUrl} displayUrl={displayUrl} title={name} qrHref={qrHref} qrFilename={`${page.username}-bizelinks-qr.svg`} />
      </div>

      <main className="bl-col">
        <ProfileHeader page={page} avatarUrl={imageUrl(page.avatar_path)} />
        <SocialLinks socials={page.socials} name={name} />
        <SpotlightSection items={spotlight} />
        <ProductsSection items={products} imageUrl={imageUrl} />
        <LinkList items={links} heading={linksHeading} />
        {isEmpty && <p className="bl-empty">This page is just getting started. Check back soon.</p>}
      </main>

      <footer className="bl-col bl-foot">
        <Link className="bl-made" href="/">
          <svg width="16" height="16" viewBox="0 0 22 22" aria-hidden="true">
            <rect x="1" y="1" width="20" height="20" rx="6" fill="currentColor" />
            <rect x="13" y="1" width="8" height="8" rx="3" fill="var(--p-accent)" />
          </svg>
          Made with {BRAND.name}
        </Link>
        {reportHref && <Link href={reportHref} rel="nofollow">Report this page</Link>}
      </footer>
    </div>
  )
}
