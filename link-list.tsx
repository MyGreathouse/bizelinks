import type { PageItem } from '@/lib/public-page'
import { displayHost } from '@/lib/public-page'

/** Ordinary links. Each shows its destination's domain, so visitors know where they're going. */
export function LinkList({ items, heading }: { items: PageItem[]; heading: string | null }) {
  if (items.length === 0) return null
  return (
    <section className={heading ? 'bl-section' : 'bl-section mt-6!'} aria-label={heading ?? 'Links'}>
      {heading && <h2 className="bl-section-title">{heading}</h2>}
      <ul className="bl-links">
        {items.map((item) => (
          <li key={item.id}>
            <a className="bl-link" href={item.url}>
              <span className="bl-link-title">{item.title}</span>
              <span className="bl-link-host">{displayHost(item.url)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
