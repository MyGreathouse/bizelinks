import { BRAND } from '@/lib/brand'

/**
 * The core action of the product, shown as the address people will share.
 * A plain HTML form (GET → /login) so it works before any JavaScript loads.
 */
export function ClaimBar({ size = 'lg' }: { size?: 'lg' | 'md' }) {
  const big = size === 'lg'
  return (
    <form action="/login" method="get" className="w-full max-w-xl">
      <label htmlFor="claim" className="sr-only">
        Choose your BizeLinks username
      </label>
      <div
        className={`flex flex-col gap-2 rounded-[20px] border border-line-strong bg-surface p-2 shadow-[var(--shadow-lift)] focus-within:border-teal sm:flex-row sm:items-center sm:rounded-[var(--radius-pill)]`}
      >
        <div className="flex min-w-0 flex-1 items-baseline pl-3 sm:pl-4">
          <span className={`font-display ${big ? 'text-xl sm:text-2xl' : 'text-lg'} shrink-0 text-ink-muted`}>
            bizelinks.com/
          </span>
          <input
            id="claim"
            name="claim"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            inputMode="url"
            maxLength={30}
            pattern="[a-zA-Z0-9][a-zA-Z0-9_\-]{2,29}"
            title="3–30 letters, numbers, hyphens or underscores"
            placeholder="yourname"
            className={`font-display ${big ? 'text-xl sm:text-2xl' : 'text-lg'} min-w-0 flex-1 bg-transparent py-2 text-ink outline-none placeholder:text-[#7A7E87]`}
          />
        </div>
        <button type="submit" className="btn btn-primary h-12 px-6 text-base">
          Create your {BRAND.name}
        </button>
      </div>
    </form>
  )
}
