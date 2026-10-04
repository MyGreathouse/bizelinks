'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { isConfigured } from '@/lib/env'
import { createPublicClient } from '@/lib/supabase/public'
import { USERNAME_PATTERN } from '@/lib/validation/username'
import { REPORT_REASONS } from './reasons'

const ReportInput = z.object({
  username: z.string().regex(USERNAME_PATTERN),
  reason: z.enum(REPORT_REASONS.map((r) => r.id) as [string, ...string[]]),
  details: z.string().max(1000).catch(''),
})

export type ReportState = { error?: string }

export async function submitReport(_prev: ReportState, form: FormData): Promise<ReportState> {
  const parsed = ReportInput.safeParse({
    username: form.get('username'),
    reason: form.get('reason'),
    details: form.get('details') ?? '',
  })
  if (!parsed.success) return { error: 'Choose the reason that fits best, then send the report.' }
  if (!isConfigured()) return { error: 'Reports can’t be sent right now. Try again later.' }

  const { error } = await createPublicClient().rpc('submit_page_report', {
    p_username: parsed.data.username,
    p_reason: parsed.data.reason,
    p_details: parsed.data.details.trim(),
  })
  if (error) return { error: 'We couldn’t send your report. Try again in a few minutes.' }
  // Same confirmation whether or not the page exists, so reports can't be used to probe usernames.
  redirect(`/report/${parsed.data.username}?sent=1`)
}
