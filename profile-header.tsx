import type { PublicPage } from '@/lib/public-page'
import { initials } from '@/lib/public-page'

export function ProfileHeader({ page, avatarUrl }: { page: PublicPage; avatarUrl: string | null }) {
  const name = page.display_name.trim() || `@${page.username}`
  return (
    <header>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- images are resized at upload; Next's optimiser is off on Workers
        <img className="bl-avatar" src={avatarUrl} alt={name} width={88} height={88} fetchPriority="high" />
      ) : (
        <div className="bl-avatar" aria-hidden="true">{initials(page.display_name, page.username)}</div>
      )}
      <h1 className="bl-name">{name}</h1>
      {page.descriptor && <p className="bl-descriptor">{page.descriptor}</p>}
      {page.bio && <p className="bl-bio">{page.bio}</p>}
      {page.location && (
        <p className="bl-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          <span><span className="sr-only">Based in </span>{page.location}</span>
        </p>
      )}
    </header>
  )
}
