import type { Metadata } from "next";

import { EventsBrowser } from "@/components/sections/events-browser";
import { getChampionshipEvents } from "@/lib/championship-queries";
import { sortEventsByImpending } from "@/lib/event-ordering";

export const metadata: Metadata = {
  title: "Events",
};

export default async function EventsPage() {
  const events = sortEventsByImpending(await getChampionshipEvents());

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Championship Events
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Sport Schedule
        </h1>
      </div>
      <EventsBrowser events={events} />
    </div>
  );
}
