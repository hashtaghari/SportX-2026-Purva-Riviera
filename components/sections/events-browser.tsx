"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, MapPin, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEventDateTime } from "@/lib/date-utils";
import { sortEventsByImpending } from "@/lib/event-ordering";
import type { ChampionshipEvent } from "@/types/championship";

type EventStatusFilter = "all" | ChampionshipEvent["status"];

const filters: Array<{ label: string; value: EventStatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
];

export function EventsBrowser({ events }: { events: ChampionshipEvent[] }) {
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>("all");

  const visibleEvents = useMemo(() => {
    const filtered =
      statusFilter === "all"
        ? events
        : events.filter((event) => event.status === statusFilter);
    return sortEventsByImpending(filtered);
  }, [events, statusFilter]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          Event status
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              variant={statusFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleEvents.length ? (
          visibleEvents.map((event) => (
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
                  <p className="mt-2 text-sm">{formatEventDateTime(event.startsAt)}</p>
                  <div className="mt-5 flex items-center justify-between rounded-md border px-4 py-2 text-sm font-medium">
                    View Event Details
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <CalendarDays className="h-7 w-7 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No events found</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Try a different status filter or check back after events are published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
