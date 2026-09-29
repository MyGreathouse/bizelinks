# Deploying BizeLinks on Cloudflare Workers

Status: **the Worker build and a local run are verified; nothing has been deployed.** Domain and production steps happen in Phase 5.

## What was measured (29 Sep 2026)
- Compressed Worker size: **1,776 KiB**, against Cloudflare's **3,072 KiB** free-plan limit (about 42% headroom).
- Watch this number every phase. Heavy libraries can push it over. If it ever exceeds 3 MiB, the Workers Paid plan (10 MiB, about $5/month) is the fix.
- The build uses `next build --webpack` (see `npm run build`), following current OpenNext guidance for Next.js 16.

## Commands
- `npm run cf:preview` — build and run the Worker locally.
- `npm run cf:deploy` — build and deploy (run `npx wrangler login` first).

## Settings
Runtime settings go in the Cloudflare dashboard (Workers → bizelinks → Settings → Variables), or in `.dev.vars` locally (never commit it). The three variables are the same as `.env.example`. `NEXT_PUBLIC_*` values are baked in at build time, so they must also be present in the build environment.

## Known limits on this hosting
- Next's built-in image optimiser is off (it needs a paid Cloudflare Images binding). Uploads will be resized on upload instead (Phase 3).
- Public-page caching (R2/KV) is configured in Phase 2.
