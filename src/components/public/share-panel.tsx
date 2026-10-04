import { ShareActions } from './share-actions'

export function SharePanel({ url, displayUrl, title, qrHref, qrFilename }: {
  url: string
  displayUrl: string
  title: string
  qrHref: string
  qrFilename: string
}) {
  return (
    <details className="bl-share">
      <summary>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
        </svg>
        Share
      </summary>
      <div className="bl-share-panel">
        <p className="bl-share-url">{displayUrl}</p>
        <ShareActions url={url} title={title} />
        <div className="bl-qr">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small SVG served by our own route */}
          <img src={qrHref} alt={`QR code that opens ${displayUrl}`} width={96} height={96} loading="lazy" />
          <p>
            Scan to open this page.{' '}
            <a href={qrHref} download={qrFilename}>Download QR code</a> for print or slides.
          </p>
        </div>
      </div>
    </details>
  )
}
