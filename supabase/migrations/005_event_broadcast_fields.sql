-- Public event broadcasting fields for posters and winner/result summaries.

alter table public.events
add column if not exists poster_url text,
add column if not exists winner_details text;
