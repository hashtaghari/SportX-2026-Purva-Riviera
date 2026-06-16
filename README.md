# SportX 2026

Production-ready Next.js 15 App Router foundation for the Purva Riviera inter-house sports championship.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui-style components
- Supabase database, auth-ready clients, storage-ready schema
- React Hook Form + Zod
- Recharts
- TanStack Table
- Framer Motion
- Lucide React
- Sonner

## Project Structure

- `app/(public)` public pages for home, event broadcasts/details, and registration links
- `app/admin` protected admin portal surface
- `components` layout, page sections, and reusable UI primitives
- `lib` Supabase clients, query functions, and utilities
- `types` championship and database types
- `hooks` shared React hooks
- `data` empty-state fallback structures for development
- `supabase` migrations and seed SQL

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Connect Supabase by filling in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SPORTX_ADMIN_EMAIL=
SPORTX_ADMIN_PASSWORD=
SPORTX_ADMIN_NAME=
```

After applying the migrations and seed, create or refresh the first super admin:

```bash
npm run admin:create
```

## Supabase

Run, in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_team_registrations_and_allocations.sql`
3. `supabase/migrations/003_allow_unassigned_blocks.sql`
4. `supabase/migrations/004_assign_blocks_to_houses.sql`
5. `supabase/migrations/005_event_broadcast_fields.sql`
6. `supabase/migrations/006_house_branding.sql`
7. `supabase/migrations/007_event_registration_link.sql`
8. `supabase/migrations/008_event_rulebook_url.sql`
9. `supabase/seed/001_seed_championship.sql`

The seed contains Red Bulls, Green Eagles, Yellow Tigers, and Blue Sharks plus
the 15 real block names.
Blocks have balanced temporary house assignments that can be changed from the
authenticated admin area. If sample data was applied previously, run
`supabase/reset/clear_championship_data.sql` once before beginning real setup.

The app reads from Supabase when environment variables are present. Without them,
the query layer returns clean empty states and zeroed house standings. No sample
events, scores, participants, announcements, results, or gallery entries are bundled.

Public participant and volunteer registrations are collected through the two Google
Forms linked from `/register`. Admins use `/admin/events` to publish event posters,
date/time, venue, rulebooks, winner details, and house points.

Auth, RLS, storage policies, and first-admin setup are documented in `supabase/README.md`.
