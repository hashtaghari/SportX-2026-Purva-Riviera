create extension if not exists "pgcrypto";

create type public.house_slug as enum ('red', 'green', 'yellow', 'blue');
create type public.event_status as enum ('upcoming', 'ongoing', 'completed', 'archived');
create type public.registration_status as enum ('pending', 'approved', 'rejected', 'waitlisted');
create type public.registration_window_status as enum ('open', 'closed', 'waitlist');
create type public.medal_type as enum ('gold', 'silver', 'bronze');
create type public.match_status as enum ('scheduled', 'live', 'completed', 'cancelled');
create type public.admin_role as enum ('admin', 'super_admin');

create table public.houses (
  id uuid primary key default gen_random_uuid(),
  slug public.house_slug not null unique,
  name text not null unique,
  color text not null,
  banner_url text,
  captain_name text,
  vice_captain_name text,
  motto text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order integer not null unique check (display_order between 1 and 16),
  house_id uuid not null references public.houses(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  age integer not null check (age between 5 and 100),
  gender text not null,
  mobile text not null,
  email text,
  block_id uuid not null references public.blocks(id) on delete restrict,
  house_id uuid not null references public.houses(id) on delete restrict,
  flat_number text not null,
  avatar_url text,
  emergency_contact text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mobile, flat_number)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text,
  rules text,
  venue text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  max_participants integer check (max_participants is null or max_participants > 0),
  status public.event_status not null default 'upcoming',
  registration_status public.registration_window_status not null default 'open',
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at),
  check (registration_closes_at is null or registration_opens_at is null or registration_closes_at >= registration_opens_at)
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  status public.registration_status not null default 'pending',
  waitlist_position integer check (waitlist_position is null or waitlist_position > 0),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, event_id)
);

create table public.event_scores (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  house_id uuid not null references public.houses(id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  position integer check (position is null or position > 0),
  result_label text,
  notes text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, house_id)
);

create table public.medals (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  house_id uuid not null references public.houses(id) on delete cascade,
  medal public.medal_type not null,
  points_awarded integer not null default 0 check (points_awarded >= 0),
  awarded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (event_id, participant_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  round text not null,
  match_number integer not null default 1 check (match_number > 0),
  team_a_house_id uuid references public.houses(id) on delete set null,
  team_b_house_id uuid references public.houses(id) on delete set null,
  team_a_label text not null,
  team_b_label text not null,
  venue text not null,
  starts_at timestamptz not null,
  score_a text,
  score_b text,
  winner_house_id uuid references public.houses(id) on delete set null,
  winner_label text,
  status public.match_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, round, match_number)
);

create table public.brackets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null default 'Main Bracket',
  format text not null default 'knockout',
  rounds jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, name)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  body text not null,
  pinned boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or published_at is null or expires_at >= published_at)
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  house_id uuid references public.houses(id) on delete set null,
  storage_bucket text not null default 'sportx-gallery',
  storage_path text not null unique,
  alt_text text not null,
  caption text,
  featured boolean not null default false,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.admin_role not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.derive_participant_house()
returns trigger
language plpgsql
as $$
begin
  select b.house_id into new.house_id
  from public.blocks b
  where b.id = new.block_id;

  if new.house_id is null then
    raise exception 'Participant block_id % does not map to a house', new.block_id;
  end if;

  return new;
end;
$$;

create or replace function public.ensure_medal_house_matches_participant()
returns trigger
language plpgsql
as $$
declare
  participant_house_id uuid;
begin
  if new.participant_id is null then
    return new;
  end if;

  select p.house_id into participant_house_id
  from public.participants p
  where p.id = new.participant_id;

  if participant_house_id is null then
    raise exception 'Participant % not found for medal', new.participant_id;
  end if;

  if new.house_id is distinct from participant_house_id then
    raise exception 'Medal house must match participant house';
  end if;

  return new;
end;
$$;

create or replace function public.sync_participant_houses_for_block()
returns trigger
language plpgsql
as $$
begin
  update public.participants
  set house_id = new.house_id
  where block_id = new.id;

  return new;
end;
$$;

create trigger houses_set_updated_at
before update on public.houses
for each row execute function public.set_updated_at();

create trigger blocks_set_updated_at
before update on public.blocks
for each row execute function public.set_updated_at();

create trigger participants_derive_house
before insert or update of block_id, house_id on public.participants
for each row execute function public.derive_participant_house();

create trigger blocks_sync_participant_houses
after update of house_id on public.blocks
for each row
when (old.house_id is distinct from new.house_id)
execute function public.sync_participant_houses_for_block();

create trigger participants_set_updated_at
before update on public.participants
for each row execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger event_registrations_set_updated_at
before update on public.event_registrations
for each row execute function public.set_updated_at();

create trigger event_scores_set_updated_at
before update on public.event_scores
for each row execute function public.set_updated_at();

create trigger medals_validate_house
before insert or update of participant_id, house_id on public.medals
for each row execute function public.ensure_medal_house_matches_participant();

create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

create trigger brackets_set_updated_at
before update on public.brackets
for each row execute function public.set_updated_at();

create trigger announcements_set_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

create trigger gallery_images_set_updated_at
before update on public.gallery_images
for each row execute function public.set_updated_at();

create trigger admin_profiles_set_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

create index blocks_house_id_idx on public.blocks(house_id);
create index participants_block_id_idx on public.participants(block_id);
create index participants_house_id_idx on public.participants(house_id);
create index participants_full_name_idx on public.participants using gin (to_tsvector('english', full_name));
create index events_status_starts_at_idx on public.events(status, starts_at);
create index events_registration_status_idx on public.events(registration_status);
create index event_registrations_event_status_idx on public.event_registrations(event_id, status);
create index event_registrations_participant_idx on public.event_registrations(participant_id);
create index event_scores_event_id_idx on public.event_scores(event_id);
create index event_scores_house_id_idx on public.event_scores(house_id);
create index medals_event_id_idx on public.medals(event_id);
create index medals_house_medal_idx on public.medals(house_id, medal);
create index matches_event_status_starts_at_idx on public.matches(event_id, status, starts_at);
create index brackets_event_id_idx on public.brackets(event_id);
create index announcements_event_published_idx on public.announcements(event_id, published_at desc);
create index announcements_pinned_idx on public.announcements(pinned) where pinned = true;
create index gallery_images_event_id_idx on public.gallery_images(event_id);
create index gallery_images_house_id_idx on public.gallery_images(house_id);
create index gallery_images_featured_idx on public.gallery_images(featured) where featured = true;
create index activity_logs_entity_idx on public.activity_logs(entity, entity_id, created_at desc);
create index activity_logs_actor_idx on public.activity_logs(actor_id, created_at desc);

create or replace view public.house_leaderboard as
with score_totals as (
  select
    house_id,
    coalesce(sum(points), 0)::integer as total_points,
    count(distinct event_id)::integer as events_participated
  from public.event_scores
  group by house_id
),
medal_totals as (
  select
    house_id,
    count(*) filter (where medal = 'gold')::integer as gold_medals,
    count(*) filter (where medal = 'silver')::integer as silver_medals,
    count(*) filter (where medal = 'bronze')::integer as bronze_medals
  from public.medals
  group by house_id
),
participant_totals as (
  select
    house_id,
    count(*)::integer as participant_count
  from public.participants
  group by house_id
)
select
  dense_rank() over (
    order by
      coalesce(st.total_points, 0) desc,
      coalesce(mt.gold_medals, 0) desc,
      coalesce(mt.silver_medals, 0) desc,
      coalesce(mt.bronze_medals, 0) desc,
      h.name asc
  )::integer as rank,
  h.id as house_id,
  h.slug,
  h.name,
  h.color,
  coalesce(st.total_points, 0)::integer as total_points,
  coalesce(mt.gold_medals, 0)::integer as gold_medals,
  coalesce(mt.silver_medals, 0)::integer as silver_medals,
  coalesce(mt.bronze_medals, 0)::integer as bronze_medals,
  coalesce(st.events_participated, 0)::integer as events_participated,
  coalesce(pt.participant_count, 0)::integer as participant_count
from public.houses h
left join score_totals st on st.house_id = h.id
left join medal_totals mt on mt.house_id = h.id
left join participant_totals pt on pt.house_id = h.id;

create or replace view public.medal_table as
select
  dense_rank() over (
    order by
      count(*) filter (where m.medal = 'gold') desc,
      count(*) filter (where m.medal = 'silver') desc,
      count(*) filter (where m.medal = 'bronze') desc,
      h.name asc
  )::integer as rank,
  h.id as house_id,
  h.slug,
  h.name,
  h.color,
  count(*) filter (where m.medal = 'gold')::integer as gold_medals,
  count(*) filter (where m.medal = 'silver')::integer as silver_medals,
  count(*) filter (where m.medal = 'bronze')::integer as bronze_medals,
  count(m.id)::integer as total_medals
from public.houses h
left join public.medals m on m.house_id = h.id
group by h.id, h.slug, h.name, h.color;

create or replace view public.event_results as
select
  e.id as event_id,
  e.slug,
  e.name,
  e.category,
  e.venue,
  e.starts_at,
  e.status,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'house_id', h.id,
          'house', h.name,
          'slug', h.slug,
          'color', h.color,
          'points', es.points,
          'position', es.position,
          'result_label', es.result_label
        )
        order by es.points desc, es.position asc nulls last, h.name asc
      )
      from public.event_scores es
      join public.houses h on h.id = es.house_id
      where es.event_id = e.id
    ),
    '[]'::jsonb
  ) as house_scores,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'medal', m.medal,
          'participant_id', p.id,
          'participant', p.full_name,
          'house_id', h.id,
          'house', h.name,
          'slug', h.slug
        )
        order by case m.medal when 'gold' then 1 when 'silver' then 2 else 3 end
      )
      from public.medals m
      left join public.participants p on p.id = m.participant_id
      join public.houses h on h.id = m.house_id
      where m.event_id = e.id
    ),
    '[]'::jsonb
  ) as medals
from public.events e;

create or replace view public.house_summaries as
select
  h.id as house_id,
  h.slug,
  h.name,
  h.color,
  h.captain_name,
  h.vice_captain_name,
  coalesce(
    (
      select jsonb_agg(b.name order by b.display_order)
      from public.blocks b
      where b.house_id = h.id
    ),
    '[]'::jsonb
  ) as blocks,
  coalesce(hl.total_points, 0)::integer as total_points,
  coalesce(hl.gold_medals, 0)::integer as gold_medals,
  coalesce(hl.silver_medals, 0)::integer as silver_medals,
  coalesce(hl.bronze_medals, 0)::integer as bronze_medals,
  coalesce(hl.events_participated, 0)::integer as events_participated,
  coalesce(hl.participant_count, 0)::integer as participant_count
from public.houses h
left join public.house_leaderboard hl on hl.house_id = h.id;

create or replace view public.registration_details
with (security_invoker = true) as
select
  er.id as registration_id,
  er.status,
  er.waitlist_position,
  er.created_at,
  p.id as participant_id,
  p.full_name,
  p.age,
  p.gender,
  p.mobile,
  p.email,
  p.flat_number,
  b.id as block_id,
  b.name as block_name,
  h.id as house_id,
  h.slug as house_slug,
  h.name as house_name,
  e.id as event_id,
  e.slug as event_slug,
  e.name as event_name,
  e.category,
  e.starts_at,
  e.venue
from public.event_registrations er
join public.participants p on p.id = er.participant_id
join public.blocks b on b.id = p.block_id
join public.houses h on h.id = p.house_id
join public.events e on e.id = er.event_id;

create or replace view public.public_participants
with (security_barrier = true) as
select
  p.id,
  p.full_name,
  p.age,
  p.gender,
  p.avatar_url,
  b.id as block_id,
  b.name as block_name,
  h.id as house_id,
  h.slug as house_slug,
  h.name as house_name,
  h.color as house_color,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'event_id', e.id,
          'event_slug', e.slug,
          'event_name', e.name,
          'status', er.status
        )
        order by e.starts_at
      )
      from public.event_registrations er
      join public.events e on e.id = er.event_id
      where er.participant_id = p.id
        and er.status in ('approved', 'waitlisted')
    ),
    '[]'::jsonb
  ) as event_registrations
from public.participants p
join public.blocks b on b.id = p.block_id
join public.houses h on h.id = p.house_id;

create or replace view public.house_standings as
select
  rank,
  house_id,
  slug,
  name,
  color,
  total_points,
  gold_medals,
  silver_medals,
  bronze_medals,
  events_participated,
  participant_count
from public.house_leaderboard;

create or replace function public.current_admin_role()
returns public.admin_role
language sql
security definer
set search_path = public
stable
as $$
  select ap.role
  from public.admin_profiles ap
  where ap.user_id = auth.uid()
    and ap.active = true
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = auth.uid()
      and ap.active = true
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_admin_role() = 'super_admin';
$$;

alter table public.houses enable row level security;
alter table public.blocks enable row level security;
alter table public.participants enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_scores enable row level security;
alter table public.medals enable row level security;
alter table public.matches enable row level security;
alter table public.brackets enable row level security;
alter table public.announcements enable row level security;
alter table public.gallery_images enable row level security;
alter table public.activity_logs enable row level security;
alter table public.admin_profiles enable row level security;

create policy "Public read houses" on public.houses for select using (true);
create policy "Public read blocks" on public.blocks for select using (true);
create policy "Public read events" on public.events for select using (status <> 'archived');
create policy "Public read event scores" on public.event_scores for select using (true);
create policy "Public read medals" on public.medals for select using (true);
create policy "Public read matches" on public.matches for select using (true);
create policy "Public read brackets" on public.brackets for select using (true);
create policy "Public read published announcements" on public.announcements for select using (
  published_at is not null
  and published_at <= now()
  and (expires_at is null or expires_at > now())
);
create policy "Public read gallery images" on public.gallery_images for select using (true);

create policy "Public submit participants" on public.participants for insert with check (true);
create policy "Public submit pending registrations" on public.event_registrations
for insert
with check (
  status = 'pending'
  and waitlist_position is null
  and admin_note is null
);

create policy "Admins read participants" on public.participants
for select using (public.is_admin());
create policy "Admins update participants" on public.participants
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete participants" on public.participants
for delete using (public.is_admin());

create policy "Admins insert houses" on public.houses
for insert with check (public.is_admin());
create policy "Admins update houses" on public.houses
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete houses" on public.houses
for delete using (public.is_admin());

create policy "Admins insert blocks" on public.blocks
for insert with check (public.is_admin());
create policy "Admins update blocks" on public.blocks
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete blocks" on public.blocks
for delete using (public.is_admin());

create policy "Admins insert events" on public.events
for insert with check (public.is_admin());
create policy "Admins read all events" on public.events
for select using (public.is_admin());
create policy "Admins update events" on public.events
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete events" on public.events
for delete using (public.is_admin());

create policy "Admins read registrations" on public.event_registrations
for select using (public.is_admin());
create policy "Admins insert registrations" on public.event_registrations
for insert with check (public.is_admin());
create policy "Admins update registrations" on public.event_registrations
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete registrations" on public.event_registrations
for delete using (public.is_admin());

create policy "Admins insert scores" on public.event_scores
for insert with check (public.is_admin());
create policy "Admins update scores" on public.event_scores
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete scores" on public.event_scores
for delete using (public.is_admin());

create policy "Admins insert medals" on public.medals
for insert with check (public.is_admin());
create policy "Admins update medals" on public.medals
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete medals" on public.medals
for delete using (public.is_admin());

create policy "Admins insert matches" on public.matches
for insert with check (public.is_admin());
create policy "Admins update matches" on public.matches
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete matches" on public.matches
for delete using (public.is_admin());

create policy "Admins insert brackets" on public.brackets
for insert with check (public.is_admin());
create policy "Admins update brackets" on public.brackets
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete brackets" on public.brackets
for delete using (public.is_admin());

create policy "Admins insert announcements" on public.announcements
for insert with check (public.is_admin());
create policy "Admins read all announcements" on public.announcements
for select using (public.is_admin());
create policy "Admins update announcements" on public.announcements
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete announcements" on public.announcements
for delete using (public.is_admin());

create policy "Admins insert gallery images" on public.gallery_images
for insert with check (public.is_admin());
create policy "Admins update gallery images" on public.gallery_images
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete gallery images" on public.gallery_images
for delete using (public.is_admin());

create policy "Admins read activity logs" on public.activity_logs
for select using (public.is_admin());
create policy "Admins create activity logs" on public.activity_logs
for insert with check (public.is_admin());
create policy "Admins update activity logs" on public.activity_logs
for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete activity logs" on public.activity_logs
for delete using (public.is_admin());
create policy "Admins read admin profiles" on public.admin_profiles
for select using (public.is_admin());
create policy "Super admins insert admin profiles" on public.admin_profiles
for insert with check (public.is_super_admin());
create policy "Super admins update admin profiles" on public.admin_profiles
for update using (public.is_super_admin()) with check (public.is_super_admin());
create policy "Super admins delete admin profiles" on public.admin_profiles
for delete using (public.is_super_admin());

grant select on
  public.house_leaderboard,
  public.medal_table,
  public.event_results,
  public.house_summaries,
  public.house_standings,
  public.public_participants
to anon, authenticated;

grant select on public.registration_details to authenticated;

insert into storage.buckets (id, name, public)
values ('sportx-gallery', 'sportx-gallery', true)
on conflict (id) do update set public = excluded.public;

create policy "Public read gallery storage objects" on storage.objects
for select using (bucket_id = 'sportx-gallery');

create policy "Admins upload gallery storage objects" on storage.objects
for insert with check (
  bucket_id = 'sportx-gallery'
  and public.is_admin()
);

create policy "Admins update gallery storage objects" on storage.objects
for update using (
  bucket_id = 'sportx-gallery'
  and public.is_admin()
) with check (
  bucket_id = 'sportx-gallery'
  and public.is_admin()
);

create policy "Admins delete gallery storage objects" on storage.objects
for delete using (
  bucket_id = 'sportx-gallery'
  and public.is_admin()
);
