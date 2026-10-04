/** The single source of truth for the username rule (matches the database CHECK). */
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{2,29}$/

export type UsernameResult = { ok: true; username: string } | { ok: false; message: string }

/**
 * Format check only. Whether a name is reserved or taken is a database question
 * (username_status), so the reserved list can grow without a redeploy.
 */
export function validateUsername(input: string): UsernameResult {
  const username = input.trim().toLowerCase()
  if (username.length === 0) return { ok: false, message: 'Choose a username for your BizeLinks address.' }
  if (username.length < 3) return { ok: false, message: 'Usernames need at least 3 characters.' }
  if (username.length > 30) return { ok: false, message: 'Usernames can be up to 30 characters.' }
  if (/^[_-]/.test(username)) return { ok: false, message: 'Usernames must start with a letter or a number.' }
  if (!USERNAME_PATTERN.test(username))
    return { ok: false, message: 'Use lowercase letters, numbers, hyphens and underscores only.' }
  return { ok: true, username }
}

export type UsernameStatus = 'available' | 'invalid' | 'reserved' | 'taken' | 'on_hold'

export const USERNAME_STATUS_MESSAGE: Record<UsernameStatus, string> = {
  available: 'That username is free.',
  invalid: 'Use 3–30 lowercase letters, numbers, hyphens or underscores.',
  reserved: 'That username is reserved. Try another.',
  taken: 'Someone already has that username. Try another.',
  on_hold: 'That username was released recently and is on hold. Try another.',
}
