import type { ChampionshipEvent } from "@/types/championship";

export function sortEventsByImpending<T extends Pick<ChampionshipEvent, "startsAt" | "status">>(
  events: T[],
) {
  const now = Date.now();

  return [...events].sort((eventA, eventB) => {
    const startsA = new Date(eventA.startsAt).getTime();
    const startsB = new Date(eventB.startsAt).getTime();
    const isPastA = eventA.status !== "ongoing" && startsA < now;
    const isPastB = eventB.status !== "ongoing" && startsB < now;

    if (isPastA !== isPastB) return isPastA ? 1 : -1;
    if (isPastA && isPastB) return startsB - startsA;
    return startsA - startsB;
  });
}
