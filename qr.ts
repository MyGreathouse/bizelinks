import 'server-only'
import qrcode from 'qrcode-generator'

/**
 * A QR code for a page address, as a standalone SVG file. Black on white with a
 * quiet zone, at error-correction level M — the safest choice for printing on
 * business cards, flyers and screens.
 */
export function qrSvg(text: string): string {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  const count = qr.getModuleCount()
  const quiet = 4
  const size = count + quiet * 2
  let d = ''
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) d += `M${c + quiet} ${r + quiet}h1v1h-1z`
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="1024" height="1024" shape-rendering="crispEdges">` +
    `<rect width="${size}" height="${size}" fill="#FFFFFF"/><path d="${d}" fill="#000000"/></svg>`
  )
}

export function qrResponse(text: string, filename: string): Response {
  return new Response(qrSvg(text), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
