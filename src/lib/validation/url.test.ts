import { describe, expect, it } from 'vitest'
import { validateTargetUrl } from './url'

describe('validateTargetUrl', () => {
  it.each([
    ['https://example.com', 'https://example.com/'],
    ['http://example.com/path?q=1', 'http://example.com/path?q=1'],
    ['example.com/shop', 'https://example.com/shop'],
    ['https://münchen.de', 'https://xn--mnchen-3ya.de/'],
  ])('accepts %s', (input, expected) => {
    expect(validateTargetUrl(input)).toEqual({ ok: true, url: expected })
  })

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'file:///etc/passwd',
    'vbscript:msgbox',
    'ftp://example.com',
    'mailto:someone@example.com',
    'https://user:pass@example.com',
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://192.168.1.1',
    'http://10.0.0.5',
    'http://169.254.169.254/latest/meta-data',
    'http://[::1]/',
    'https://intranet',
    '',
    '   ',
    `https://example.com/${'a'.repeat(2100)}`,
  ])('rejects %j', (input) => {
    expect(validateTargetUrl(input).ok).toBe(false)
  })
})
