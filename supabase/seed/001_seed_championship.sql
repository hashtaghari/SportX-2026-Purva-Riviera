insert into public.houses (
  slug,
  name,
  color,
  captain_name,
  vice_captain_name,
  motto,
  banner_url
)
values
  ('red', 'Red Bulls', '#ed1c24', null, null, null, '/images/houses/red-bulls.jpg'),
  ('green', 'Green Eagles', '#286337', null, null, null, '/images/houses/green-eagles.jpg'),
  ('yellow', 'Yellow Tigers', '#ffd900', null, null, null, '/images/houses/yellow-tigers.jpg'),
  ('blue', 'Blue Sharks', '#185d91', null, null, null, '/images/houses/blue-sharks.jpg')
on conflict (slug) do update set
  name = excluded.name,
  color = excluded.color,
  banner_url = excluded.banner_url;

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
