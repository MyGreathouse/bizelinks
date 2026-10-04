import Link from 'next/link'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Risten Global Ltd. BizeLinks is a Risten Global product.</p>
        <nav aria-label="Legal and support" className="flex flex-wrap gap-x-5 gap-y-2">
          {/* Legal pages are written in Phase 5, before launch. */}
          <Link className="hover:text-ink" href="/privacy">Privacy</Link>
          <Link className="hover:text-ink" href="/terms">Terms</Link>
          <Link className="hover:text-ink" href="/support">Support</Link>
        </nav>
      </div>
    </footer>
  )
}
