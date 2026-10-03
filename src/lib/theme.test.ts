import { describe, expect, it } from 'vitest'
import { THEMES, THEME_IDS, checkAccent, contrastRatio, pageStyle, resolveAccent, textOn } from './theme'

describe('contrast maths', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 1)
  })
})

describe.each(THEME_IDS)('theme %s', (id) => {
  const t = THEMES[id]
  it('body text passes WCAG AA (4.5:1) on background and surface', () => {
    expect(contrastRatio(t.text, t.bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(t.text, t.surface)).toBeGreaterThanOrEqual(4.5)
  })
  it('muted text passes WCAG AA on background and surface', () => {
    expect(contrastRatio(t.muted, t.bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(t.muted, t.surface)).toBeGreaterThanOrEqual(4.5)
  })
  it('its default accent passes its own safety check', () => {
    expect(checkAccent(t.defaultAccent, id)).toEqual({ ok: true })
  })
})

describe('accent safety', () => {
  it('accepts the brand ember on Paper', () => {
    expect(checkAccent('#C8421A', 'paper').ok).toBe(true)
    expect(textOn('#C8421A')).toBe('#FFFFFF')
  })
  it('rejects pale yellow on white (unreadable)', () => {
    expect(checkAccent('#FFF3B0', 'studio').ok).toBe(false)
  })
  it('rejects near-black on the Ink theme (blends in)', () => {
    expect(checkAccent('#1E2026', 'ink').ok).toBe(false)
  })
  it('rejects things that are not hex colours', () => {
    expect(checkAccent('red', 'paper').ok).toBe(false)
    expect(checkAccent('#C8421A;}', 'paper').ok).toBe(false)
  })
  it('falls back to the theme default when unsafe', () => {
    expect(resolveAccent('#FFF3B0', 'studio')).toBe(THEMES.studio.defaultAccent)
    expect(resolveAccent(null, 'ink')).toBe(THEMES.ink.defaultAccent)
    expect(resolveAccent('#c8421a', 'paper')).toBe('#C8421A')
  })
})

describe('pageStyle', () => {
  it('falls back to the theme accent when the saved accent is unreadable', () => {
    const style = pageStyle('paper', '#FAF8F5')
    expect(style['--p-accent']).toBe(THEMES.paper.defaultAccent)
  })
  it.each(THEME_IDS)('text on the accent is readable in %s', (id) => {
    const style = pageStyle(id, null)
    expect(contrastRatio(style['--p-accent']!, style['--p-on-accent']!)).toBeGreaterThanOrEqual(4.5)
  })
})
