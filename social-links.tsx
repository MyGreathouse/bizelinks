import type { SocialLink } from '@/lib/public-page'
import { SOCIAL_LABEL } from '@/lib/socials'

export function SocialLinks({ socials, name }: { socials: SocialLink[]; name: string }) {
  if (socials.length === 0) return null
  return (
    <nav aria-label={`${name} elsewhere`}>
      <ul className="bl-socials">
        {socials.map((s) => (
          <li key={s.provider}>
            <a className="bl-chip" href={s.url} rel="me noopener">
              {SOCIAL_LABEL[s.provider]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
