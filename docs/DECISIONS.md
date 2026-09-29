# Decisions log

| # | Decision | Why |
|---|---|---|
| D-01 | BizeLinks is a new project, separate from LinkDesk | Owner decision, 29 Sep 2026. Proven ideas carried over; no code was. |
| D-02 | Open sign-ups from day one | Owner decision. Moves abuse protection (bot check, rate limits, report link) up the priority list. |
| D-03 | Hosting on Cloudflare Workers (OpenNext) | Owner decision. Free plan fits today (1,776 of 3,072 KiB). |
| D-04 | Passwordless email sign-in first | No passwords to leak or reset. Google sign-in can be added later. |
| D-05 | No Supabase secret key in the app | Privileged work happens inside the database behind security rules. Nothing to leak. |
| D-06 | Placement decides prominence: zone = spotlight / featured / links | Any item type can go anywhere; new section types later need no new tables. |
| D-07 | Analytics = daily counters only | No IP, user agent or visitor ID stored. Counts are approximate (bots, prefetching). |
| D-08 | SVG uploads banned | SVG files can carry scripts. |
| D-09 | Released usernames held 30 days; max 3 changes per 30 days | Stops name-squatting and impersonation. |
| D-10 | Fonts bundled locally (Newsreader, Instrument Sans; SIL OFL) | No third-party requests; no layout shift. |
