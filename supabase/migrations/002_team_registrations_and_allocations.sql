create type public.event_registration_type as enum ('individual', 'team');
create type public.team_result_status as enum ('draft', 'confirmed');

alter table public.event_scores
alter column points type numeric(10, 2) using points::numeric;

create table public.event_registration_settings (
  event_id uuid primary key references public.events(id) on delete cascade,
  registration_type public.event_registration_type not null default 'individual',
  minimum_team_size integer not null default 1 check (minimum_team_size > 0),
  maximum_team_size integer not null default 1 check (maximum_team_size >= minimum_team_size),
  maximum_teams integer check (maximum_teams is null or maximum_teams > 0),
  approval_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_position_points (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  position integer not null check (position > 0),
  label text not null,
  points numeric(10, 2) not null check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, position)
);

create table public.event_teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  team_name text not null,
  status public.registration_status not null default 'pending',
  waitlist_position integer check (waitlist_position is null or waitlist_position > 0),
  submitter_note text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, team_name)
);

create table public.event_team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.event_teams(id) on delete cascade,
  full_name text not null,
  gender text not null,
  age integer not null check (age between 5 and 100),
  block_id uuid not null references public.blocks(id) on delete restrict,
  house_id uuid not null references public.houses(id) on delete restrict,
  flat_number text not null,
  is_captain boolean not null default false,
  mobile text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_captain or mobile is not null)
);

create unique index event_team_members_one_captain_idx
on public.event_team_members(team_id)
where is_captain = true;

create table public.event_team_results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid not null references public.event_teams(id) on delete cascade,
  position integer not null check (position > 0),
  total_points numeric(10, 2) not null check (total_points >= 0),
  result_label text,
  notes text,
  status public.team_result_status not null default 'draft',
  confirmed_by uuid references auth.users(id) on delete set null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, team_id),
  unique (event_id, position)
);

create table public.team_point_allocations (
  id uuid primary key default gen_random_uuid(),
  team_result_id uuid not null references public.event_team_results(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid not null references public.event_teams(id) on delete cascade,
  house_id uuid not null references public.houses(id) on delete restrict,
  member_count integer not null check (member_count > 0),
  team_size integer not null check (team_size > 0),
  allocation_ratio numeric(8, 6) not null check (allocation_ratio > 0 and allocation_ratio <= 1),
  points numeric(10, 2) not null check (points >= 0),
  created_at timestamptz not null default now(),
  unique (team_result_id, house_id)
);

create index event_teams_event_status_idx on public.event_teams(event_id, status);
create index event_team_members_team_id_idx on public.event_team_members(team_id);
create index event_team_members_house_id_idx on public.event_team_members(house_id);
create index event_team_results_event_status_idx on public.event_team_results(event_id, status);
create index team_point_allocations_event_house_idx on public.team_point_allocations(event_id, house_id);

create trigger event_registration_settings_set_updated_at
before update on public.event_registration_settings
for each row execute function public.set_updated_at();

create trigger event_position_points_set_updated_at
before update on public.event_position_points
for each row execute function public.set_updated_at();

create trigger event_teams_set_updated_at
before update on public.event_teams
for each row execute function public.set_updated_at();

create trigger event_team_members_set_updated_at
before update on public.event_team_members
for each row execute function public.set_updated_at();

create trigger event_team_results_set_updated_at
before update on public.event_team_results
for each row execute function public.set_updated_at();

create or replace function public.bootstrap_event_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.event_registration_settings(event_id)
  values (new.id)
  on conflict (event_id) do nothing;

  insert into public.event_position_points(event_id, position, label, points)
  values
    (new.id, 1, 'Winner', 100),
    (new.id, 2, 'Runner-up', 60),
    (new.id, 3, 'Third Place', 30)
  on conflict (event_id, position) do nothing;

  return new;
end;
$$;

create trigger events_bootstrap_registration
after insert on public.events
for each row execute function public.bootstrap_event_registration();

create or replace function public.derive_team_member_house()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select house_id into new.house_id
  from public.blocks
  where id = new.block_id;

  if new.house_id is null then
    raise exception 'A valid block is required';
  end if;

  return new;
end;
$$;

create trigger event_team_members_derive_house
before insert or update of block_id, house_id on public.event_team_members
for each row execute function public.derive_team_member_house();

create or replace function public.submit_event_team(
  p_event_id uuid,
  p_team_name text,
  p_members jsonb,
  p_submitter_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
  v_settings public.event_registration_settings%rowtype;
  v_team_id uuid;
  v_member jsonb;
  v_member_count integer;
  v_captain_count integer;
  v_status public.registration_status := 'pending';
  v_waitlist_position integer;
  v_existing_teams integer;
begin
  select * into v_event from public.events where id = p_event_id;
  if not found then raise exception 'Event not found'; end if;

  if v_event.registration_status = 'closed' then
    raise exception 'Registration is closed';
  end if;

  select * into v_settings
  from public.event_registration_settings
  where event_id = p_event_id;

  if not found or v_settings.registration_type <> 'team' then
    raise exception 'This event is not open for team registration';
  end if;

  v_member_count := jsonb_array_length(p_members);
  if v_member_count < v_settings.minimum_team_size or v_member_count > v_settings.maximum_team_size then
    raise exception 'Team size must be between % and %', v_settings.minimum_team_size, v_settings.maximum_team_size;
  end if;

  select count(*) into v_captain_count
  from jsonb_array_elements(p_members) member
  where coalesce((member->>'isCaptain')::boolean, false);

  if v_captain_count <> 1 then
    raise exception 'Exactly one team captain is required';
  end if;

  if v_event.registration_status = 'waitlist' then
    v_status := 'waitlisted';
  elsif v_settings.maximum_teams is not null then
    select count(*) into v_existing_teams
    from public.event_teams
    where event_id = p_event_id and status in ('pending', 'approved');

    if v_existing_teams >= v_settings.maximum_teams then
      v_status := 'waitlisted';
    end if;
  end if;

  if v_status = 'waitlisted' then
    select coalesce(max(waitlist_position), 0) + 1 into v_waitlist_position
    from public.event_teams where event_id = p_event_id;
  end if;

  insert into public.event_teams(event_id, team_name, status, waitlist_position, submitter_note)
  values (p_event_id, trim(p_team_name), v_status, v_waitlist_position, nullif(trim(p_submitter_note), ''))
  returning id into v_team_id;

  for v_member in select * from jsonb_array_elements(p_members)
  loop
    if coalesce((v_member->>'isCaptain')::boolean, false)
       and nullif(trim(v_member->>'mobile'), '') is null then
      raise exception 'Captain mobile number is required';
    end if;

    insert into public.event_team_members(
      team_id, full_name, gender, age, block_id, house_id, flat_number,
      is_captain, mobile, email
    )
    values (
      v_team_id,
      trim(v_member->>'fullName'),
      v_member->>'gender',
      (v_member->>'age')::integer,
      (v_member->>'blockId')::uuid,
      (select house_id from public.blocks where id = (v_member->>'blockId')::uuid),
      trim(v_member->>'flatNumber'),
      coalesce((v_member->>'isCaptain')::boolean, false),
      nullif(trim(v_member->>'mobile'), ''),
      nullif(trim(v_member->>'email'), '')
    );
  end loop;

  return jsonb_build_object(
    'teamId', v_team_id,
    'status', v_status,
    'waitlistPosition', v_waitlist_position
  );
end;
$$;

create or replace function public.confirm_team_result(p_team_result_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.event_team_results%rowtype;
  v_team_size integer;
  v_allocated numeric(10, 2);
  v_delta numeric(10, 2);
  v_largest_house uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;

  select * into v_result
  from public.event_team_results
  where id = p_team_result_id
  for update;

  if not found then raise exception 'Team result not found'; end if;

  select count(*) into v_team_size
  from public.event_team_members
  where team_id = v_result.team_id;

  if v_team_size = 0 then raise exception 'Team has no registered members'; end if;

  delete from public.team_point_allocations where team_result_id = v_result.id;

  insert into public.team_point_allocations(
    team_result_id, event_id, team_id, house_id, member_count, team_size,
    allocation_ratio, points
  )
  select
    v_result.id,
    v_result.event_id,
    v_result.team_id,
    house_id,
    count(*)::integer,
    v_team_size,
    count(*)::numeric / v_team_size,
    round(v_result.total_points * count(*)::numeric / v_team_size, 2)
  from public.event_team_members
  where team_id = v_result.team_id
  group by house_id;

  select coalesce(sum(points), 0) into v_allocated
  from public.team_point_allocations
  where team_result_id = v_result.id;

  v_delta := v_result.total_points - v_allocated;

  if v_delta <> 0 then
    select house_id into v_largest_house
    from public.team_point_allocations
    where team_result_id = v_result.id
    order by member_count desc, house_id
    limit 1;

    update public.team_point_allocations
    set points = points + v_delta
    where team_result_id = v_result.id and house_id = v_largest_house;
  end if;

  update public.event_team_results
  set status = 'confirmed', confirmed_by = auth.uid(), confirmed_at = now()
  where id = v_result.id;

  delete from public.event_scores where event_id = v_result.event_id;

  insert into public.event_scores(event_id, house_id, points, result_label, notes)
  select
    event_id,
    house_id,
    sum(points),
    'Team result allocation',
    'Automatically allocated from confirmed mixed-house team results'
  from public.team_point_allocations
  where event_id = v_result.event_id
  group by event_id, house_id;

  return (
    select jsonb_build_object(
      'resultId', v_result.id,
      'eventId', v_result.event_id,
      'totalPoints', v_result.total_points,
      'allocations', jsonb_agg(
        jsonb_build_object(
          'houseId', house_id,
          'memberCount', member_count,
          'teamSize', team_size,
          'ratio', allocation_ratio,
          'points', points
        )
        order by points desc
      )
    )
    from public.team_point_allocations
    where team_result_id = v_result.id
  );
end;
$$;

alter table public.event_registration_settings enable row level security;
alter table public.event_position_points enable row level security;
alter table public.event_teams enable row level security;
alter table public.event_team_members enable row level security;
alter table public.event_team_results enable row level security;
alter table public.team_point_allocations enable row level security;

create policy "Public read registration settings" on public.event_registration_settings
for select using (true);
create policy "Public read position points" on public.event_position_points
for select using (true);

create policy "Admins manage registration settings" on public.event_registration_settings
for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage position points" on public.event_position_points
for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage event teams" on public.event_teams
for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage team members" on public.event_team_members
for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage team results" on public.event_team_results
for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins read team allocations" on public.team_point_allocations
for select using (public.is_admin());

grant execute on function public.submit_event_team(uuid, text, jsonb, text) to anon, authenticated;
grant execute on function public.confirm_team_result(uuid) to authenticated;

insert into public.event_registration_settings(
  event_id, registration_type, minimum_team_size, maximum_team_size, maximum_teams
)
select
  id,
  case when category = 'Team Sport' then 'team'::public.event_registration_type
       else 'individual'::public.event_registration_type end,
  case when category = 'Team Sport' then 5 else 1 end,
  case when category = 'Team Sport' then 15 else 1 end,
  case when category = 'Team Sport' then 16 else null end
from public.events
on conflict (event_id) do nothing;

insert into public.event_position_points(event_id, position, label, points)
select id, position, label, points
from public.events
cross join (
  values
    (1, 'Winner', 100::numeric),
    (2, 'Runner-up', 60::numeric),
    (3, 'Third Place', 30::numeric)
) as defaults(position, label, points)
on conflict (event_id, position) do nothing;
