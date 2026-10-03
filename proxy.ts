import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

// Only signed-in areas and auth routes. Public pages (bizelinks.com/username)
// never run this, so they stay fast and cacheable.
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/auth/:path*'],
}
