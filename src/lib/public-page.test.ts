import { describe, expect, it } from 'vitest'
import { DEMO_PAGE } from './demo-page'
import { PublicPageSchema, displayHost, groupItems, initials } from './public-page'

const base = {
  username: 'ada', display_name: 'Ada Lovelace', descriptor: '', bio: '', location: '', avatar_path: null,
  entity_type: 'person', is_indexable: true, theme: 'paper', accent: '#C8421A', updated_at: '2026-10-01T00:00:00Z',
  socials: [], items: [],
}
const item = (over: Record<string, unknown>) => ({
  id: crypto.randomUUID(), zone: 'links', kind: 'link', title: 'T', url: 'https://example.com', description: '',
  image_path: null, cta_label: null, price_label: null, badge: null, ...over,
})

describe('PublicPageSchema', () => {
  it('accepts the demo page', () => {
    expect(PublicPageSchema.safeParse(DEMO_PAGE).success).toBe(true)
  })
  it('drops items with unsafe or unknown data instead of rendering them', () => {
    const page = PublicPageSchema.parse({
      ...base,
      items: [item({ title: 'ok' }), item({ url: 'javascript:alert(1)' }), item({ zone: 'featured' })],
      socials: [{ provider: 'youtube', url: 'https://youtube.com/@ada' }, { provider: 'myspace', url: 'https://x.y' },
        { provider: 'website', url: 'javascript:alert(1)' }],
    })
    expect(page.items.map((i) => i.title)).toEqual(['ok'])
    expect(page.socials.map((s) => s.provider)).toEqual(['youtube'])
  })
  it('falls back to safe defaults for unknown theme and badge values', () => {
    const page = PublicPageSchema.parse({ ...base, theme: 'neon', items: [item({ badge: 'FREE MONEY' })] })
    expect(page.theme).toBe('paper')
    expect(page.items[0]!.badge).toBeNull()
  })
})

describe('groupItems', () => {
  it('keeps order and never shows more than three Spotlight items', () => {
    const items = [1, 2, 3, 4].map((n) => item({ zone: 'spotlight', title: `s${n}` }))
    const parsed = PublicPageSchema.parse({ ...base, items: [...items, item({ zone: 'products', title: 'p' })] })
    const g = groupItems(parsed.items)
    expect(g.spotlight.map((i) => i.title)).toEqual(['s1', 's2', 's3'])
    expect(g.products).toHaveLength(1)
    expect(g.links).toHaveLength(0)
  })
})

describe('display helpers', () => {
  it('shows a clean domain for each link', () => {
    expect(displayHost('https://www.youtube.com/watch?v=1')).toBe('youtube.com')
    expect(displayHost('not a url')).toBe('')
  })
  it('makes initials for profiles without a photo', () => {
    expect(initials('Elias Okafor', 'elias')).toBe('EO')
    expect(initials('', 'studio9')).toBe('ST')
    expect(initials('Madonna', 'm')).toBe('MA')
  })
})
