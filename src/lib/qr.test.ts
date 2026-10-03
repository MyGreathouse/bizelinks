import { describe, expect, it } from 'vitest'
import { qrSvg } from './qr'

describe('qrSvg', () => {
  it('produces a black-on-white SVG with a quiet zone', () => {
    const svg = qrSvg('https://bizelinks.com/elias')
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('fill="#FFFFFF"')
    expect(svg).toContain('M4 4h1v1h-1z') // first finder-pattern module sits inside the 4-module margin
  })
})
