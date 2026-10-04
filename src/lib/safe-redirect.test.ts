import { describe, expect, it } from 'vitest'
import { safeNextPath } from './safe-redirect'

describe('safeNextPath', () => {
  it.each(['/dashboard', '/dashboard/links?x=1'])('keeps %s', (p) => expect(safeNextPath(p)).toBe(p))
  it.each(['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '', null, undefined, '/ok\nSet-Cookie:x'])(
    'rejects %j',
    (p) => expect(safeNextPath(p as string)).toBe('/dashboard'),
  )
})
