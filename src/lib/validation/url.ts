/**
 * Outbound link safety. Every destination a user saves passes through
 * validateTargetUrl — the database has a matching (simpler) CHECK as a backstop.
 *
 * Allowed: http and https only. Rejected: javascript:, data:, file:, etc.,
 * embedded passwords, local/private network addresses, and oversized URLs.
 */
import { LIMITS } from '@/lib/plans'

export type UrlResult = { ok: true; url: string } | { ok: false; message: string }

/** Plug-in point for a malware/phishing reputation service (e.g. Google Safe Browsing) later. */
export interface UrlReputationProvider {
  isUnsafe(url: string): Promise<boolean>
}

const PRIVATE_HOST = [
  /^localhost$/i,
  /\.localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /^127\./,
  /^10\./,
  /^0\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^\[?::1\]?$/,
  /^\[?f[cd][0-9a-f]{2}:/i,
  /^\[?fe80:/i,
]

export function validateTargetUrl(raw: string): UrlResult {
  let input = raw.trim()
  if (input.length === 0) return { ok: false, message: 'Add the web address this should open.' }

  // People often paste "example.com" — assume https for bare domains only.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(input)) input = `https://${input}`

  let parsed: URL
  try {
    parsed = new URL(input)
  } catch {
    return { ok: false, message: 'That doesn’t look like a web address. Check it and try again.' }
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')
    return { ok: false, message: 'Only web addresses starting with https:// or http:// can be added.' }
  if (parsed.username || parsed.password)
    return { ok: false, message: 'Remove the username or password from the address.' }

  const host = parsed.hostname
  if (!host.includes('.') || host.endsWith('.'))
    return { ok: false, message: 'Use a full web address, such as example.com.' }
  if (PRIVATE_HOST.some((re) => re.test(host)))
    return { ok: false, message: 'Private or local network addresses can’t be linked.' }

  const url = parsed.toString()
  if (url.length > LIMITS.urlMax) return { ok: false, message: 'That address is too long.' }
  return { ok: true, url }
}
