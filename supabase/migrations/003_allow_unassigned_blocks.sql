-- Blocks can be loaded before their final house assignments are known.
-- Public registration queries exclude unassigned blocks.

alter table public.blocks
alter column house_id drop not null;

insert into public.blocks (name, display_order, house_id)
values
  ('RAA', 1, null),
  ('RAB', 2, null),
  ('RBA', 3, null),
  ('RBB', 4, null),
  ('RC', 5, null),
  ('RD', 6, null),
  ('REA', 7, null),
  ('REB', 8, null),
  ('RFA', 9, null),
  ('RFB', 10, null),
  ('RGA', 11, null),
  ('RGB', 12, null),
  ('RH', 13, null),
  ('RJ', 14, null),
  ('RK', 15, null)
on conflict (name) do update set
  display_order = excluded.display_order;
