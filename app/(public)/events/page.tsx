import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChampionshipEvents } from "@/lib/championship-queries";
import { formatEventDateTime } from "@/lib/date-utils";

export const metadata: Metadata = {
  title: "Events",
};

export default async function EventsPage() {
  const events = await getChampionshipEvents();

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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.length ? events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} className="block">
          <Card className="h-full overflow-hidden transition hover:border-foreground/25 hover:shadow-md">
            <div
              className="aspect-[16/9] bg-muted bg-cover bg-center"
              style={{
                backgroundImage: `url(${event.posterUrl ?? "/images/sportx-championship-collage.png"})`,
              }}
            />
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle>{event.name}</CardTitle>
                <Badge variant={event.status === "completed" ? "secondary" : "outline"}>
                  {event.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{event.category}</p>
              <p className="mt-4 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                {event.venue}
              </p>
              <p className="mt-2 text-sm">
                {formatEventDateTime(event.startsAt)}
              </p>
              <div className="mt-5 flex items-center justify-between rounded-md border px-4 py-2 text-sm font-medium">
                View Event Details
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
          </Link>
        )) : (
          <div className="col-span-full flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <CalendarDays className="h-7 w-7 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No events published yet</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              The SportX schedule will appear here as soon as the admin publishes the
              first event.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
