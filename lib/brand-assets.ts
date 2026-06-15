import type { HouseSlug } from "@/types/championship";

export const SPORTX_LOGO_LIGHT =
  "/images/brand/sportx-2026-logo-transparent-v2.png";
export const SPORTX_LOGO_DARK =
  "/images/brand/sportx-2026-logo-transparent-dark-v2.png";
export const PARTICIPANT_REGISTRATION_QR =
  "/images/brand/participant-registration-qr.jpg";

export const HOUSE_BRANDS: Record<
  HouseSlug,
  { name: string; crest: string; color: string }
> = {
  red: {
    name: "Red Bulls",
    crest: "/images/houses/red-bulls.jpg",
    color: "#ed1c24",
  },
  green: {
    name: "Green Eagles",
    crest: "/images/houses/green-eagles.jpg",
    color: "#286337",
  },
  yellow: {
    name: "Yellow Tigers",
    crest: "/images/houses/yellow-tigers.jpg",
    color: "#ffd900",
  },
  blue: {
    name: "Blue Sharks",
    crest: "/images/houses/blue-sharks.jpg",
    color: "#185d91",
  },
};

export function getHouseBrand(slug: HouseSlug) {
  return HOUSE_BRANDS[slug];
}
