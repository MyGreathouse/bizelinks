import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { safeNextPath } from '@/lib/safe-redirect'
import { createClient } from '@/lib/supabase/server'

const TYPES: EmailOtpType[] = ['magiclink', 'signup', 'email', 'recovery', 'invite', 'email_change']

/**
 * Where the sign-in email lands. Uses Supabase's token-hash method, which works
 * even if the email is opened in a different browser or app than the one used
 * to request it (common on phones).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeNextPath(searchParams.get('next'))

  if (tokenHash && type && TYPES.includes(type)) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) return NextResponse.redirect(new URL(next, origin))
  }
  return NextResponse.redirect(new URL('/login?error=link', origin))
}
