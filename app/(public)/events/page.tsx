import type { Metadata } from "next";
import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChampionshipEvents } from "@/lib/championship-queries";

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
        {events.map((event) => (
          <Card key={event.id}>
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
                {new Date(event.startsAt).toLocaleString("en-IN")}
              </p>
              <Badge
                className="mt-4"
                variant={event.registrationStatus === "open" ? "success" : "warning"}
              >
                Registration {event.registrationStatus}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
