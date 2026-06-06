insert into public.houses (slug, name, color, captain_name, vice_captain_name, motto)
values
  ('red', 'Red House', '#dc2626', 'Ananya Rao', 'Vikram Mehta', 'Power in every play'),
  ('green', 'Green House', '#16a34a', 'Neha Iyer', 'Arjun Menon', 'Calm, quick, relentless'),
  ('yellow', 'Yellow House', '#eab308', 'Siddharth Nair', 'Priya Shah', 'Shine under pressure'),
  ('blue', 'Blue House', '#2563eb', 'Rahul Sharma', 'Meera Kapoor', 'Rise with the tide')
on conflict (slug) do update set
  name = excluded.name,
  color = excluded.color,
  captain_name = excluded.captain_name,
  vice_captain_name = excluded.vice_captain_name,
  motto = excluded.motto;

insert into public.blocks (name, display_order, house_id)
select block_name, display_order, h.id
from (
  values
    ('Aster', 1, 'red'::public.house_slug),
    ('Banyan', 2, 'red'::public.house_slug),
    ('Coral', 3, 'red'::public.house_slug),
    ('Daffodil', 4, 'red'::public.house_slug),
    ('Ebony', 5, 'green'::public.house_slug),
    ('Fern', 6, 'green'::public.house_slug),
    ('Gulmohar', 7, 'green'::public.house_slug),
    ('Hibiscus', 8, 'green'::public.house_slug),
    ('Iris', 9, 'yellow'::public.house_slug),
    ('Jasmine', 10, 'yellow'::public.house_slug),
    ('Kaveri', 11, 'yellow'::public.house_slug),
    ('Lotus', 12, 'yellow'::public.house_slug),
    ('Magnolia', 13, 'blue'::public.house_slug),
    ('Neelam', 14, 'blue'::public.house_slug),
    ('Orchid', 15, 'blue'::public.house_slug),
    ('Palm', 16, 'blue'::public.house_slug)
) as blocks(block_name, display_order, house_slug)
join public.houses h on h.slug = blocks.house_slug
on conflict (name) do update set
  display_order = excluded.display_order,
  house_id = excluded.house_id;

insert into public.events (
  slug,
  name,
  category,
  description,
  rules,
  venue,
  starts_at,
  ends_at,
  max_participants,
  status,
  registration_status,
  registration_opens_at,
  registration_closes_at
)
values
  (
    'cricket',
    'Cricket',
    'Team Sport',
    'Inter-house cricket tournament with knockout fixtures.',
    'Ten overs per side. Standard society tournament rules apply.',
    'Main Ground',
    '2026-01-17 08:00:00+05:30',
    '2026-01-17 18:00:00+05:30',
    64,
    'completed',
    'closed',
    '2025-12-15 09:00:00+05:30',
    '2026-01-10 20:00:00+05:30'
  ),
  (
    'badminton-singles',
    'Badminton Singles',
    'Racket Sport',
    'Singles badminton event across all houses.',
    'Best of three games to 21 points.',
    'Clubhouse Court',
    '2026-01-18 17:30:00+05:30',
    '2026-01-18 21:30:00+05:30',
    32,
    'completed',
    'closed',
    '2025-12-15 09:00:00+05:30',
    '2026-01-12 20:00:00+05:30'
  ),
  (
    'chess',
    'Chess',
    'Indoor Sport',
    'Rapid chess championship for individual participants.',
    'Swiss rounds followed by a final board.',
    'Community Hall',
    '2026-01-19 10:00:00+05:30',
    '2026-01-19 14:00:00+05:30',
    40,
    'ongoing',
    'waitlist',
    '2025-12-15 09:00:00+05:30',
    '2026-01-14 20:00:00+05:30'
  ),
  (
    'football',
    'Football',
    'Team Sport',
    'Seven-a-side football knockout championship.',
    'Two halves of 20 minutes with penalties for knockouts.',
    'Football Turf',
    '2026-01-20 16:00:00+05:30',
    '2026-01-20 21:00:00+05:30',
    56,
    'upcoming',
    'open',
    '2025-12-15 09:00:00+05:30',
    '2026-01-16 20:00:00+05:30'
  ),
  (
    'swimming',
    'Swimming',
    'Aquatics',
    'Timed swimming heats and finals.',
    'Freestyle, relay, and age-category heats.',
    'Pool Deck',
    '2026-01-21 07:00:00+05:30',
    '2026-01-21 11:00:00+05:30',
    48,
    'upcoming',
    'open',
    '2025-12-15 09:00:00+05:30',
    '2026-01-17 20:00:00+05:30'
  )
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  rules = excluded.rules,
  venue = excluded.venue,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  max_participants = excluded.max_participants,
  status = excluded.status,
  registration_status = excluded.registration_status,
  registration_opens_at = excluded.registration_opens_at,
  registration_closes_at = excluded.registration_closes_at;

insert into public.participants (
  full_name,
  age,
  gender,
  mobile,
  email,
  block_id,
  flat_number,
  emergency_contact
)
select
  participant_name,
  age,
  gender,
  mobile,
  email,
  b.id,
  flat_number,
  emergency_contact
from (
  values
    ('Rahul Sharma', 34, 'male', '9000000001', 'rahul.sharma@example.com', 'Magnolia', 'M-1203', '9000000101'),
    ('Ananya Rao', 29, 'female', '9000000002', 'ananya.rao@example.com', 'Aster', 'A-804', '9000000102'),
    ('Neha Iyer', 31, 'female', '9000000003', 'neha.iyer@example.com', 'Ebony', 'E-502', '9000000103'),
    ('Siddharth Nair', 37, 'male', '9000000004', 'siddharth.nair@example.com', 'Iris', 'I-1001', '9000000104'),
    ('Meera Kapoor', 27, 'female', '9000000005', 'meera.kapoor@example.com', 'Neelam', 'N-303', '9000000105'),
    ('Vikram Mehta', 42, 'male', '9000000006', 'vikram.mehta@example.com', 'Banyan', 'B-701', '9000000106'),
    ('Priya Shah', 25, 'female', '9000000007', 'priya.shah@example.com', 'Lotus', 'L-1102', '9000000107'),
    ('Arjun Menon', 33, 'male', '9000000008', 'arjun.menon@example.com', 'Fern', 'F-604', '9000000108'),
    ('Ishaan Gupta', 16, 'male', '9000000009', 'ishaan.gupta@example.com', 'Orchid', 'O-902', '9000000109'),
    ('Tara Singh', 15, 'female', '9000000010', 'tara.singh@example.com', 'Kaveri', 'K-402', '9000000110'),
    ('Karan Bhat', 40, 'male', '9000000011', 'karan.bhat@example.com', 'Coral', 'C-905', '9000000111'),
    ('Asha Thomas', 36, 'female', '9000000012', 'asha.thomas@example.com', 'Gulmohar', 'G-205', '9000000112')
) as participants(participant_name, age, gender, mobile, email, block_name, flat_number, emergency_contact)
join public.blocks b on b.name = participants.block_name
on conflict (mobile, flat_number) do update set
  full_name = excluded.full_name,
  age = excluded.age,
  gender = excluded.gender,
  email = excluded.email,
  block_id = excluded.block_id,
  flat_number = excluded.flat_number,
  emergency_contact = excluded.emergency_contact;

insert into public.event_registrations (participant_id, event_id, status, waitlist_position)
select p.id, e.id, registration_status, waitlist_position
from (
  values
    ('9000000001', 'cricket', 'approved'::public.registration_status, null::integer),
    ('9000000002', 'cricket', 'approved'::public.registration_status, null::integer),
    ('9000000003', 'cricket', 'approved'::public.registration_status, null::integer),
    ('9000000004', 'cricket', 'approved'::public.registration_status, null::integer),
    ('9000000005', 'badminton-singles', 'approved'::public.registration_status, null::integer),
    ('9000000006', 'badminton-singles', 'approved'::public.registration_status, null::integer),
    ('9000000007', 'badminton-singles', 'approved'::public.registration_status, null::integer),
    ('9000000008', 'badminton-singles', 'approved'::public.registration_status, null::integer),
    ('9000000009', 'chess', 'approved'::public.registration_status, null::integer),
    ('9000000010', 'chess', 'approved'::public.registration_status, null::integer),
    ('9000000011', 'football', 'pending'::public.registration_status, null::integer),
    ('9000000012', 'swimming', 'waitlisted'::public.registration_status, 1)
) as registrations(mobile, event_slug, registration_status, waitlist_position)
join public.participants p on p.mobile = registrations.mobile
join public.events e on e.slug = registrations.event_slug
on conflict (participant_id, event_id) do update set
  status = excluded.status,
  waitlist_position = excluded.waitlist_position;

insert into public.event_scores (event_id, house_id, points, position, result_label, notes)
select e.id, h.id, points, position, result_label, notes
from (
  values
    ('cricket', 'blue'::public.house_slug, 50, 1, 'Champion', 'Won the cricket final'),
    ('cricket', 'red'::public.house_slug, 35, 2, 'Runner-up', 'Reached final'),
    ('cricket', 'green'::public.house_slug, 20, 3, 'Semi-finalist', 'Won third-place playoff'),
    ('cricket', 'yellow'::public.house_slug, 10, 4, 'Semi-finalist', 'Fourth place'),
    ('badminton-singles', 'red'::public.house_slug, 50, 1, 'Gold finish', 'Straight-games final win'),
    ('badminton-singles', 'blue'::public.house_slug, 35, 2, 'Silver finish', 'Runner-up'),
    ('badminton-singles', 'yellow'::public.house_slug, 20, 3, 'Bronze finish', 'Third place'),
    ('badminton-singles', 'green'::public.house_slug, 10, 4, 'Fourth place', 'Semi-finalist'),
    ('chess', 'yellow'::public.house_slug, 30, 1, 'Leading after round 3', 'Event in progress'),
    ('chess', 'green'::public.house_slug, 25, 2, 'Second after round 3', 'Event in progress'),
    ('chess', 'blue'::public.house_slug, 15, 3, 'Third after round 3', 'Event in progress'),
    ('chess', 'red'::public.house_slug, 10, 4, 'Fourth after round 3', 'Event in progress')
) as scores(event_slug, house_slug, points, position, result_label, notes)
join public.events e on e.slug = scores.event_slug
join public.houses h on h.slug = scores.house_slug
on conflict (event_id, house_id) do update set
  points = excluded.points,
  position = excluded.position,
  result_label = excluded.result_label,
  notes = excluded.notes;

insert into public.medals (event_id, participant_id, house_id, medal, points_awarded)
select e.id, p.id, p.house_id, medal, points_awarded
from (
  values
    ('cricket', '9000000001', 'gold'::public.medal_type, 50),
    ('cricket', '9000000002', 'silver'::public.medal_type, 35),
    ('cricket', '9000000003', 'bronze'::public.medal_type, 20),
    ('badminton-singles', '9000000006', 'gold'::public.medal_type, 50),
    ('badminton-singles', '9000000005', 'silver'::public.medal_type, 35),
    ('badminton-singles', '9000000007', 'bronze'::public.medal_type, 20)
) as medal_rows(event_slug, mobile, medal, points_awarded)
join public.events e on e.slug = medal_rows.event_slug
join public.participants p on p.mobile = medal_rows.mobile
on conflict (event_id, participant_id) do update set
  participant_id = excluded.participant_id,
  house_id = excluded.house_id,
  medal = excluded.medal,
  points_awarded = excluded.points_awarded;

insert into public.matches (
  event_id,
  round,
  match_number,
  team_a_house_id,
  team_b_house_id,
  team_a_label,
  team_b_label,
  venue,
  starts_at,
  score_a,
  score_b,
  winner_house_id,
  winner_label,
  status
)
select
  e.id,
  round,
  match_number,
  ha.id,
  hb.id,
  team_a_label,
  team_b_label,
  venue,
  starts_at,
  score_a,
  score_b,
  hw.id,
  winner_label,
  status
from (
  values
    ('cricket', 'Semi Final', 1, 'blue'::public.house_slug, 'yellow'::public.house_slug, 'Blue House', 'Yellow House', 'Main Ground', '2026-01-17 08:00:00+05:30'::timestamptz, '86/4', '72/7', 'blue'::public.house_slug, 'Blue House', 'completed'::public.match_status),
    ('cricket', 'Semi Final', 2, 'red'::public.house_slug, 'green'::public.house_slug, 'Red House', 'Green House', 'Main Ground', '2026-01-17 10:30:00+05:30'::timestamptz, '91/5', '88/6', 'red'::public.house_slug, 'Red House', 'completed'::public.match_status),
    ('cricket', 'Final', 1, 'blue'::public.house_slug, 'red'::public.house_slug, 'Blue House', 'Red House', 'Main Ground', '2026-01-17 16:00:00+05:30'::timestamptz, '102/6', '96/8', 'blue'::public.house_slug, 'Blue House', 'completed'::public.match_status),
    ('football', 'Semi Final', 1, 'red'::public.house_slug, 'green'::public.house_slug, 'Red House', 'Green House', 'Football Turf', '2026-01-20 16:00:00+05:30'::timestamptz, null, null, null::public.house_slug, null, 'scheduled'::public.match_status),
    ('football', 'Semi Final', 2, 'blue'::public.house_slug, 'yellow'::public.house_slug, 'Blue House', 'Yellow House', 'Football Turf', '2026-01-20 17:00:00+05:30'::timestamptz, null, null, null::public.house_slug, null, 'scheduled'::public.match_status)
) as match_rows(event_slug, round, match_number, team_a_slug, team_b_slug, team_a_label, team_b_label, venue, starts_at, score_a, score_b, winner_slug, winner_label, status)
join public.events e on e.slug = match_rows.event_slug
left join public.houses ha on ha.slug = match_rows.team_a_slug
left join public.houses hb on hb.slug = match_rows.team_b_slug
left join public.houses hw on hw.slug = match_rows.winner_slug
on conflict (event_id, round, match_number) do update set
  team_a_house_id = excluded.team_a_house_id,
  team_b_house_id = excluded.team_b_house_id,
  team_a_label = excluded.team_a_label,
  team_b_label = excluded.team_b_label,
  venue = excluded.venue,
  starts_at = excluded.starts_at,
  score_a = excluded.score_a,
  score_b = excluded.score_b,
  winner_house_id = excluded.winner_house_id,
  winner_label = excluded.winner_label,
  status = excluded.status;

insert into public.brackets (event_id, name, format, rounds)
select e.id, bracket_name, format, rounds
from (
  values
    (
      'cricket',
      'Main Bracket',
      'knockout',
      '[
        {"round":"Semi Final","matches":[{"match":1,"a":"Blue House","b":"Yellow House","winner":"Blue House"},{"match":2,"a":"Red House","b":"Green House","winner":"Red House"}]},
        {"round":"Final","matches":[{"match":1,"a":"Blue House","b":"Red House","winner":"Blue House"}]}
      ]'::jsonb
    ),
    (
      'football',
      'Main Bracket',
      'knockout',
      '[
        {"round":"Semi Final","matches":[{"match":1,"a":"Red House","b":"Green House","winner":null},{"match":2,"a":"Blue House","b":"Yellow House","winner":null}]},
        {"round":"Final","matches":[{"match":1,"a":"Winner SF1","b":"Winner SF2","winner":null}]}
      ]'::jsonb
    )
) as bracket_rows(event_slug, bracket_name, format, rounds)
join public.events e on e.slug = bracket_rows.event_slug
on conflict (event_id, name) do update set
  format = excluded.format,
  rounds = excluded.rounds;

insert into public.announcements (event_id, title, body, pinned, published_at, expires_at)
select e.id, title, body, pinned, published_at, expires_at
from (
  values
    ('football', 'Football fixtures released', 'Semi-final fixtures for football are now published.', true, '2026-01-16 09:00:00+05:30'::timestamptz, null::timestamptz),
    ('chess', 'Chess round four starts at 11:30 AM', 'Players should report to Community Hall ten minutes before the round.', false, '2026-01-19 10:45:00+05:30'::timestamptz, '2026-01-19 13:00:00+05:30'::timestamptz),
    (null, 'Gallery uploads open after every event', 'House captains can share event photos with the admin team for gallery review.', false, '2026-01-17 07:00:00+05:30'::timestamptz, null::timestamptz)
) as announcement_rows(event_slug, title, body, pinned, published_at, expires_at)
left join public.events e on e.slug = announcement_rows.event_slug
on conflict do nothing;

insert into public.gallery_images (event_id, house_id, storage_path, alt_text, caption, featured)
select e.id, h.id, storage_path, alt_text, caption, featured
from (
  values
    ('cricket', 'blue'::public.house_slug, 'events/cricket/blue-final-celebration.jpg', 'Blue House cricket team celebrating the final win', 'Blue House after the cricket final', true),
    ('badminton-singles', 'red'::public.house_slug, 'events/badminton/red-gold-point.jpg', 'Red House player during badminton final point', 'Championship point in badminton singles', true),
    ('chess', 'yellow'::public.house_slug, 'events/chess/yellow-top-board.jpg', 'Yellow House player at the top chess board', 'Chess round three top board', false)
) as gallery_rows(event_slug, house_slug, storage_path, alt_text, caption, featured)
join public.events e on e.slug = gallery_rows.event_slug
join public.houses h on h.slug = gallery_rows.house_slug
on conflict (storage_path) do update set
  event_id = excluded.event_id,
  house_id = excluded.house_id,
  alt_text = excluded.alt_text,
  caption = excluded.caption,
  featured = excluded.featured;

insert into public.activity_logs (action, entity, metadata)
values
  ('seeded', 'championship', '{"source":"001_seed_championship.sql","message":"Initial SportX 2026 data loaded"}'::jsonb),
  ('score_recorded', 'event_scores', '{"event":"cricket","leader":"Blue House"}'::jsonb),
  ('announcement_published', 'announcements', '{"title":"Football fixtures released"}'::jsonb);
