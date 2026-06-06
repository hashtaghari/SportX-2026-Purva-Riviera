-- Balanced temporary house assignments for the 15 real Purva Riviera blocks.
-- These assignments can be changed later from /admin/blocks.

with assignments(block_name, house_slug) as (
  values
    ('RAA', 'red'::public.house_slug),
    ('RBB', 'red'::public.house_slug),
    ('REB', 'red'::public.house_slug),
    ('RGA', 'red'::public.house_slug),
    ('RAB', 'green'::public.house_slug),
    ('RC', 'green'::public.house_slug),
    ('RFA', 'green'::public.house_slug),
    ('RH', 'green'::public.house_slug),
    ('RBA', 'yellow'::public.house_slug),
    ('RD', 'yellow'::public.house_slug),
    ('RFB', 'yellow'::public.house_slug),
    ('RJ', 'yellow'::public.house_slug),
    ('REA', 'blue'::public.house_slug),
    ('RGB', 'blue'::public.house_slug),
    ('RK', 'blue'::public.house_slug)
)
update public.blocks as block
set house_id = house.id
from assignments
join public.houses as house on house.slug = assignments.house_slug
where block.name = assignments.block_name;
