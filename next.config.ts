import type { NextConfig } from 'next'

/**
 * Security headers applied to every response. The public pages contain
 * user-written text, so a strict Content-Security-Policy is our second line of
 * defence behind React's automatic escaping.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Next's image optimiser needs a paid Cloudflare Images binding on Workers.
    // BizeLinks resizes images at upload time instead, so we serve them as-is.
    unoptimized: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig

// Lets `next dev` use Cloudflare bindings locally. Harmless in other environments.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()
