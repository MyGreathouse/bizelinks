'use client'

import { useEffect, useState } from 'react'

/**
 * The only JavaScript on a public page: copy the address, and open the phone's
 * own share sheet where the browser supports it. Without JavaScript the address
 * is still shown as selectable text and the QR code still works.
 */
export function ShareActions({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    // Read after hydration so server and browser render the same markup first.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked (e.g. insecure context); the URL text stays selectable.
    }
  }

  return (
    <div className="bl-share-actions">
      <button type="button" className="bl-share-btn" onClick={copy}>
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      {canShare && (
        <button
          type="button"
          className="bl-share-btn"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
        >
          Share to an app
        </button>
      )}
      <span className="sr-only" role="status">{copied ? 'Link copied to clipboard' : ''}</span>
    </div>
  )
}
