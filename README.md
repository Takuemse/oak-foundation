# OAK Zimbabwe Partner Gathering — Registration & Attendance Platform

Live event platform for the **OAK Zimbabwe Foundation Partner Gathering**
(Cresta Lodge, Harare — 9–11 November 2026, ~110 attendees).

Handles: attendee registration with QR entry passes, camera-based daily
check-in with live headcount, the event programme, and the partner
directory.

---

## Tech Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — PostgreSQL database, authentication, storage (local CLI + cloud)
- **qrcode.react** — QR code generation (registration entry pass)
- **html5-qrcode** — browser-camera QR scanning (check-in)
- **Vercel** — deployment target

---

## Prerequisites

- Node.js 18+
- Docker Desktop (required to run Supabase locally)
- npm

---

## First-Time Setup

```bash
# 1. Clone and install
git clone https://github.com/Takuemse/oak-foundation.git
cd oak-foundation
npm install

# 2. Start Supabase locally (requires Docker running)
npx supabase start
```

`supabase start` prints local credentials — copy the **Publishable** key.

```bash
# 3. Create your environment file
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<paste the Publishable key from step 2>
```

**Never** put the Secret key in `NEXT_PUBLIC_...` — it must never reach the browser.

```bash
# 4. Build the database from migrations + seed data
npx supabase db reset
```

This creates all tables, security policies, functions, and seeds:
- A local test admin (see **Test Admin Login** below)
- Day 1's full programme schedule (Days 2–3 are placeholders pending
  confirmed content from the coordination team)
- The 8 partner organizations shown in the Figma reference

```bash
# 5. Run the app
npm run dev
```

Visit `http://localhost:3000`.

---

## Test Admin Login

A test admin is created automatically by `supabase/seed.sql` every time you
run `db reset` — this is why the admin account never disappears when you
rebuild the database, unlike anything you create by hand in Studio.

Email: admin@oak-test.local
Password: OakAdmin123!


**This is local-dev-only.** Real coordination-team admin accounts must be
created separately for the production Supabase project — never reuse this
password anywhere real.

---

## Project Structure

oak-foundation/
├── app/
│ ├── register/ Public registration form + QR entry pass
│ ├── programme/ Public programme schedule (Day 1/2/3 tabs)
│ ├── partners/ Public partner directory
│ ├── admin/
│ │ ├── login/ Admin sign-in
│ │ ├── check-in/ Camera QR scanner + manual entry
│ │ └── attendance/ Live headcount dashboard
│ ├── api/
│ │ ├── register/ POST — creates attendee, returns QR token only
│ │ ├── check-in/ POST — admin-only, records attendance
│ │ ├── attendance/ GET — admin-only, headcount summary
│ │ ├── programme/ GET — public
│ │ └── partners/ GET — public
│ └── lib/superbase/ Supabase client helpers (see note below)
│ ├── server.ts Plain anon client — public reads/writes
│ ├── browser.ts Browser client — used by login page
│ └── server-auth.ts Cookie-aware client — used by admin-only routes
├── proxy.ts Session refresh + /admin/* route protection
├── supabase/
│ ├── migrations/ Git-tracked schema history (apply in order)
│ └── seed.sql Local dev-only: test admin user
└── .env.local Not committed — see Environment Variables


> **Note on folder naming:** `app/lib/superbase/` is spelled `superbase`,
> not `supabase` — this was a typo introduced early on and kept
> consistent throughout the codebase rather than fixed mid-sprint, since
> a rename would have touched every import across the project under a
> tight deadline. If renaming this later, update every import in
> `app/api/*/route.ts` and every admin page.

---

## Environment Variables

| Variable | Where used | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Safe to expose |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client + server | Safe to expose — respects RLS |
| `SUPABASE_SECRET_KEY` | *Not currently used* | If ever needed server-side, **never** prefix with `NEXT_PUBLIC_` |

See `.env.example` for the template.

---

## Database & Migrations

This project uses the **Supabase CLI local migration workflow** — schema
changes are Git-tracked SQL files in `supabase/migrations/`, applied in
timestamp order. This makes the database fully reproducible for every
developer and for the eventual production deploy.

**Rules the team follows:**

1. Never edit a migration that's already been applied and shared —
   create a new one instead.
2. Never make schema changes directly against production.
3. Every schema change: write migration → test locally → commit to Git.
4. After pulling a teammate's changes: `git pull` then `npx supabase db reset`.
5. Before pushing to a remote/production Supabase project:
   `npx supabase migration list`, then `npx supabase db push`.

**Create a new migration:**
```bash
npx supabase migration new <descriptive_name>
```

**Rebuild the local database from scratch:**
```bash
npx supabase db reset
```

### Migration history (in order)

| File | What it does |
|---|---|
| `enable_extensions` | Enables `pgcrypto` (required for `gen_random_uuid()` on fresh cloud projects) |
| `initial_schema` | Core tables: organizations, attendees, attendance, programme, documentation |
| `admin_security` | `admin_users` table, RLS enabled on all tables, `is_admin()` function |
| `rls_policies` | Public read policies + admin-only policies for sensitive tables |
| `registration_function` | `register_attendee()` — validates + creates attendee, generates QR token |
| `fix_registration_function` | Fixes an ambiguous column reference bug in the above |
| `check_in_function` | `check_in_attendee()` (duplicate-safe per day) + `get_attendance_summary()` |
| `secure_registration_function` | Explicit execute grants on `register_attendee` (anon + authenticated only) |
| `attendee_organization_text_fields` | Adds free-text `organization_name` / `sub_partner` to attendees |
| `register_attendee_org_text` | Updates `register_attendee()` to accept the new text fields |
| `programme_sessions_richer_fields` (20260909113000) | Adds `category`, `presenter_name`, `presenter_org`, `is_featured` to `programme_sessions` |
| `seed_programme` | Day 1 full schedule; Day 2/3 placeholders |
| `seed_partners` | The 8 partner organizations from the Figma reference |
| `storage_buckets` | Creates public `logos` / `photos` buckets with admin-only write policies |
| `open_coordination_access` | Opens `check_in_attendee()` / `get_attendance_summary()` execute to anon + authenticated (coordination-team self-declared access) |
| `add_session_category_fields` | Idempotent guard for the session category/presenter/featured columns |
| `short_qr_tokens` | Human-readable QR tokens (`OAK-2026-XXXX-XXXX`) via `generate_short_qr_token()` column default |
| `register_attendee_unique_short_token` | `register_attendee()` regenerates the short QR token until unique |
| `programme_sessions_richer_fields` (20260910223527) | Idempotent no-op guard so the full chain runs cleanly from scratch |

---

## Security Model

Enforced at the **database level** via Row Level Security — not just
hidden in the UI, per the project brief's explicit requirement.

| Table | Public | Admin |
|---|---|---|
| `organizations` | Read | Full access |
| `programme_days` / `programme_sessions` | Read | Full access |
| `documentation_posts` / `documentation_photos` | Published only | Full access |
| `attendees` | **No direct read** | Full access |
| `attendance` | **No direct read** | Full access |
| `admin_users` | **No direct read** | Super-admin only |

- Public registration writes go through a `SECURITY DEFINER` database
  function (`register_attendee`), not a direct table `INSERT` — this
  keeps write access narrow and validated, rather than opening broad
  public write permissions on a table containing sensitive data.
- The registration API response returns **only** `id`, `firstName`,
  `lastName`, `qrToken` — dietary/accessibility/travel/email/phone are
  never included in any public-facing response.
- Check-in requires a real authenticated admin session
  (`check_in_attendee()` calls `is_admin()` internally); this is checked
  both by the page-level route guard (`proxy.ts`, for UX) **and**
  independently inside the API route itself (the actual security
  boundary — the route guard alone would not stop a direct API call).

**To verify this manually:** open DevTools → Network tab while browsing
as a public (non-logged-in) visitor, and inspect the raw JSON response
from `/api/register` and any public page — dietary/accessibility/travel/
email/phone fields should never appear anywhere in the payload.

---

## QR Code Design

QR codes encode **only** the attendee's `qr_token` (a random string, not
their name/email/etc.) — e.g. `102d591af1f043d1a06951cf54cbb6d0`. The
scanner reads this token and the backend looks up the attendee
server-side; no personal data is ever embedded in the printed/displayed
code itself.

---

## Known Limitations / Follow-Ups

- **Partner logos**: not yet wired to Supabase Storage; the directory
  currently shows initials placeholders instead of real logos.
- **Documentation posts/photos**: not yet built (lowest priority per
  the original brief's scope).
- **QR download button**: registration success screen doesn't yet let
  attendees download their QR as an image file.
- **Day 2 / Day 3 programme**: seeded as placeholders — real content
  pending from the coordination team.
- **Mobile responsiveness**: needs a dedicated pass; sidebar navigation
  currently collapses below the `md` breakpoint without a mobile menu
  replacement.
- Local dev's Supabase **Storage container** has occasionally been slow
  to report healthy on `db reset` — this hasn't blocked any current
  functionality (nothing yet depends on Storage) but is worth knowing
  about if adding logo/photo uploads.

---

## Deployment (Production)

Not yet performed. Planned steps:

```bash
npx supabase login
npx supabase link --project-ref <production-project-ref>
npx supabase db push
```

Then deploy the Next.js app to Vercel, with the production Supabase URL
and Publishable key set as environment variables in the Vercel project
settings (never commit these).