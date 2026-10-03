import { describe, expect, it } from 'vitest'
import { DEMO_PAGE } from './demo-page'
import { jsonLdString, profileJsonLd, profileMetadata } from './seo'

const url = 'https://bizelinks.com/elias'

describe('profile metadata', () => {
  it('uses "Name | BizeLinks" and a canonical address', () => {
    const m = profileMetadata(DEMO_PAGE, url, null)
    expect(m.title).toEqual({ absolute: 'Elias Okafor | BizeLinks' })
    expect(m.alternates?.canonical).toBe(url)
  })
  it('respects the owner’s choice to stay out of search engines', () => {
    expect(profileMetadata({ ...DEMO_PAGE, is_indexable: false }, url, null).robots).toEqual({ index: false, follow: false })
    expect(profileMetadata({ ...DEMO_PAGE, is_indexable: true }, url, null).robots).toEqual({ index: true, follow: true })
  })
  it('uses the profile photo for previews when there is one', () => {
    const m = profileMetadata(DEMO_PAGE, url, 'https://img.example/a.webp')
    expect(JSON.stringify(m.openGraph)).toContain('https://img.example/a.webp')
  })
})

describe('structured data', () => {
  it('describes a person or organisation, without email or WhatsApp in sameAs', () => {
    const ld = profileJsonLd(DEMO_PAGE, url, null) as { mainEntity: { '@type': string; sameAs: string[] } }
    expect(ld.mainEntity['@type']).toBe('Person')
    expect(ld.mainEntity.sameAs.some((s) => s.startsWith('mailto:'))).toBe(false)
    const org = profileJsonLd({ ...DEMO_PAGE, entity_type: 'organization' }, url, null) as { mainEntity: { '@type': string } }
    expect(org.mainEntity['@type']).toBe('Organization')
  })
  it('cannot break out of its script tag', () => {
    const s = jsonLdString({ name: '</script><script>alert(1)</script>' })
    expect(s).not.toContain('</script>')
  })
})
