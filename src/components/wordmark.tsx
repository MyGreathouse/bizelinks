import Link from 'next/link'

/** The BizeLinks wordmark. A small ember tab marks the spot where a link "clips" on. */
export function Wordmark({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-md" aria-label="BizeLinks home">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <rect x="1" y="1" width="20" height="20" rx="6" fill="var(--color-ink)" />
        <rect x="7" y="6" width="8" height="10" rx="2.5" fill="none" stroke="var(--color-canvas)" strokeWidth="2" />
        <rect x="13" y="1" width="8" height="8" rx="3" fill="var(--color-ember)" />
      </svg>
      <span className="font-display text-[1.375rem] font-semibold tracking-[-0.02em]">BizeLinks</span>
    </Link>
  )
}
