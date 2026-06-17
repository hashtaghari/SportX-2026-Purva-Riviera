create table if not exists public.gallery_sections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gallery_images
add column if not exists section_id uuid references public.gallery_sections(id) on delete cascade;

create index if not exists gallery_sections_display_idx
on public.gallery_sections(display_order, name);

create index if not exists gallery_images_section_id_idx
on public.gallery_images(section_id, created_at desc);

create or replace trigger gallery_sections_set_updated_at
before update on public.gallery_sections
for each row execute function public.set_updated_at();

create or replace function public.enforce_gallery_section_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  image_count integer;
begin
  if new.section_id is null then
    return new;
  end if;

  select count(*)
    into image_count
    from public.gallery_images
   where section_id = new.section_id
     and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if image_count >= 10 then
    raise exception 'Gallery sections can contain at most 10 photos.';
  end if;

  return new;
end;
$$;

drop trigger if exists gallery_section_limit on public.gallery_images;
create trigger gallery_section_limit
before insert or update of section_id on public.gallery_images
for each row execute function public.enforce_gallery_section_limit();

alter table public.gallery_sections enable row level security;

drop policy if exists "Public read gallery sections" on public.gallery_sections;
create policy "Public read gallery sections" on public.gallery_sections
for select using (true);

drop policy if exists "Admins insert gallery sections" on public.gallery_sections;
create policy "Admins insert gallery sections" on public.gallery_sections
for insert with check (public.is_admin());

drop policy if exists "Admins update gallery sections" on public.gallery_sections;
create policy "Admins update gallery sections" on public.gallery_sections
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins delete gallery sections" on public.gallery_sections;
create policy "Admins delete gallery sections" on public.gallery_sections
for delete using (public.is_admin());
