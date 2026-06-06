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

export const HOUSES: House[] = [
  {
    id: "house-red",
    slug: "red",
    name: "Red House",
    color: "#dc2626",
    accentClass: "bg-house-red",
    captain: null,
    viceCaptain: null,
    towers: [],
  },
  {
    id: "house-green",
    slug: "green",
    name: "Green House",
    color: "#16a34a",
    accentClass: "bg-house-green",
    captain: null,
    viceCaptain: null,
    towers: [],
  },
  {
    id: "house-yellow",
    slug: "yellow",
    name: "Yellow House",
    color: "#eab308",
    accentClass: "bg-house-yellow",
    captain: null,
    viceCaptain: null,
    towers: [],
  },
  {
    id: "house-blue",
    slug: "blue",
    name: "Blue House",
    color: "#2563eb",
    accentClass: "bg-house-blue",
    captain: null,
    viceCaptain: null,
    towers: [],
  },
];

export const BLOCK_TO_HOUSE: Record<string, House> = {};
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

export const MEDAL_TABLE: MedalStanding[] = HOUSES.map((house, index) => ({
  rank: index + 1,
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
    bannerUrl: null,
    motto: null,
    participantCount: 0,
    participants: [],
    eventContributions: [],
    achievements: [],
    galleryImages: [],
  };
}
