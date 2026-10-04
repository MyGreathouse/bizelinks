/**
 * Public-page themes and the accent-colour safety check.
 *
 * Users choose a theme and an accent colour. The accent fills buttons and marks
 * the spotlight. To stop anyone making an unreadable page, an accent is only
 * accepted if (a) button text on it reaches WCAG AA 4.5:1, and (b) the accent
 * itself stands out from the page background at 3:1 (WCAG non-text contrast).
 * Otherwise the theme's own default accent is used.
 */
export const THEME_IDS = ['paper', 'studio', 'ink', 'lagoon'] as const
export type ThemeId = (typeof THEME_IDS)[number]

export interface Theme {
  id: ThemeId
  name: string
  description: string
  bg: string
  surface: string
  text: string
  muted: string
  line: string
  defaultAccent: string
  /** Typeface for names and titles: the Newsreader serif, or the Instrument sans. */
  display: 'serif' | 'sans'
}

export const THEMES: Record<ThemeId, Theme> = {
  paper: {
    id: 'paper', name: 'Paper', description: 'Warm and bookish. The BizeLinks house style.',
    bg: '#FAF8F5', surface: '#FFFFFF', text: '#16181D', muted: '#5A5E68', line: '#E4E0D8',
    defaultAccent: '#C8421A', display: 'serif',
  },
  studio: {
    id: 'studio', name: 'Studio', description: 'Crisp white. Lets photos and products lead.',
    bg: '#FFFFFF', surface: '#F3F4F6', text: '#1B1D22', muted: '#565B66', line: '#E2E4E8',
    defaultAccent: '#0F4C5C', display: 'sans',
  },
  ink: {
    id: 'ink', name: 'Ink', description: 'Dark and focused. Good for music and night-time brands.',
    bg: '#16181D', surface: '#22252C', text: '#F3F1EC', muted: '#A9ADB6', line: '#343841',
    defaultAccent: '#F08A63', display: 'serif',
  },
  lagoon: {
    id: 'lagoon', name: 'Lagoon', description: 'Deep teal. Calm and confident.',
    bg: '#0F4C5C', surface: '#145A6B', text: '#F4F7F6', muted: '#BCD5D8', line: '#2D6B7A',
    defaultAccent: '#F2C38B', display: 'sans',
  },
}

export const INK = '#16181D'
export const WHITE = '#FFFFFF'

export function isThemeId(v: string): v is ThemeId {
  return (THEME_IDS as readonly string[]).includes(v)
}

const HEX = /^#[0-9a-f]{6}$/i

function channel(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  if (!HEX.test(hex)) throw new Error(`Not a 6-digit hex colour: ${hex}`)
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** Text colour (ink or white) that reads best on a given fill. */
export function textOn(fill: string): string {
  return contrastRatio(fill, WHITE) >= contrastRatio(fill, INK) ? WHITE : INK
}

export type AccentCheck = { ok: true } | { ok: false; message: string }

export function checkAccent(accent: string, themeId: ThemeId): AccentCheck {
  if (!HEX.test(accent)) return { ok: false, message: 'Pick a colour, or enter a hex value like #C8421A.' }
  const theme = THEMES[themeId]
  if (contrastRatio(accent, textOn(accent)) < 4.5)
    return { ok: false, message: 'Button text would be hard to read on this colour. Try a darker or lighter shade.' }
  if (contrastRatio(accent, theme.bg) < 3)
    return { ok: false, message: `This colour blends into the ${theme.name} background. Try a stronger shade.` }
  return { ok: true }
}

/** The accent actually used on the page: the user's if safe, else the theme default. */
export function resolveAccent(accent: string | null | undefined, themeId: ThemeId): string {
  const theme = THEMES[themeId]
  return accent && checkAccent(accent, themeId).ok ? accent.toUpperCase() : theme.defaultAccent
}

/**
 * CSS custom properties for a public page. Every colour on the page comes from
 * these, so a theme switch is one object change and never a new stylesheet.
 */
export function pageStyle(themeId: ThemeId, accent: string | null | undefined): Record<string, string> {
  const t = THEMES[themeId]
  const a = resolveAccent(accent, themeId)
  return {
    '--p-bg': t.bg,
    '--p-surface': t.surface,
    '--p-text': t.text,
    '--p-muted': t.muted,
    '--p-line': t.line,
    '--p-accent': a,
    '--p-on-accent': textOn(a),
    '--p-display': t.display === 'serif' ? 'var(--font-display)' : 'var(--font-sans)',
  }
}
