import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminHouseOption = {
  id: string;
  name: string;
  color: string;
};

export type AdminBlock = {
  id: string;
  name: string;
  displayOrder: number;
  houseId: string;
};

export type AdminEvent = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  rules: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  status: "upcoming" | "ongoing" | "completed" | "archived";
  registrationStatus: "open" | "closed" | "waitlist";
  registrationType: "individual" | "team";
  minimumTeamSize: number;
  maximumTeamSize: number;
  maximumTeams: number | null;
};

export async function getAdminBlocksData(): Promise<{
  houses: AdminHouseOption[];
  blocks: AdminBlock[];
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { houses: [], blocks: [] };

  const [{ data: houses }, { data: blocks }] = await Promise.all([
    supabase.from("houses").select("id, name, color").order("name"),
    supabase.from("blocks").select("id, name, display_order, house_id").order("display_order"),
  ]);

  return {
    houses: (houses ?? []).map((house) => ({
      id: house.id,
      name: house.name,
      color: house.color,
    })),
    blocks: (blocks ?? []).map((block) => ({
      id: block.id,
      name: block.name,
      displayOrder: block.display_order,
      houseId: block.house_id,
    })),
  };
}

export async function getAdminEvents(): Promise<AdminEvent[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const [{ data: events }, { data: settings }] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, slug, name, category, description, rules, venue, starts_at, ends_at, status, registration_status",
      )
      .order("starts_at", { ascending: true }),
    supabase
      .from("event_registration_settings")
      .select(
        "event_id, registration_type, minimum_team_size, maximum_team_size, maximum_teams",
      ),
  ]);
  const settingsByEvent = new Map((settings ?? []).map((setting) => [setting.event_id, setting]));

  return (events ?? []).map((event) => {
    const setting = settingsByEvent.get(event.id);

    return {
      id: event.id,
      slug: event.slug,
      name: event.name,
      category: event.category,
      description: event.description ?? "",
      rules: event.rules ?? "",
      venue: event.venue,
      startsAt: event.starts_at,
      endsAt: event.ends_at ?? "",
      status: event.status,
      registrationStatus: event.registration_status,
      registrationType: setting?.registration_type ?? "individual",
      minimumTeamSize: setting?.minimum_team_size ?? 1,
      maximumTeamSize: setting?.maximum_team_size ?? 1,
      maximumTeams: setting?.maximum_teams ?? null,
    };
  });
}
