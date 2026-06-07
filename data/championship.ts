import type {
  Announcement,
  ChampionshipEvent,
  ChampionshipStats,
  GalleryImage,
  House,
  HouseDetail,
  HouseEventContribution,
  HouseParticipant,
  HouseStanding,
  MedalStanding,
  PointsHistoryPoint,
  RecentResult,
} from "@/types/championship";

const houseBlocks = {
  red: ["RAA", "RBB", "REB", "RGA"],
  green: ["RAB", "RC", "RFA", "RH"],
  yellow: ["RBA", "RD", "RFB", "RJ"],
  blue: ["REA", "RGB", "RK"],
};

export const HOUSES: House[] = [
  {
    id: "house-red",
    slug: "red",
    name: "Red House",
    color: "#dc2626",
    accentClass: "bg-house-red",
    captain: "Aarav Mehta",
    viceCaptain: "Diya Nair",
    towers: houseBlocks.red,
  },
  {
    id: "house-green",
    slug: "green",
    name: "Green House",
    color: "#16a34a",
    accentClass: "bg-house-green",
    captain: "Kabir Rao",
    viceCaptain: "Ananya Iyer",
    towers: houseBlocks.green,
  },
  {
    id: "house-yellow",
    slug: "yellow",
    name: "Yellow House",
    color: "#eab308",
    accentClass: "bg-house-yellow",
    captain: "Vihaan Kapoor",
    viceCaptain: "Meera Shah",
    towers: houseBlocks.yellow,
  },
  {
    id: "house-blue",
    slug: "blue",
    name: "Blue House",
    color: "#2563eb",
    accentClass: "bg-house-blue",
    captain: "Ishaan Menon",
    viceCaptain: "Tara Krishnan",
    towers: houseBlocks.blue,
  },
];

export const BLOCK_TO_HOUSE: Record<string, House> = Object.fromEntries(
  HOUSES.flatMap((house) => house.towers.map((tower) => [tower, house])),
);

export const EVENTS: ChampionshipEvent[] = [
  {
    id: "football-5s",
    name: "Football 5s",
    category: "Team Sport",
    venue: "Clubhouse Turf",
    startsAt: "2026-06-09T17:30:00+05:30",
    status: "upcoming",
    registrationStatus: "open",
  },
  {
    id: "badminton-doubles",
    name: "Badminton Doubles",
    category: "Team Sport",
    venue: "Indoor Courts",
    startsAt: "2026-06-10T18:00:00+05:30",
    status: "upcoming",
    registrationStatus: "open",
  },
  {
    id: "table-tennis",
    name: "Table Tennis Singles",
    category: "Indoor Sport",
    venue: "Clubhouse Games Room",
    startsAt: "2026-06-11T19:00:00+05:30",
    status: "upcoming",
    registrationStatus: "waitlist",
  },
  {
    id: "relay-sprint",
    name: "4x100 Relay",
    category: "Team Sport",
    venue: "Central Lawn Track",
    startsAt: "2026-06-12T07:30:00+05:30",
    status: "upcoming",
    registrationStatus: "open",
  },
  {
    id: "swimming-freestyle",
    name: "Swimming Freestyle",
    category: "Aquatics",
    venue: "Pool Deck",
    startsAt: "2026-06-07T16:30:00+05:30",
    status: "ongoing",
    registrationStatus: "closed",
  },
  {
    id: "carrom-mixed",
    name: "Carrom Mixed Doubles",
    category: "Indoor Sport",
    venue: "Community Hall",
    startsAt: "2026-06-05T18:30:00+05:30",
    status: "completed",
    registrationStatus: "closed",
  },
  {
    id: "chess-open",
    name: "Chess Open",
    category: "Mind Sport",
    venue: "Library Lounge",
    startsAt: "2026-06-04T19:00:00+05:30",
    status: "completed",
    registrationStatus: "closed",
  },
];

export const HOUSE_STANDINGS: HouseStanding[] = [
  {
    ...HOUSES[3],
    rank: 1,
    totalPoints: 340,
    goldMedals: 3,
    silverMedals: 1,
    bronzeMedals: 2,
    eventsParticipated: 6,
    pointsGap: 0,
    trend: "up",
  },
  {
    ...HOUSES[0],
    rank: 2,
    totalPoints: 315,
    goldMedals: 2,
    silverMedals: 3,
    bronzeMedals: 1,
    eventsParticipated: 6,
    pointsGap: 25,
    trend: "up",
  },
  {
    ...HOUSES[1],
    rank: 3,
    totalPoints: 280,
    goldMedals: 1,
    silverMedals: 2,
    bronzeMedals: 4,
    eventsParticipated: 5,
    pointsGap: 60,
    trend: "steady",
  },
  {
    ...HOUSES[2],
    rank: 4,
    totalPoints: 245,
    goldMedals: 1,
    silverMedals: 1,
    bronzeMedals: 2,
    eventsParticipated: 5,
    pointsGap: 95,
    trend: "down",
  },
];

export const CHAMPIONSHIP_STATS: ChampionshipStats = {
  participants: 186,
  completedEvents: 2,
  remainingEvents: 5,
  leadingHouse: "Blue House",
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "demo-announcement-1",
    title: "Football 5s registrations are open",
    body: "Captains can register teams until 8 PM tonight. Mixed-house teams are allowed.",
    pinned: true,
    publishedAt: "2026-06-07T09:00:00+05:30",
  },
  {
    id: "demo-announcement-2",
    title: "Swimming finals moved to Pool Deck",
    body: "Please report 20 minutes before your heat for lane allocation.",
    pinned: false,
    publishedAt: "2026-06-07T12:15:00+05:30",
  },
  {
    id: "demo-announcement-3",
    title: "Gallery uploads begin after each event",
    body: "Featured SportX moments will appear on the public home page.",
    pinned: false,
    publishedAt: "2026-06-06T20:30:00+05:30",
  },
];

export const RECENT_RESULTS: RecentResult[] = [
  {
    id: "result-carrom-blue",
    eventName: "Carrom Mixed Doubles",
    summary: "Blue House won a composed final after a close semi-final run.",
    houseName: "Blue House",
    houseColor: "#2563eb",
    points: 100,
    occurredAt: "2026-06-05T21:20:00+05:30",
  },
  {
    id: "result-carrom-red",
    eventName: "Carrom Mixed Doubles",
    summary: "Red House finished runner-up with steady doubles play.",
    houseName: "Red House",
    houseColor: "#dc2626",
    points: 60,
    occurredAt: "2026-06-05T21:18:00+05:30",
  },
  {
    id: "result-chess-green",
    eventName: "Chess Open",
    summary: "Green House took first place after a rapid tie-break.",
    houseName: "Green House",
    houseColor: "#16a34a",
    points: 100,
    occurredAt: "2026-06-04T21:40:00+05:30",
  },
  {
    id: "result-chess-yellow",
    eventName: "Chess Open",
    summary: "Yellow House secured bronze with a strong final-board finish.",
    houseName: "Yellow House",
    houseColor: "#eab308",
    points: 30,
    occurredAt: "2026-06-04T21:35:00+05:30",
  },
];

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "gallery-1",
    src: "/images/sportx-championship-collage.png",
    alt: "SportX demo gallery moment",
    caption: "Opening weekend energy across Purva Riviera.",
    houseColor: "#2563eb",
    featured: true,
  },
  {
    id: "gallery-2",
    src: "/images/sportx-championship-collage.png",
    alt: "SportX team huddle",
    caption: "House captains planning the next fixture.",
    houseColor: "#dc2626",
    featured: true,
  },
  {
    id: "gallery-3",
    src: "/images/sportx-championship-collage.png",
    alt: "SportX scoreboard moment",
    caption: "The leaderboard race stays tight after indoor events.",
    houseColor: "#16a34a",
    featured: true,
  },
];

export const POINTS_HISTORY: PointsHistoryPoint[] = [
  {
    eventId: "chess-open",
    eventName: "Chess Open",
    eventDate: "2026-06-04T21:40:00+05:30",
    Red: 70,
    Green: 100,
    Yellow: 30,
    Blue: 60,
  },
  {
    eventId: "carrom-mixed",
    eventName: "Carrom Mixed Doubles",
    eventDate: "2026-06-05T21:20:00+05:30",
    Red: 130,
    Green: 130,
    Yellow: 60,
    Blue: 160,
  },
  {
    eventId: "demo-swimming-heats",
    eventName: "Swimming Heats",
    eventDate: "2026-06-07T16:30:00+05:30",
    Red: 315,
    Green: 280,
    Yellow: 245,
    Blue: 340,
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
}));

const participantsBySlug: Record<House["slug"], HouseParticipant[]> = {
  red: [
    { id: "red-1", fullName: "Aarav Mehta", age: 34, gender: "Male", blockName: "RAA", events: ["Football 5s", "Carrom Mixed Doubles"] },
    { id: "red-2", fullName: "Diya Nair", age: 29, gender: "Female", blockName: "REB", events: ["Badminton Doubles"] },
    { id: "red-3", fullName: "Rohan Sen", age: 41, gender: "Male", blockName: "RBB", events: ["Swimming Freestyle"] },
  ],
  green: [
    { id: "green-1", fullName: "Kabir Rao", age: 37, gender: "Male", blockName: "RAB", events: ["Chess Open", "Football 5s"] },
    { id: "green-2", fullName: "Ananya Iyer", age: 31, gender: "Female", blockName: "RC", events: ["Badminton Doubles"] },
    { id: "green-3", fullName: "Neel Thomas", age: 26, gender: "Male", blockName: "RH", events: ["4x100 Relay"] },
  ],
  yellow: [
    { id: "yellow-1", fullName: "Vihaan Kapoor", age: 33, gender: "Male", blockName: "RBA", events: ["Chess Open"] },
    { id: "yellow-2", fullName: "Meera Shah", age: 28, gender: "Female", blockName: "RJ", events: ["Table Tennis Singles"] },
    { id: "yellow-3", fullName: "Samar Jain", age: 39, gender: "Male", blockName: "RD", events: ["Football 5s"] },
  ],
  blue: [
    { id: "blue-1", fullName: "Ishaan Menon", age: 36, gender: "Male", blockName: "REA", events: ["Carrom Mixed Doubles"] },
    { id: "blue-2", fullName: "Tara Krishnan", age: 30, gender: "Female", blockName: "RGB", events: ["Swimming Freestyle"] },
    { id: "blue-3", fullName: "Dev Malhotra", age: 42, gender: "Male", blockName: "RK", events: ["4x100 Relay", "Football 5s"] },
  ],
};

const contributionsBySlug: Record<House["slug"], HouseEventContribution[]> = {
  red: [
    { eventId: "carrom-mixed", eventName: "Carrom Mixed Doubles", category: "Indoor Sport", points: 60, position: 2, resultLabel: "Runner-up" },
    { eventId: "chess-open", eventName: "Chess Open", category: "Mind Sport", points: 70, position: 2, resultLabel: "Finalist" },
    { eventId: "demo-swimming-heats", eventName: "Swimming Heats", category: "Aquatics", points: 185, position: 2, resultLabel: "Strong heats" },
  ],
  green: [
    { eventId: "chess-open", eventName: "Chess Open", category: "Mind Sport", points: 100, position: 1, resultLabel: "Winner" },
    { eventId: "carrom-mixed", eventName: "Carrom Mixed Doubles", category: "Indoor Sport", points: 30, position: 3, resultLabel: "Bronze" },
    { eventId: "demo-swimming-heats", eventName: "Swimming Heats", category: "Aquatics", points: 150, position: 3, resultLabel: "Heat points" },
  ],
  yellow: [
    { eventId: "chess-open", eventName: "Chess Open", category: "Mind Sport", points: 30, position: 3, resultLabel: "Bronze" },
    { eventId: "carrom-mixed", eventName: "Carrom Mixed Doubles", category: "Indoor Sport", points: 30, position: 3, resultLabel: "Semi-finalist" },
    { eventId: "demo-swimming-heats", eventName: "Swimming Heats", category: "Aquatics", points: 185, position: 4, resultLabel: "Heat points" },
  ],
  blue: [
    { eventId: "carrom-mixed", eventName: "Carrom Mixed Doubles", category: "Indoor Sport", points: 100, position: 1, resultLabel: "Winner" },
    { eventId: "chess-open", eventName: "Chess Open", category: "Mind Sport", points: 60, position: 2, resultLabel: "Runner-up" },
    { eventId: "demo-swimming-heats", eventName: "Swimming Heats", category: "Aquatics", points: 180, position: 1, resultLabel: "Heat leader" },
  ],
};

export function getFallbackHouseDetail(slug: House["slug"]): HouseDetail | null {
  const standing = HOUSE_STANDINGS.find((house) => house.slug === slug);
  if (!standing) return null;

  const totalMedals =
    standing.goldMedals + standing.silverMedals + standing.bronzeMedals;

  return {
    ...standing,
    bannerUrl: null,
    motto:
      slug === "blue"
        ? "Calm under pressure, fast on the finish."
        : slug === "red"
          ? "Play hard, finish louder."
          : slug === "green"
            ? "Steady teams, sharp wins."
            : "Bright starts, stronger comebacks.",
    participantCount: participantsBySlug[slug].length * 14,
    participants: participantsBySlug[slug],
    eventContributions: contributionsBySlug[slug],
    achievements: [
      {
        id: `${slug}-rank`,
        title: `Rank ${standing.rank} overall`,
        detail: `${standing.totalPoints} points collected across ${standing.eventsParticipated} events.`,
      },
      {
        id: `${slug}-medals`,
        title: `${totalMedals} medals`,
        detail: `${standing.goldMedals} gold, ${standing.silverMedals} silver, ${standing.bronzeMedals} bronze.`,
      },
      {
        id: `${slug}-blocks`,
        title: `${standing.towers.length} assigned blocks`,
        detail: standing.towers.join(", "),
      },
    ],
    galleryImages: GALLERY_IMAGES,
  };
}
