-- Deletes championship activity while retaining houses and admin profiles.
-- Run this once before entering real SportX data.

truncate table
  public.team_point_allocations,
  public.event_team_results,
  public.event_team_members,
  public.event_teams,
  public.event_position_points,
  public.event_registration_settings,
  public.activity_logs,
  public.gallery_images,
  public.announcements,
  public.brackets,
  public.matches,
  public.medals,
  public.event_scores,
  public.event_registrations,
  public.participants,
  public.events,
  public.blocks
restart identity cascade;

update public.houses
set
  captain_name = null,
  vice_captain_name = null,
  motto = null,
  banner_url = case slug
    when 'red' then '/images/houses/red-bulls.jpg'
    when 'green' then '/images/houses/green-eagles.jpg'
    when 'yellow' then '/images/houses/yellow-tigers.jpg'
    when 'blue' then '/images/houses/blue-sharks.jpg'
  end;
