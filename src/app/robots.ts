import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/env'

// Private areas are never crawled. Public user pages are added to the sitemap in Phase 2.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/auth/', '/login'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
