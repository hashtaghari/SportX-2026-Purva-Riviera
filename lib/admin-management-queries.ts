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
  houseId: string | null;
};

export type AdminEvent = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  rules: string;
  rulebookUrl: string;
  posterUrl: string;
  registrationLink: string;
  winnerDetails: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  status: "upcoming" | "ongoing" | "completed" | "archived";
};

export type AdminEventScore = {
  eventId: string;
  houseId: string;
  points: number;
  position: number | null;
  resultLabel: string;
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

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, slug, name, category, description, rules, rulebook_url, poster_url, registration_link, winner_details, venue, starts_at, ends_at, status",
    )
    .order("starts_at", { ascending: true });

  return (events ?? []).map((event) => ({
      id: event.id,
      slug: event.slug,
      name: event.name,
      category: event.category,
      description: event.description ?? "",
      rules: event.rules ?? "",
      rulebookUrl: event.rulebook_url ?? "",
      posterUrl: event.poster_url ?? "",
      registrationLink: event.registration_link ?? "",
      winnerDetails: event.winner_details ?? "",
      venue: event.venue,
      startsAt: event.starts_at,
      endsAt: event.ends_at ?? "",
      status: event.status,
    }));
}

export async function getAdminEventScores(): Promise<AdminEventScore[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("event_scores")
    .select("event_id, house_id, points, position, result_label");

  return (data ?? []).map((score) => ({
    eventId: score.event_id,
    houseId: score.house_id,
    points: score.points,
    position: score.position,
    resultLabel: score.result_label ?? "",
  }));
}
