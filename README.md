# BizeLinks

**Your links. Your brand. One page.** — a global link-in-bio platform by Risten Global Ltd.
Live address (once deployed): https://bizelinks.com

BizeLinks is a **separate product from LinkDesk**. Nothing here shares code, accounts or roadmap with it.

## Status: Phase 1 (Foundation)

| Built and tested | Not built yet |
|---|---|
| Design system, home page, not-found page | Public user pages (Phase 2) |
| Database + security rules (41 automated checks) | Marketing site sections (Phase 2) |
| Passwordless email sign-in (code written, not yet tried against a real Supabase project) | Profile/link editor, publish (Phase 3) |
| Cloudflare Workers build (runs locally) | Analytics dashboard, hardening (Phase 4) |
| Image-storage rules (2 MB, no SVG) | Legal pages, launch checklist (Phase 5) |

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

## Checks (run before every push)

`npm run check` runs lint, type check, unit tests and a production build.
`npm run test:db` runs the database security tests (needs PostgreSQL installed; the GitHub CI runs them automatically).

## Folders

- `src/app` — pages and routes · `src/components` — shared UI · `src/lib` — rules, validation, Supabase helpers
- `supabase/migrations` — the database, in order · `supabase/tests` — database security tests
- `docs` — setup guides and recorded decisions
