import localFont from 'next/font/local'

// Fonts are bundled with the app (SIL Open Font Licence, see src/fonts/),
// so there are no third-party font requests and no layout shift.
export const newsreader = localFont({
  src: [
    { path: '../fonts/newsreader-latin-wght-normal.woff2', weight: '200 800', style: 'normal' },
    { path: '../fonts/newsreader-latin-ext-wght-normal.woff2', weight: '200 800', style: 'normal' },
  ],
  variable: '--font-newsreader',
  display: 'swap',
})

export const instrument = localFont({
  src: [
    { path: '../fonts/instrument-sans-latin-wght-normal.woff2', weight: '400 700', style: 'normal' },
    { path: '../fonts/instrument-sans-latin-ext-wght-normal.woff2', weight: '400 700', style: 'normal' },
  ],
  variable: '--font-instrument',
  display: 'swap',
})
