import { siteUrl } from '@/lib/env'
import { getPublicPage } from '@/lib/get-public-page'
import { qrResponse } from '@/lib/qr'

export const dynamic = 'force-dynamic'

/** bizelinks.com/{username}/qr — a print-ready QR code for a published page. */
export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const page = await getPublicPage(username)
  if (!page) return new Response('Not found', { status: 404 })
  return qrResponse(`${siteUrl()}/${page.username}`, `${page.username}-bizelinks-qr.svg`)
}
