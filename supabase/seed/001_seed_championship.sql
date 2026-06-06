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
