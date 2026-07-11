# Private Dashboard

A single private hub for managing both BayPinned sites (`map.board` and
`baypinnedmap1`) from one place: quick links to add content, links to
each site's own admin, and two live views backed by data that already
exists in map.board's Supabase project — event reports and a business
(vendor) list.

## Setup

1. `js/site-config.js` — already filled in with both sites' live GitHub
   Pages URLs (confirmed reachable). If either site ever moves host,
   update the URLs here.
2. Sign in with the one admin account created in map.board's Supabase
   project (Authentication → Users → Add user, see
   `map.board/supabase/README.md` step 4) — this dashboard reuses that
   project's URL/anon key (`shared/supabase-config.js`), so it's one
   login for both. Vendors/organizers never need an account — they
   submit pins/flyers/listings anonymously and you approve/reject them
   here or in map.board's own admin.

## What's live vs. not yet

- **Event Reports** and **Business List** read map.board's `events` and
  `vendors` Supabase tables directly — same data map.board's own
  `/admin/` uses, same RLS. Approving/rejecting a business here is a
  real, live change.
- **Add a Pin (BayPinned)** links to map.board's `/pins/` page, which
  already writes straight to Supabase — live.
- **Add a Flyer (BayPinned)** links to map.board's `/board/` page, which
  still saves to that browser's local storage (map.board hasn't
  migrated that page to Supabase yet — see its own README). So a flyer
  added there won't show up in Event Reports until that migration
  happens.
- **baypinnedmap1** (BayPinned SJ) has no backend at all yet — its admin
  is an export/paste-to-file workflow. This dashboard just links out to
  it as-is; wiring it onto the same Supabase project (so edits here
  become instantly live there too) is a natural next step whenever
  you're ready for it.

## Open assumption

"Business list" is built as the vendors list (map.board's `vendors`
table) on the reading that "bus list" meant "business list" — there's no
bus/transit concept anywhere in either site's code. Flag it if that's
wrong and it means something else.
