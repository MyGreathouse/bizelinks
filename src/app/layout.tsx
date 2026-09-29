import type { Metadata, Viewport } from 'next'
import { instrument, newsreader } from './fonts'
import { siteUrl } from '@/lib/env'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'BizeLinks — Your links. Your brand. One page.', template: '%s · BizeLinks' },
  description:
    'Bring your content, products, services and favourite destinations together in one polished page you can share anywhere.',
  applicationName: 'BizeLinks',
  openGraph: { siteName: 'BizeLinks', type: 'website' },
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
