insert into public.houses (
  slug,
  name,
  color,
  captain_name,
  vice_captain_name,
  motto
)
values
  ('red', 'Red House', '#dc2626', null, null, null),
  ('green', 'Green House', '#16a34a', null, null, null),
  ('yellow', 'Yellow House', '#eab308', null, null, null),
  ('blue', 'Blue House', '#2563eb', null, null, null)
on conflict (slug) do update set
  name = excluded.name,
  color = excluded.color;

with block_assignments(name, display_order, house_slug) as (
  values
    ('RAA', 1, 'red'::public.house_slug),
    ('RAB', 2, 'green'::public.house_slug),
    ('RBA', 3, 'yellow'::public.house_slug),
    ('RBB', 4, 'red'::public.house_slug),
    ('RC', 5, 'green'::public.house_slug),
    ('RD', 6, 'yellow'::public.house_slug),
    ('REA', 7, 'blue'::public.house_slug),
    ('REB', 8, 'red'::public.house_slug),
    ('RFA', 9, 'green'::public.house_slug),
    ('RFB', 10, 'yellow'::public.house_slug),
    ('RGA', 11, 'red'::public.house_slug),
    ('RGB', 12, 'blue'::public.house_slug),
    ('RH', 13, 'green'::public.house_slug),
    ('RJ', 14, 'yellow'::public.house_slug),
    ('RK', 15, 'blue'::public.house_slug)
)
insert into public.blocks (name, display_order, house_id)
select block.name, block.display_order, house.id
from block_assignments as block
join public.houses as house on house.slug = block.house_slug
on conflict (name) do update set
  display_order = excluded.display_order,
  house_id = excluded.house_id;
