export type HouseSlug = "red" | "green" | "yellow" | "blue";

export type House = {
  id: string;
  slug: HouseSlug;
  name: string;
  color: string;
  accentClass: string;
  captain: string | null;
  viceCaptain: string | null;
  towers: string[];
};

export type HouseStanding = House & {
  rank: number;
  totalPoints: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  eventsParticipated: number;
  pointsGap: number;
  trend: "up" | "down" | "steady";
};

export type ChampionshipEvent = {
  id: string;
  name: string;
  category: string;
  venue: string;
  startsAt: string;
  status: "upcoming" | "ongoing" | "completed";
  registrationStatus: "open" | "closed" | "waitlist";
  posterUrl?: string | null;
};

export type EventHouseScore = {
  houseId: string;
  houseName: string;
  houseColor: string;
  points: number;
  position: number | null;
  resultLabel: string | null;
};

export type EventDetail = ChampionshipEvent & {
  description: string | null;
  rules: string | null;
  endsAt: string | null;
  winnerDetails: string | null;
  scores: EventHouseScore[];
};

export type RegistrationBlock = {
  id: string;
  name: string;
  houseId: string;
  houseName: string;
  houseColor: string;
};

export type TeamRegistrationEvent = ChampionshipEvent & {
  databaseId: string;
  registrationType: "individual" | "team";
  minimumTeamSize: number;
  maximumTeamSize: number;
  maximumTeams: number | null;
};

export type ChampionshipStats = {
  participants: number;
  completedEvents: number;
  remainingEvents: number;
  leadingHouse: string;
};

export type RegistrationStatus = "pending" | "approved" | "rejected" | "waitlisted";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  publishedAt: string | null;
};

export type RecentResult = {
  id: string;
  eventName: string;
  summary: string;
  houseName: string;
  houseColor: string;
  points: number;
  occurredAt: string;
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  houseColor: string;
  featured: boolean;
};

export type MedalStanding = {
  rank: number;
  houseId: string;
  slug: HouseSlug;
  name: string;
  color: string;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  totalMedals: number;
};

export type PointsHistoryPoint = {
  eventId: string;
  eventName: string;
  eventDate: string;
  Red: number;
  Green: number;
  Yellow: number;
  Blue: number;
};

export type HouseParticipant = {
  id: string;
  fullName: string;
  age: number | null;
  gender: string | null;
  blockName: string;
  events: string[];
};

export type HouseEventContribution = {
  eventId: string;
  eventName: string;
  category: string | null;
  points: number;
  position: number | null;
  resultLabel: string | null;
};

export type HouseAchievement = {
  id: string;
  title: string;
  detail: string;
};

export type HouseDetail = HouseStanding & {
  bannerUrl: string | null;
  motto: string | null;
  participantCount: number;
  participants: HouseParticipant[];
  eventContributions: HouseEventContribution[];
  achievements: HouseAchievement[];
  galleryImages: GalleryImage[];
};
