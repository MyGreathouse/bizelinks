/**
 * Only allow redirects to paths on BizeLinks itself. Stops "open redirect"
 * tricks like /login?next=https://evil.example or //evil.example.
 */
export function safeNextPath(next: string | null | undefined, fallback = '/dashboard'): string {
  if (!next || typeof next !== 'string') return fallback
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  if (/[\u0000-\u001f]/.test(next)) return fallback
  return next
}
