import {
  ANNOUNCEMENTS,
  CHAMPIONSHIP_STATS,
  EVENTS,
  GALLERY_IMAGES,
  getFallbackHouseDetail,
  HOUSE_STANDINGS,
  HOUSES,
  MEDAL_TABLE,
  POINTS_HISTORY,
  RECENT_RESULTS,
} from "@/data/championship";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizePosterUrl } from "@/lib/url-utils";
import type {
  ChampionshipEvent,
  ChampionshipStats,
  Announcement,
  GalleryImage,
  House,
  HouseDetail,
  HouseStanding,
  EventDetail,
  MedalStanding,
  PointsHistoryPoint,
  RegistrationBlock,
  RecentResult,
  TeamRegistrationEvent,
} from "@/types/championship";

export async function getHouses(): Promise<House[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return HOUSES;
  }

  const { data, error } = await supabase
    .from("houses")
    .select("id, slug, name, color, captain_name, vice_captain_name");

  if (error || !data) {
    return HOUSES;
  }

  return data.map((house) => ({
    id: house.id,
    slug: house.slug as House["slug"],
    name: house.name,
    color: house.color,
    accentClass: `bg-house-${house.slug}`,
    captain: house.captain_name,
    viceCaptain: house.vice_captain_name,
    towers: HOUSES.find((item) => item.slug === house.slug)?.towers ?? [],
  }));
}

export async function getHouseStandings(): Promise<HouseStanding[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return HOUSE_STANDINGS;
  }

  const { data, error } = await supabase
    .from("house_standings")
    .select("*")
    .order("total_points", { ascending: false });

  if (error || !data) {
    return HOUSE_STANDINGS;
  }

  const leaderPoints = Math.max(
    ...data.map((row) => Number(row.total_points ?? 0)),
    0,
  );

  return data.map((row, index) => ({
    id: row.house_id,
    slug: row.slug as HouseStanding["slug"],
    name: row.name,
    color: row.color,
    accentClass: `bg-house-${row.slug}`,
    captain: null,
    viceCaptain: null,
    towers: HOUSES.find((house) => house.slug === row.slug)?.towers ?? [],
    rank: index + 1,
    totalPoints: row.total_points,
    goldMedals: row.gold_medals,
    silverMedals: row.silver_medals,
    bronzeMedals: row.bronze_medals,
    eventsParticipated: row.events_participated,
    pointsGap: leaderPoints - row.total_points,
    trend: "steady",
  }));
}

export async function getChampionshipEvents(): Promise<ChampionshipEvent[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return EVENTS;
  }

  const { data, error } = await supabase
    .from("events")
    .select("slug, name, category, venue, starts_at, status, registration_status, poster_url, registration_link")
    .order("starts_at", { ascending: true });

  if (error || !data) {
    return EVENTS;
  }

  return data.map((event) => ({
    id: event.slug,
    name: event.name,
    category: event.category,
    venue: event.venue,
    startsAt: event.starts_at,
    status: event.status as ChampionshipEvent["status"],
    registrationStatus:
      event.registration_status as ChampionshipEvent["registrationStatus"],
    posterUrl: normalizePosterUrl(event.poster_url),
    registrationLink: event.registration_link,
  }));
}

export async function getEventDetail(slug: string): Promise<EventDetail | null> {
  const fallbackEvent = EVENTS.find((event) => event.id === slug);
  const fallback: EventDetail | null = fallbackEvent
    ? {
        ...fallbackEvent,
        description: `${fallbackEvent.name} brings Purva Riviera residents together for a competitive SportX 2026 fixture.`,
        rules:
          "Participants must report 20 minutes before the scheduled start. The event coordinator's decision is final. Fair play and resident safety rules apply throughout.",
        rulebookUrl: null,
        endsAt: null,
        winnerDetails:
          fallbackEvent.status === "completed"
            ? `${RECENT_RESULTS.find((result) => result.eventName === fallbackEvent.name)?.houseName ?? "Winner"} recorded the leading result.`
            : null,
        scores: HOUSE_STANDINGS.map((house) => ({
          houseId: house.id,
          houseName: house.name,
          houseColor: house.color,
          points:
            RECENT_RESULTS.find(
              (result) =>
                result.eventName === fallbackEvent.name &&
                result.houseName === house.name,
            )?.points ?? 0,
          position: null,
          resultLabel: null,
        })).filter((score) => score.points > 0),
      }
    : null;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallback;

  const { data: event, error } = await supabase
    .from("events")
    .select(
      "id, slug, name, category, description, rules, rulebook_url, poster_url, registration_link, winner_details, venue, starts_at, ends_at, status, registration_status",
    )
    .eq("slug", slug)
    .single();

  if (error || !event) return fallback;

  const { data: scores } = await supabase
    .from("event_scores")
    .select("house_id, points, position, result_label, houses(name, color)")
    .eq("event_id", event.id)
    .order("position", { ascending: true, nullsFirst: false });

  return {
    id: event.slug,
    name: event.name,
    category: event.category,
    venue: event.venue,
    startsAt: event.starts_at,
    status: event.status as ChampionshipEvent["status"],
    registrationStatus:
      event.registration_status as ChampionshipEvent["registrationStatus"],
    posterUrl: normalizePosterUrl(event.poster_url),
    registrationLink: event.registration_link,
    description: event.description,
    rules: event.rules,
    rulebookUrl: event.rulebook_url,
    endsAt: event.ends_at,
    winnerDetails: event.winner_details,
    scores: (scores ?? []).map((score) => {
      const house = score.houses as { name?: string; color?: string } | null;
      return {
        houseId: score.house_id,
        houseName: house?.name ?? "House",
        houseColor: house?.color ?? "#64748b",
        points: score.points,
        position: score.position,
        resultLabel: score.result_label,
      };
    }),
  };
}

export async function getTeamRegistrationOptions(): Promise<{
  events: TeamRegistrationEvent[];
  blocks: RegistrationBlock[];
}> {
  const fallbackBlocks = HOUSES.flatMap((house) =>
    house.towers.map((tower) => ({
      id: tower,
      name: tower,
      houseId: house.id,
      houseName: house.name,
      houseColor: house.color,
    })),
  );
  const fallbackEvents = EVENTS.filter((event) => event.category === "Team Sport").map(
    (event) => ({
      ...event,
      databaseId: event.id,
      registrationType: "team" as const,
      minimumTeamSize: 5,
      maximumTeamSize: 15,
      maximumTeams: 16,
    }),
  );
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { events: fallbackEvents, blocks: fallbackBlocks };
  }

  const [{ data: settings }, { data: blocks }] = await Promise.all([
    supabase
      .from("event_registration_settings")
      .select(
        "event_id, registration_type, minimum_team_size, maximum_team_size, maximum_teams, events(slug, name, category, venue, starts_at, status, registration_status)",
      )
      .eq("registration_type", "team"),
    supabase
      .from("blocks")
      .select("id, name, house_id, houses(name, color)")
      .not("house_id", "is", null)
      .order("display_order", { ascending: true }),
  ]);

  const registrationEvents = (settings ?? []).flatMap((setting) => {
    const event = setting.events as {
      slug?: string;
      name?: string;
      category?: string;
      venue?: string;
      starts_at?: string;
      status?: ChampionshipEvent["status"];
      registration_status?: ChampionshipEvent["registrationStatus"];
    } | null;

    if (!event?.slug || !event.name || !event.starts_at) {
      return [];
    }

    return [{
      id: event.slug,
      databaseId: setting.event_id,
      name: event.name,
      category: event.category ?? "Team Sport",
      venue: event.venue ?? "Venue TBA",
      startsAt: event.starts_at,
      status: event.status ?? "upcoming",
      registrationStatus: event.registration_status ?? "closed",
      registrationType: setting.registration_type,
      minimumTeamSize: setting.minimum_team_size,
      maximumTeamSize: setting.maximum_team_size,
      maximumTeams: setting.maximum_teams,
    }];
  });

  const registrationBlocks = (blocks ?? []).flatMap((block) => {
    if (!block.house_id) return [];
    const house = block.houses as { name?: string; color?: string } | null;

    return [{
      id: block.id,
      name: block.name,
      houseId: block.house_id,
      houseName: house?.name ?? "House",
      houseColor: house?.color ?? "#64748b",
    }];
  });

  return {
    events: registrationEvents.length ? registrationEvents : fallbackEvents,
    blocks: registrationBlocks.length ? registrationBlocks : fallbackBlocks,
  };
}

export async function getChampionshipStats(): Promise<ChampionshipStats> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return CHAMPIONSHIP_STATS;
  }

  const [{ count: participants }, standings, events] = await Promise.all([
    supabase.from("participants").select("id", { count: "exact", head: true }),
    getHouseStandings(),
    getChampionshipEvents(),
  ]);

  return {
    participants: participants ?? 0,
    completedEvents: events.filter((event) => event.status === "completed").length,
    remainingEvents: events.filter((event) => event.status !== "completed").length,
    leadingHouse: standings[0]?.name ?? "TBD",
  };
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return ANNOUNCEMENTS;
  }

  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, pinned, published_at")
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(4);

  if (error || !data?.length) {
    return ANNOUNCEMENTS;
  }

  return data.map((announcement) => ({
    id: String(announcement.id),
    title: String(announcement.title),
    body: String(announcement.body),
    pinned: Boolean(announcement.pinned),
    publishedAt: announcement.published_at
      ? String(announcement.published_at)
      : null,
  }));
}

export async function getRecentResults(): Promise<RecentResult[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return RECENT_RESULTS;
  }

  const { data, error } = await supabase
    .from("event_scores")
    .select("id, points, recorded_at, result_label, events(name), houses(name, color)")
    .order("recorded_at", { ascending: false })
    .limit(5);

  if (error || !data?.length) {
    return RECENT_RESULTS;
  }

  return data.map((result) => {
    const event = result.events as { name?: string } | null;
    const house = result.houses as { name?: string; color?: string } | null;
    const houseName = house?.name ?? "House";

    return {
      id: String(result.id),
      eventName: event?.name ?? "Event",
      summary: `${houseName} ${result.result_label ?? "recorded a result"}.`,
      houseName,
      houseColor: house?.color ?? "#2563eb",
      points: Number(result.points ?? 0),
      occurredAt: String(result.recorded_at),
    };
  });
}

export async function getFeaturedGalleryImages(): Promise<GalleryImage[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return GALLERY_IMAGES;
  }

  const { data, error } = await supabase
    .from("gallery_images")
    .select("id, storage_bucket, storage_path, alt_text, caption, featured, houses(color)")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data?.length) {
    return GALLERY_IMAGES;
  }

  return data.map((image) => {
    const { data: publicUrl } = supabase.storage
      .from(String(image.storage_bucket ?? "sportx-gallery"))
      .getPublicUrl(String(image.storage_path));
    const house = image.houses as { color?: string } | null;

    return {
      id: String(image.id),
      src: publicUrl.publicUrl,
      alt: String(image.alt_text ?? "SportX 2026 gallery image"),
      caption: String(image.caption ?? "SportX 2026 moment"),
      houseColor: house?.color ?? "#2563eb",
      featured: Boolean(image.featured),
    };
  });
}

export async function getMedalTable(): Promise<MedalStanding[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return MEDAL_TABLE;
  }

  const { data, error } = await supabase
    .from("medal_table")
    .select("*")
    .order("rank", { ascending: true });

  if (error || !data?.length) {
    return MEDAL_TABLE;
  }

  return data.map((row) => ({
    rank: Number(row.rank ?? 0),
    houseId: String(row.house_id),
    slug: row.slug as MedalStanding["slug"],
    name: String(row.name),
    color: String(row.color),
    goldMedals: Number(row.gold_medals ?? 0),
    silverMedals: Number(row.silver_medals ?? 0),
    bronzeMedals: Number(row.bronze_medals ?? 0),
    totalMedals: Number(row.total_medals ?? 0),
  }));
}

export async function getPointsHistory(): Promise<PointsHistoryPoint[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return POINTS_HISTORY;
  }

  const [{ data: scores, error: scoresError }, { data: events, error: eventsError }, { data: houses, error: housesError }] =
    await Promise.all([
      supabase
        .from("event_scores")
        .select("event_id, house_id, points, recorded_at")
        .order("recorded_at", { ascending: true }),
      supabase.from("events").select("id, name, starts_at").order("starts_at"),
      supabase.from("houses").select("id, slug"),
    ]);

  if (
    scoresError ||
    eventsError ||
    housesError ||
    !scores?.length ||
    !events?.length ||
    !houses?.length
  ) {
    return POINTS_HISTORY;
  }

  const eventsById = new Map(
    events.map((event) => [
      event.id,
      { name: event.name, date: event.starts_at },
    ]),
  );
  const housesById = new Map(
    houses.map((house) => [house.id, house.slug as "red" | "green" | "yellow" | "blue"]),
  );
  const totals = { Red: 0, Green: 0, Yellow: 0, Blue: 0 };
  const scoresByEvent = new Map<string, typeof scores>();

  scores.forEach((score) => {
    const list = scoresByEvent.get(score.event_id) ?? [];
    list.push(score);
    scoresByEvent.set(score.event_id, list);
  });

  return Array.from(scoresByEvent.entries())
    .sort(([eventA], [eventB]) => {
      const dateA = eventsById.get(eventA)?.date ?? "";
      const dateB = eventsById.get(eventB)?.date ?? "";
      return dateA.localeCompare(dateB);
    })
    .map(([eventId, eventScores]) => {
      eventScores.forEach((score) => {
        const slug = housesById.get(score.house_id);
        if (slug === "red") totals.Red += score.points;
        if (slug === "green") totals.Green += score.points;
        if (slug === "yellow") totals.Yellow += score.points;
        if (slug === "blue") totals.Blue += score.points;
      });

      const event = eventsById.get(eventId);

      return {
        eventId,
        eventName: event?.name ?? "Event",
        eventDate: event?.date ?? eventScores[0]?.recorded_at ?? "",
        ...totals,
      };
    });
}

export async function getHouseDetail(slug: House["slug"]): Promise<HouseDetail | null> {
  const fallback = getFallbackHouseDetail(slug);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return fallback;
  }

  const { data: house, error: houseError } = await supabase
    .from("houses")
    .select("id, slug, name, color, banner_url, captain_name, vice_captain_name, motto")
    .eq("slug", slug)
    .single();

  if (houseError || !house) {
    return fallback;
  }

  const [
    { data: standing },
    { data: blocks },
    { data: participants },
    { data: scores },
    { data: medalRows },
    { data: galleryRows },
  ] = await Promise.all([
    supabase
      .from("house_standings")
      .select("*")
      .eq("slug", slug)
      .single(),
    supabase
      .from("blocks")
      .select("id, name, display_order")
      .eq("house_id", house.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("public_participants")
      .select("id, full_name, age, gender, block_name, event_registrations")
      .eq("house_slug", slug)
      .order("full_name", { ascending: true }),
    supabase
      .from("event_scores")
      .select("event_id, points, position, result_label, events(name, category)")
      .eq("house_id", house.id)
      .order("points", { ascending: false }),
    supabase
      .from("medals")
      .select("medal")
      .eq("house_id", house.id),
    supabase
      .from("gallery_images")
      .select("id, storage_bucket, storage_path, alt_text, caption, featured")
      .eq("house_id", house.id)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const goldMedals =
    medalRows?.filter((medal) => medal.medal === "gold").length ??
    standing?.gold_medals ??
    0;
  const silverMedals =
    medalRows?.filter((medal) => medal.medal === "silver").length ??
    standing?.silver_medals ??
    0;
  const bronzeMedals =
    medalRows?.filter((medal) => medal.medal === "bronze").length ??
    standing?.bronze_medals ??
    0;

  const participantList = (participants ?? []).map((participant) => {
    const eventRegistrations = Array.isArray(participant.event_registrations)
      ? participant.event_registrations
      : [];

    return {
      id: String(participant.id),
      fullName: String(participant.full_name),
      age:
        typeof participant.age === "number"
          ? participant.age
          : Number(participant.age) || null,
      gender: participant.gender ? String(participant.gender) : null,
      blockName: String(participant.block_name ?? "Block"),
      events: eventRegistrations
        .map((registration) =>
          typeof registration === "object" &&
          registration &&
          "event_name" in registration
            ? String(registration.event_name)
            : null,
        )
        .filter((eventName): eventName is string => Boolean(eventName)),
    };
  });

  const galleryImages = (galleryRows ?? []).map((image) => {
    const { data: publicUrl } = supabase.storage
      .from(String(image.storage_bucket ?? "sportx-gallery"))
      .getPublicUrl(String(image.storage_path));

    return {
      id: String(image.id),
      src: publicUrl.publicUrl,
      alt: String(image.alt_text ?? `${house.name} gallery image`),
      caption: String(image.caption ?? `${house.name} championship moment`),
      houseColor: house.color,
      featured: Boolean(image.featured),
    };
  });

  const totalPoints = Number(standing?.total_points ?? 0);

  return {
    id: house.id,
    slug: house.slug as House["slug"],
    name: house.name,
    color: house.color,
    accentClass: `bg-house-${house.slug}`,
    captain: house.captain_name,
    viceCaptain: house.vice_captain_name,
    towers: (blocks ?? []).map((block) => block.name),
    rank: Number(standing?.rank ?? 0),
    totalPoints,
    goldMedals,
    silverMedals,
    bronzeMedals,
    eventsParticipated: Number(standing?.events_participated ?? scores?.length ?? 0),
    pointsGap: 0,
    trend: "steady",
    bannerUrl: house.banner_url,
    motto: house.motto,
    participantCount: Number(standing?.participant_count ?? participantList.length),
    participants: participantList,
    eventContributions: (scores ?? []).map((score) => {
      const event = score.events as { name?: string; category?: string } | null;

      return {
        eventId: String(score.event_id),
        eventName: event?.name ?? "Event",
        category: event?.category ?? null,
        points: Number(score.points ?? 0),
        position: typeof score.position === "number" ? score.position : null,
        resultLabel: score.result_label ? String(score.result_label) : null,
      };
    }),
    achievements: [
      {
        id: `${house.id}-points`,
        title: `${totalPoints} total points`,
        detail: "House contribution from event score entries.",
      },
      {
        id: `${house.id}-medals`,
        title: `${goldMedals + silverMedals + bronzeMedals} medals`,
        detail: "Medals earned across completed events.",
      },
      {
        id: `${house.id}-participation`,
        title: `${Number(standing?.events_participated ?? scores?.length ?? 0)} events`,
        detail: "Events with recorded house participation.",
      },
    ],
    galleryImages: galleryImages.length ? galleryImages : fallback?.galleryImages ?? [],
  };
}
