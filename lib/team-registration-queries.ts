import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminTeamEvent = {
  id: string;
  name: string;
  registrationStatus: "open" | "closed" | "waitlist";
  minimumTeamSize: number;
  maximumTeamSize: number;
  maximumTeams: number | null;
  teams: {
    id: string;
    name: string;
    status: "pending" | "approved" | "rejected" | "waitlisted";
    members: {
      name: string;
      gender: string;
      age: number;
      blockName: string;
      houseName: string;
      flatNumber: string;
      isCaptain: boolean;
      mobile: string | null;
      email: string | null;
    }[];
  }[];
  positions: {
    id: string;
    position: number;
    label: string;
    points: number;
  }[];
};

export async function getAdminTeamEvents(): Promise<AdminTeamEvent[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const [
    { data: events },
    { data: settings },
    { data: teams },
    { data: members },
    { data: positions },
    { data: blocks },
    { data: houses },
  ] = await Promise.all([
      supabase
        .from("events")
        .select("id, name, registration_status")
        .order("starts_at", { ascending: true }),
      supabase
        .from("event_registration_settings")
        .select("event_id, registration_type, minimum_team_size, maximum_team_size, maximum_teams")
        .eq("registration_type", "team"),
      supabase
        .from("event_teams")
        .select("id, event_id, team_name, status")
        .order("team_name", { ascending: true }),
      supabase
        .from("event_team_members")
        .select(
          "team_id, full_name, gender, age, block_id, house_id, flat_number, is_captain, mobile, email",
        )
        .order("is_captain", { ascending: false }),
      supabase
        .from("event_position_points")
        .select("id, event_id, position, label, points")
        .order("position", { ascending: true }),
      supabase.from("blocks").select("id, name"),
      supabase.from("houses").select("id, name"),
    ]);

  const teamSettings = new Map((settings ?? []).map((setting) => [setting.event_id, setting]));
  const blockNames = new Map((blocks ?? []).map((block) => [block.id, block.name]));
  const houseNames = new Map((houses ?? []).map((house) => [house.id, house.name]));

  return (events ?? []).flatMap((event) => {
    const setting = teamSettings.get(event.id);
    if (!setting) return [];

    return [{
      id: event.id,
      name: event.name,
      registrationStatus: event.registration_status,
      minimumTeamSize: setting.minimum_team_size,
      maximumTeamSize: setting.maximum_team_size,
      maximumTeams: setting.maximum_teams,
      teams: (teams ?? [])
        .filter((team) => team.event_id === event.id)
        .map((team) => ({
          id: team.id,
          name: team.team_name,
          status: team.status,
          members: (members ?? [])
            .filter((member) => member.team_id === team.id)
            .map((member) => ({
              name: member.full_name,
              gender: member.gender,
              age: member.age,
              blockName: blockNames.get(member.block_id) ?? "Block",
              houseName: houseNames.get(member.house_id) ?? "House",
              flatNumber: member.flat_number,
              isCaptain: member.is_captain,
              mobile: member.mobile,
              email: member.email,
            })),
        })),
      positions: (positions ?? [])
        .filter((position) => position.event_id === event.id)
        .map((position) => ({
          id: position.id,
          position: position.position,
          label: position.label,
          points: Number(position.points),
        })),
    }];
  });
}
