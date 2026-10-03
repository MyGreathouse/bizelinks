import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/env'

// Private areas and report forms are never crawled. Public pages that opt in are in the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/auth/', '/login', '/report/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
