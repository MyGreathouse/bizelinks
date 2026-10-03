import type { Metadata, Viewport } from 'next'
import { instrument, newsreader } from './fonts'
import { BRAND } from '@/lib/brand'
import { siteUrl } from '@/lib/env'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${BRAND.name}: ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description: BRAND.summary,
  applicationName: BRAND.name,
  openGraph: { siteName: BRAND.name, type: 'website', images: ['/og-default.png'] },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  themeColor: '#FAF8F5',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${instrument.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  )
}
