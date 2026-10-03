import { BADGE_LABEL, DEFAULT_CTA } from '@/lib/plans'
import type { PageItem } from '@/lib/public-page'

export function ProductCard({ item, imageUrl }: { item: PageItem; imageUrl: string | null }) {
  return (
    <a className="bl-product" href={item.url}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- see ProfileHeader
        <img className="bl-thumb" src={imageUrl} alt="" width={84} height={84} loading="lazy" decoding="async" />
      ) : (
        <span className="bl-thumb" aria-hidden="true">{item.title.length > 28 ? `${item.title.slice(0, 26)}…` : item.title}</span>
      )}
      <span className="min-w-0">
        {item.badge && <span className="bl-badge bl-badge-quiet">{BADGE_LABEL[item.badge]}</span>}
        <span className="bl-product-title" style={{ display: 'block' }}>{item.title}</span>
        {item.description && <span className="bl-product-desc" style={{ display: 'block' }}>{item.description}</span>}
        <span className="bl-product-foot">
          {item.price_label ? <span className="bl-price">{item.price_label}</span> : <span />}
          <span className="bl-product-cta" aria-hidden="true">{item.cta_label || DEFAULT_CTA[item.kind]}</span>
        </span>
      </span>
    </a>
  )
}

export function ProductsSection({ items, imageUrl }: { items: PageItem[]; imageUrl: (p: string | null) => string | null }) {
  if (items.length === 0) return null
  return (
    <section className="bl-section" aria-labelledby="bl-products-title">
      <h2 id="bl-products-title" className="bl-section-title">Products</h2>
      <ul className="bl-products">
        {items.map((item) => (
          <li key={item.id}><ProductCard item={item} imageUrl={imageUrl(item.image_path)} /></li>
        ))}
      </ul>
    </section>
  )
}
