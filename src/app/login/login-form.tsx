'use client'

import { useActionState } from 'react'
import { sendMagicLink, type LoginState } from './actions'

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, {})
  return (
    <form action={action} noValidate className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="field-label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          aria-invalid={state.error ? 'true' : undefined}
          aria-describedby={state.error ? 'email-error' : 'email-hint'}
          className="input"
        />
        {state.error ? (
          <p id="email-error" className="field-error" role="alert">
            {state.error}
          </p>
        ) : (
          <p id="email-hint" className="field-hint">
            We’ll email you a link to sign in. No password to remember.
          </p>
        )}
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? 'Sending link…' : 'Email me a sign-in link'}
      </button>
    </form>
  )
}
