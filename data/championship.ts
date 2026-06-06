import type {
  Announcement,
  ChampionshipEvent,
  ChampionshipStats,
  GalleryImage,
  HouseDetail,
  House,
  HouseStanding,
  MedalStanding,
  PointsHistoryPoint,
  RecentResult,
} from "@/types/championship";

export const HOUSES: House[] = [
  {
    id: "house-red",
    slug: "red",
    name: "Red House",
    color: "#dc2626",
    accentClass: "bg-house-red",
    captain: null,
    viceCaptain: null,
    towers: ["Aster", "Banyan", "Coral", "Daffodil"],
  },
  {
    id: "house-green",
    slug: "green",
    name: "Green House",
    color: "#16a34a",
    accentClass: "bg-house-green",
    captain: null,
    viceCaptain: null,
    towers: ["Ebony", "Fern", "Gulmohar", "Hibiscus"],
  },
  {
    id: "house-yellow",
    slug: "yellow",
    name: "Yellow House",
    color: "#eab308",
    accentClass: "bg-house-yellow",
    captain: null,
    viceCaptain: null,
    towers: ["Iris", "Jasmine", "Kaveri", "Lotus"],
  },
  {
    id: "house-blue",
    slug: "blue",
    name: "Blue House",
    color: "#2563eb",
    accentClass: "bg-house-blue",
    captain: null,
    viceCaptain: null,
    towers: ["Magnolia", "Neelam", "Orchid", "Palm"],
  },
];

export const BLOCK_TO_HOUSE = HOUSES.reduce<Record<string, House>>(
  (mapping, house) => {
    house.towers.forEach((tower) => {
      mapping[tower] = house;
    });
    return mapping;
  },
  {},
);

export const EVENTS: ChampionshipEvent[] = [
  {
    id: "cricket",
    name: "Cricket",
    category: "Team Sport",
    venue: "Main Ground",
    startsAt: "2026-01-17T08:00:00+05:30",
    status: "upcoming",
    registrationStatus: "open",
  },
  {
    id: "badminton-singles",
    name: "Badminton Singles",
    category: "Racket Sport",
    venue: "Clubhouse Court",
    startsAt: "2026-01-18T17:30:00+05:30",
    status: "upcoming",
    registrationStatus: "open",
  },
  {
    id: "chess",
    name: "Chess",
    category: "Indoor Sport",
    venue: "Community Hall",
    startsAt: "2026-01-19T10:00:00+05:30",
    status: "upcoming",
    registrationStatus: "waitlist",
  },
];

const BASE_HOUSE_STANDINGS = HOUSES.map((house, index) => ({
  ...house,
  rank: index + 1,
  totalPoints: [265, 220, 180, 310][index],
  goldMedals: [3, 2, 1, 4][index],
  silverMedals: [2, 3, 2, 3][index],
  bronzeMedals: [1, 2, 3, 2][index],
  eventsParticipated: [8, 7, 7, 9][index],
  pointsGap: 0,
  trend: (["up", "steady", "down", "up"] as const)[index],
}));

const fallbackLeaderPoints = Math.max(
  ...BASE_HOUSE_STANDINGS.map((house) => house.totalPoints),
);

export const HOUSE_STANDINGS: HouseStanding[] = BASE_HOUSE_STANDINGS.sort(
  (a, b) => b.totalPoints - a.totalPoints,
).map((house, index) => ({
  ...house,
  rank: index + 1,
  pointsGap: fallbackLeaderPoints - house.totalPoints,
}));

export const CHAMPIONSHIP_STATS: ChampionshipStats = {
  participants: 0,
  completedEvents: 0,
  remainingEvents: EVENTS.length,
  leadingHouse: HOUSE_STANDINGS[0]?.name ?? "TBD",
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "fixtures-released",
    title: "Opening fixtures are live",
    body: "Cricket, badminton, chess, football, and swimming schedules are ready for SportX 2026.",
    pinned: true,
    publishedAt: "2026-06-01T09:00:00+05:30",
  },
];

export const RECENT_RESULTS: RecentResult[] = [
  {
    id: "cricket-blue",
    eventName: "Cricket",
    summary: "Blue House finished first in the cricket final.",
    houseName: "Blue House",
    houseColor: "#2563eb",
    points: 50,
    occurredAt: "2026-06-04T18:00:00+05:30",
  },
  {
    id: "badminton-red",
    eventName: "Badminton Singles",
    summary: "Red House claimed the singles gold.",
    houseName: "Red House",
    houseColor: "#dc2626",
    points: 50,
    occurredAt: "2026-06-04T20:00:00+05:30",
  },
  {
    id: "chess-yellow",
    eventName: "Chess",
    summary: "Yellow House leads after the latest round.",
    houseName: "Yellow House",
    houseColor: "#eab308",
    points: 30,
    occurredAt: "2026-06-05T11:30:00+05:30",
  },
];

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "sportx-collage-1",
    src: "/images/sportx-championship-collage.png",
    alt: "SportX 2026 residents competing across multiple sports",
    caption: "Opening week energy across Purva Riviera",
    houseColor: "#2563eb",
    featured: true,
  },
  {
    id: "sportx-collage-2",
    src: "/images/sportx-championship-collage.png",
    alt: "SportX 2026 athletes in house colors",
    caption: "House colors on every court and field",
    houseColor: "#dc2626",
    featured: true,
  },
  {
    id: "sportx-collage-3",
    src: "/images/sportx-championship-collage.png",
    alt: "SportX 2026 championship moments",
    caption: "Featured championship moments",
    houseColor: "#16a34a",
    featured: true,
  },
];

export const MEDAL_TABLE: MedalStanding[] = HOUSE_STANDINGS.map((house) => ({
  rank: house.rank,
  houseId: house.id,
  slug: house.slug,
  name: house.name,
  color: house.color,
  goldMedals: house.goldMedals,
  silverMedals: house.silverMedals,
  bronzeMedals: house.bronzeMedals,
  totalMedals: house.goldMedals + house.silverMedals + house.bronzeMedals,
})).sort((a, b) => {
  if (b.goldMedals !== a.goldMedals) return b.goldMedals - a.goldMedals;
  if (b.silverMedals !== a.silverMedals) return b.silverMedals - a.silverMedals;
  if (b.bronzeMedals !== a.bronzeMedals) return b.bronzeMedals - a.bronzeMedals;
  return a.name.localeCompare(b.name);
}).map((house, index) => ({ ...house, rank: index + 1 }));

export const POINTS_HISTORY: PointsHistoryPoint[] = [
  {
    eventId: "cricket",
    eventName: "Cricket",
    eventDate: "2026-01-17T18:00:00+05:30",
    Red: 35,
    Green: 20,
    Yellow: 10,
    Blue: 50,
  },
  {
    eventId: "badminton-singles",
    eventName: "Badminton",
    eventDate: "2026-01-18T21:30:00+05:30",
    Red: 85,
    Green: 30,
    Yellow: 30,
    Blue: 85,
  },
  {
    eventId: "chess",
    eventName: "Chess",
    eventDate: "2026-01-19T14:00:00+05:30",
    Red: 95,
    Green: 55,
    Yellow: 60,
    Blue: 100,
  },
];

export function getFallbackHouseDetail(slug: House["slug"]): HouseDetail | null {
  const standing = HOUSE_STANDINGS.find((house) => house.slug === slug);

  if (!standing) {
    return null;
  }

  const contributions = EVENTS.slice(0, 3).map((event, index) => ({
    eventId: event.id,
    eventName: event.name,
    category: event.category,
    points: Math.max(standing.totalPoints - index * 45, 20) % 80,
    position: index + 1,
    resultLabel: index === 0 ? "Featured result" : "Points contribution",
  }));

  return {
    ...standing,
    bannerUrl: "/images/sportx-championship-collage.png",
    motto:
      standing.slug === "blue"
        ? "Rise with the tide"
        : standing.slug === "red"
          ? "Power in every play"
          : standing.slug === "green"
            ? "Calm, quick, relentless"
            : "Shine under pressure",
    participantCount: standing.eventsParticipated * 3,
    participants: standing.towers.flatMap((tower, index) => [
      {
        id: `${standing.slug}-${tower}-1`,
        fullName: `${standing.name.replace(" House", "")} Athlete ${index + 1}`,
        age: null,
        gender: null,
        blockName: tower,
        events: [EVENTS[index % EVENTS.length]?.name ?? "SportX Event"],
      },
    ]),
    eventContributions: contributions,
    achievements: [
      {
        id: `${standing.slug}-points`,
        title: `${standing.totalPoints} total points`,
        detail: "Overall championship contribution from scored events.",
      },
      {
        id: `${standing.slug}-medals`,
        title: `${standing.goldMedals + standing.silverMedals + standing.bronzeMedals} medals`,
        detail: "Medal table performance across completed events.",
      },
    ],
    galleryImages: GALLERY_IMAGES.map((image) => ({
      ...image,
      houseColor: standing.color,
    })),
  };
}
