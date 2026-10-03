'use client'

import { useActionState } from 'react'
import { submitReport, type ReportState } from './actions'
import { REPORT_REASONS } from './reasons'

export function ReportForm({ username }: { username: string }) {
  const [state, action, pending] = useActionState<ReportState, FormData>(submitReport, {})
  return (
    <form action={action} className="mt-8 space-y-6">
      <input type="hidden" name="username" value={username} />
      <fieldset>
        <legend className="field-label">What’s wrong with this page?</legend>
        <div className="mt-2 grid gap-2">
          {REPORT_REASONS.map((r) => (
            <label key={r.id} className="flex cursor-pointer gap-3 rounded-[var(--radius-row)] border border-line bg-surface p-3.5 has-[:checked]:border-teal has-[:checked]:bg-teal-wash">
              <input type="radio" name="reason" value={r.id} required className="mt-1 accent-[var(--color-teal)]" />
              <span>
                <span className="block font-semibold">{r.label}</span>
                <span className="block text-sm text-ink-muted">{r.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="details" className="field-label">Details (optional)</label>
        <textarea id="details" name="details" maxLength={1000} rows={4} className="input" placeholder="Which link is the problem, and why?" />
        <p className="field-hint">Don’t include your own personal details. We don’t need them to review a report.</p>
      </div>
      {state.error && <p className="notice notice-error" role="alert">{state.error}</p>}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Sending…' : 'Send report'}
      </button>
    </form>
  )
}
