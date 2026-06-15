import type {
  Announcement,
  ChampionshipEvent,
  ChampionshipStats,
  GalleryImage,
  House,
  HouseDetail,
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
    name: "Red Bulls",
    color: "#ed1c24",
    accentClass: "bg-house-red",
    captain: null,
    viceCaptain: null,
    towers: houseBlocks.red,
  },
  {
    id: "house-green",
    slug: "green",
    name: "Green Eagles",
    color: "#286337",
    accentClass: "bg-house-green",
    captain: null,
    viceCaptain: null,
    towers: houseBlocks.green,
  },
  {
    id: "house-yellow",
    slug: "yellow",
    name: "Yellow Tigers",
    color: "#ffd900",
    accentClass: "bg-house-yellow",
    captain: null,
    viceCaptain: null,
    towers: houseBlocks.yellow,
  },
  {
    id: "house-blue",
    slug: "blue",
    name: "Blue Sharks",
    color: "#185d91",
    accentClass: "bg-house-blue",
    captain: null,
    viceCaptain: null,
    towers: houseBlocks.blue,
  },
];

export const BLOCK_TO_HOUSE: Record<string, House> = Object.fromEntries(
  HOUSES.flatMap((house) => house.towers.map((tower) => [tower, house])),
);

export const EVENTS: ChampionshipEvent[] = [];

export const HOUSE_STANDINGS: HouseStanding[] = HOUSES.map((house, index) => ({
  ...house,
  rank: index + 1,
  totalPoints: 0,
  goldMedals: 0,
  silverMedals: 0,
  bronzeMedals: 0,
  eventsParticipated: 0,
  pointsGap: 0,
  trend: "steady",
}));

export const CHAMPIONSHIP_STATS: ChampionshipStats = {
  participants: 0,
  completedEvents: 0,
  remainingEvents: 0,
  leadingHouse: "TBD",
};

export const ANNOUNCEMENTS: Announcement[] = [];
export const RECENT_RESULTS: RecentResult[] = [];
export const GALLERY_IMAGES: GalleryImage[] = [];
export const POINTS_HISTORY: PointsHistoryPoint[] = [];

export const MEDAL_TABLE: MedalStanding[] = HOUSE_STANDINGS.map((house) => ({
  rank: house.rank,
  houseId: house.id,
  slug: house.slug,
  name: house.name,
  color: house.color,
  goldMedals: 0,
  silverMedals: 0,
  bronzeMedals: 0,
  totalMedals: 0,
}));

export function getFallbackHouseDetail(slug: House["slug"]): HouseDetail | null {
  const standing = HOUSE_STANDINGS.find((house) => house.slug === slug);
  if (!standing) return null;

  return {
    ...standing,
    bannerUrl: `/images/houses/${slug}-${
      slug === "red"
        ? "bulls"
        : slug === "green"
          ? "eagles"
          : slug === "yellow"
            ? "tigers"
            : "sharks"
    }.jpg`,
    motto: null,
    participantCount: 0,
    participants: [],
    eventContributions: [],
    achievements: [],
    galleryImages: [],
  };
}
