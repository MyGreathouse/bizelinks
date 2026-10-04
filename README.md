# BizeLinks

**Your business. One smart link.** A global link-in-bio platform by Risten Global Ltd.
Live address (once deployed): https://bizelinks.com

BizeLinks is a **separate product from LinkDesk**. Nothing here shares code, accounts or roadmap with it.

## Status: Phase 2 (Public pages)

| Built and tested | Not built yet |
|---|---|
| Public pages at bizelinks.com/{username}: profile, socials, Spotlight (3), products, links | Profile/link editor, onboarding, publish button (Phase 3) |
| Four themes with automatic contrast protection | Analytics dashboard, click counting, rate limits, bot check (Phase 4) |
| Share panel, copy link, downloadable QR code (SVG) | Security headers policy (CSP), legal pages, launch checklist (Phase 5) |
| Search and share previews, opt-out of search engines, sitemap | Custom domains, payments, AI suggestions (after launch) |
| Example page at /example; home page with live preview | |
| Report-a-page form | |
| Database + security rules (59 automated checks); 80 unit tests | |
| Passwordless sign-in (code written, not yet tried against a real Supabase project) | |

## Stack (in plain English)

- **Next.js + TypeScript** — the website framework.
- **Tailwind CSS** — styling, driven by design tokens in `src/app/globals.css`.
- **Supabase** — sign-in, the database and image storage (London region recommended).
- **Cloudflare Workers** — hosting, via the OpenNext adapter. The free plan works for now (see `docs/DEPLOY-CLOUDFLARE.md`).
- **Zod** — checks everything users type before it is saved.

## Running it on your Windows computer

1. Install Node.js 22 LTS from nodejs.org.
2. Open this folder in a terminal and run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the three values (see `docs/SUPABASE-SETUP.md`).
4. Run `npm run dev` and open http://localhost:3000.

## Database updates

Run the files in `supabase/migrations` **in order** in the Supabase SQL editor. Phase 2 adds
`20261002000003_public_pages.sql`. Run it once, after migrations 1 and 2.

## Checks (run before every push)

`npm run check` runs lint, type check, unit tests and a production build.
`npm run test:db` runs the database security tests (needs PostgreSQL installed; the GitHub CI runs them automatically).

## Folders

- `src/app` — pages and routes · `src/components` — shared UI · `src/lib` — rules, validation, Supabase helpers
- `supabase/migrations` — the database, in order · `supabase/tests` — database security tests
- `src/components/public` — the public page building blocks
- `docs` — setup guides and recorded decisions
