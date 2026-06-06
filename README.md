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

- `app/(public)` public pages for home, leaderboard, events, and registration
- `app/admin` protected admin portal surface
- `components` layout, page sections, and reusable UI primitives
- `lib` Supabase clients, query functions, and utilities
- `types` championship and database types
- `hooks` shared React hooks
- `data` local seed-shaped fallback data for development
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
```

## Supabase

Run the schema in `supabase/migrations/001_initial_schema.sql`, then apply `supabase/seed/001_seed_championship.sql`.

The app reads from Supabase when environment variables are present. Without them, the query layer returns local seed-shaped data so the interface can build and the next product steps can continue.

Auth, RLS, storage policies, and first-admin setup are documented in `supabase/README.md`.
