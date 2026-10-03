import { siteUrl } from '@/lib/env'
import { qrResponse } from '@/lib/qr'

export function GET() {
  return qrResponse(`${siteUrl()}/example`, 'example-bizelinks-qr.svg')
}
