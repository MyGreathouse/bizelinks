import { describe, expect, it } from 'vitest'
import { validateUsername } from './username'

describe('validateUsername', () => {
  it.each(['ada', 'ada-lovelace', 'shop_42', '9lives', 'a'.repeat(30)])('accepts %s', (u) => {
    expect(validateUsername(u).ok).toBe(true)
  })
  it('lowercases and trims', () => {
    expect(validateUsername('  AdaLovelace ')).toEqual({ ok: true, username: 'adalovelace' })
  })
  it.each([
    ['', 'Choose'],
    ['ab', 'at least 3'],
    ['a'.repeat(31), 'up to 30'],
    ['-ada', 'start with'],
    ['ada lovelace', 'lowercase letters'],
    ['adá', 'lowercase letters'],
    ['ada.l', 'lowercase letters'],
  ])('rejects %j with a helpful message', (u, fragment) => {
    const r = validateUsername(u)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toContain(fragment)
  })
})
