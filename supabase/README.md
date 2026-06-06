# Supabase Auth and RLS

SportX 2026 uses Supabase Auth plus `public.admin_profiles` for role-based access.

## Roles

- Public anonymous users can read public championship data and submit registrations.
- Admin users are Supabase Auth users with an active row in `public.admin_profiles`.
- Super admins are admin users with `role = 'super_admin'` and can manage other admin profiles.

## Public Access

Public users can read:

- `houses`
- `blocks`
- published/non-archived `events`
- `event_scores`
- `medals`
- `matches`
- `brackets`
- published `announcements`
- `gallery_images`
- leaderboard/result views
- `public_participants`, which intentionally excludes mobile number, email, flat number, emergency contact, and notes

Public users can insert:

- `participants`
- `event_registrations`, but only with `status = 'pending'`

## Admin Access

Admins can:

- Manage houses and blocks
- Create, edit, delete, and archive events
- Read full participant contact details
- Approve, reject, or waitlist registrations
- Add/edit/delete scores and medals
- Manage matches and brackets
- Manage announcements
- Insert/update/delete gallery metadata and gallery storage objects
- Read and create activity logs

## Creating The First Admin

1. Create the first user in Supabase Auth.

   In the Supabase dashboard, go to **Authentication > Users > Add user** and create the admin account.

2. Copy that user's UUID from the Auth users table.

3. Insert the first super admin profile using the SQL editor.

   Replace the UUID and name before running:

   ```sql
   insert into public.admin_profiles (user_id, full_name, role, active)
   values (
     '00000000-0000-0000-0000-000000000000',
     'SportX Admin',
     'super_admin',
     true
   );
   ```

   This must be done from the Supabase SQL editor or with the service role key because no admin exists yet.

4. Sign in as that user from the app.

   Open `/admin` and use the email and password created in step 1. After this,
   `public.is_admin()` returns `true`, and `public.is_super_admin()` returns `true`.

## Starting With Real Championship Data

The seed file now inserts only the four permanent houses. It does not add sample
towers, events, participants, scores, announcements, or gallery images.

For a database that previously used the sample seed:

1. Apply both migrations.
2. Run `supabase/reset/clear_championship_data.sql` once from the Supabase SQL editor.
3. Run `supabase/seed/001_seed_championship.sql` to ensure the four houses exist.
4. Create the first admin using the instructions above.
5. Sign in at `/admin`.
6. Review the 15 real blocks from `/admin/blocks` and assign each one to a house.
7. Create and publish real events from `/admin/events`.
8. Manage team registrations, result positions, and point allocations from
   `/admin/team-events`.

The cleanup script retains `admin_profiles` and the four houses, but removes
championship operational data. Review it before running it against any database
that already contains real registrations.

## Creating Additional Admins

After the first super admin exists, create another Auth user, then insert:

```sql
insert into public.admin_profiles (user_id, full_name, role, active)
values (
  'NEW_AUTH_USER_UUID',
  'New Admin Name',
  'admin',
  true
);
```

Only super admins can manage `admin_profiles` through the app/API.

## Storage

The migration creates the public `sportx-gallery` bucket. Anyone can read objects in this bucket. Only admins can upload, update, or delete objects.

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code. Use it only in secure server-side scripts, deployment jobs, or the Supabase SQL editor.

## Team Registration And Mixed-House Points

Run `002_team_registrations_and_allocations.sql` after the initial schema.

This migration adds:

- Event-level individual/team registration settings and configurable team-size limits
- Event position points such as Winner, Runner-up, and Third Place
- Team registrations and team members
- One required captain with mandatory mobile contact
- Automatic house derivation from every member's block
- Team results and auditable house point allocations

Public team registration uses the `submit_event_team` database function. It validates
the event registration window, configured team-size range, and captain details inside
one transaction. Team member contact details are not publicly readable.

Admins confirm a placed team using `confirm_team_result`. The function groups the
team's registered members by house, divides the configured position points by member
ratio, handles rounding, stores the allocation breakdown, and rebuilds that event's
house scores.

Example: a 5-member winning team with 3 Red and 2 Blue members receiving 100 points
allocates 60 points to Red House and 40 points to Blue House.

The admin Team Events page also exports event registrations as an Excel-compatible
CSV with one row per team member.
