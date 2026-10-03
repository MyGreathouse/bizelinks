import { BADGE_LABEL, DEFAULT_CTA } from '@/lib/plans'
import type { PageItem } from '@/lib/public-page'

/**
 * The owner's top priorities. The first item is the one solid block of accent
 * on the page; items two and three are outlined in it. Up to three, in the
 * order the owner chose.
 */
export function SpotlightSection({ items }: { items: PageItem[] }) {
  if (items.length === 0) return null
  const [lead, ...rest] = items as [PageItem, ...PageItem[]]
  return (
    <section className="bl-spotlight" aria-label="Spotlight">
      <a className="bl-lead" href={lead.url}>
        {lead.badge && <span className="bl-badge">{BADGE_LABEL[lead.badge]}</span>}
        <span className="bl-lead-title" style={{ display: 'block' }}>{lead.title}</span>
        {lead.description && <span className="bl-lead-desc" style={{ display: 'block' }}>{lead.description}</span>}
        <span className="bl-lead-cta" aria-hidden="true">{lead.cta_label || DEFAULT_CTA[lead.kind]}</span>
      </a>
      {rest.map((item) => (
        <a key={item.id} className="bl-pin" href={item.url}>
          <span className="min-w-0">
            {item.badge && <span className="bl-badge bl-badge-quiet">{BADGE_LABEL[item.badge]}</span>}
            <span className="bl-pin-title" style={{ display: 'block' }}>{item.title}</span>
            {item.description && <span className="bl-pin-desc" style={{ display: 'block' }}>{item.description}</span>}
          </span>
          <span className="bl-pin-cta" aria-hidden="true">{item.cta_label || DEFAULT_CTA[item.kind]}</span>
        </a>
      ))}
    </section>
  )
}
