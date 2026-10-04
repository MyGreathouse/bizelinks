import type { Metadata, Viewport } from 'next'
import { PublicProfile } from '@/components/public/public-profile'
import { BRAND } from '@/lib/brand'
import { DEMO_PAGE } from '@/lib/demo-page'
import { siteUrl } from '@/lib/env'
import { THEMES } from '@/lib/theme'

export const metadata: Metadata = {
  title: { absolute: `Example page | ${BRAND.name}` },
  description: `See what a ${BRAND.name} page looks like: a Spotlight for what matters most, products, links and socials in one place.`,
  alternates: { canonical: `${siteUrl()}/example` },
  openGraph: { images: ['/og-default.png'] },
}

export const viewport: Viewport = { themeColor: THEMES[DEMO_PAGE.theme].bg }

export default function ExamplePage() {
  return (
    <PublicProfile
      page={DEMO_PAGE}
      imageUrl={() => null}
      pageUrl={`${siteUrl()}/example`}
      qrHref="/example/qr"
      isExample
    />
  )
}
