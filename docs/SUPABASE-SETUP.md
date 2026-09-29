# Supabase setup (about 15 minutes)

BizeLinks needs its **own** Supabase project. Do not reuse the LinkDesk ones.

1. supabase.com → your Risten Global organisation → **New project**. Name it `bizelinks-dev`. Region: **London (eu-west-2)**. Save the database password in your password manager. (Create `bizelinks-prod` later, before launch.)
2. **Run the database files.** Project → **SQL Editor** → New query. Paste the contents of `supabase/migrations/20260929000001_core_schema.sql` and press **Run**. Then repeat with `20260929000002_storage.sql`. Both should say "Success".
3. **Get the three settings** and put them in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project Settings → API → **Project URL**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → Project Settings → API Keys → **Publishable key** (`sb_publishable_…`)
   - `NEXT_PUBLIC_SITE_URL` → `http://localhost:3000` while developing.
   Never copy the *secret* key anywhere. BizeLinks does not use it.
4. **Fix the sign-in email link (required).** Authentication → **Email Templates** → **Magic Link**. Make the link in the body:
   `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next={{ .RedirectTo }}">Sign in to BizeLinks</a>`
   Do the same in the **Confirm signup** template using `type=signup`. Without this, the emailed link will not sign you in.
5. Authentication → **URL Configuration**: Site URL `http://localhost:3000`; add Redirect URL `http://localhost:3000/**`. (Production URLs are added in Phase 5.)
6. Authentication → **Providers → Email**: keep "Confirm email" on.

**Email limits:** Supabase's built-in email sender is for testing only (a few emails per hour). Before launch we must connect a real sender (custom SMTP). That is a Phase 5 task.
