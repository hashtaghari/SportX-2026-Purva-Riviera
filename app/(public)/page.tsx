import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Camera,
  Radio,
  Trophy,
} from "lucide-react";

import { CountdownCard } from "@/components/sections/countdown-card";
import { PointsChart } from "@/components/sections/points-chart";
import { StandingsTable } from "@/components/sections/standings-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAnnouncements,
  getChampionshipEvents,
  getChampionshipStats,
  getFeaturedGalleryImages,
  getHouseStandings,
  getRecentResults,
} from "@/lib/championship-queries";

export default async function HomePage() {
  const [stats, standings, events, announcements, results, galleryImages] =
    await Promise.all([
      getChampionshipStats(),
      getHouseStandings(),
      getChampionshipEvents(),
      getAnnouncements(),
      getRecentResults(),
      getFeaturedGalleryImages(),
    ]);

  const pinnedAnnouncement = announcements[0];
  const upcomingEvents = events
    .filter((event) => event.status !== "completed")
    .slice(0, 4);
  const nextEvent = upcomingEvents[0];

  return (
    <>
      {pinnedAnnouncement ? (
        <section className="border-b border-border/70 bg-primary text-primary-foreground">
          <div className="mx-auto flex w-full max-w-7xl items-start gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
            <Bell className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              <span className="font-semibold">{pinnedAnnouncement.title}</span>
              <span className="opacity-80"> · {pinnedAnnouncement.body}</span>
            </p>
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden">
        <div className="sportx-hero-grid absolute inset-0" aria-hidden="true" />
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
          <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Purva Riviera Inter-House Sports Championship
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
              SportX 2026
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Live house standings, fixtures, registrations, results, and
              championship moments for Red, Green, Yellow, and Blue House.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <Link href="/register">
                  Register <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/#standings">View Leaderboard</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/events">Explore Events</Link>
              </Button>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Participants", stats.participants],
                ["Completed", stats.completedEvents],
                ["Remaining", stats.remainingEvents],
                ["Leader", stats.leadingHouse],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border bg-card/78 p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="overflow-hidden rounded-lg border bg-card shadow-2xl shadow-slate-950/15">
              <Image
                src="/images/sportx-championship-collage.png"
                alt="SportX 2026 championship sports collage"
                width={1200}
                height={900}
                priority
                className="aspect-[4/3] w-full object-cover"
              />
              {nextEvent ? (
                <div className="grid gap-4 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Next event</p>
                      <p className="font-semibold">{nextEvent.name}</p>
                    </div>
                    <Badge variant="outline">
                      {new Date(nextEvent.startsAt).toLocaleDateString("en-IN")}
                    </Badge>
                  </div>
                  <CountdownCard targetDate={nextEvent.startsAt} />
                </div>
              ) : (
                <div className="p-5">
                  <EmptyState icon={CalendarDays} title="Event schedule coming soon" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        id="standings"
        className="mx-auto grid scroll-mt-24 w-full max-w-7xl gap-6 px-4 pb-16 sm:px-6 xl:grid-cols-[0.72fr_1.28fr] lg:px-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Points Distribution</CardTitle>
            <CardDescription>Overall points accumulated by house.</CardDescription>
          </CardHeader>
          <CardContent>
            {standings.length ? (
              <PointsChart standings={standings} />
            ) : (
              <EmptyState icon={Trophy} title="Leaderboard opens soon" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Ranking Table</CardTitle>
            <CardDescription>
              Rank, points, medals, participation, and current position.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {standings.length ? (
              <StandingsTable standings={standings} showPointProgress={false} />
            ) : (
              <EmptyState icon={Trophy} title="No standings yet" />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Fixtures and registration windows.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {upcomingEvents.length ? (
              upcomingEvents.map((event) => {
                const eventCard = (
                  <div className="rounded-md border p-4 transition hover:border-foreground/25 hover:bg-muted/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.venue}
                      </p>
                    </div>
                    <Badge
                      variant={
                        event.registrationStatus === "open" ? "success" : "warning"
                      }
                    >
                      {event.registrationStatus}
                    </Badge>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(event.startsAt).toLocaleString("en-IN")}
                  </p>
                  {event.registrationStatus === "open" ? (
                    <p className="mt-3 text-sm font-medium text-accent">
                      Register for this event <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                    </p>
                  ) : null}
                </div>
                );

                return event.registrationStatus === "open" ? (
                  <Link key={event.id} href={`/register?event=${event.id}`}>
                    {eventCard}
                  </Link>
                ) : (
                  <div key={event.id}>{eventCard}</div>
                );
              })
            ) : (
              <EmptyState icon={CalendarDays} title="No upcoming events" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
            <CardDescription>Latest scoring updates.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {results.length ? (
              results.slice(0, 5).map((result) => (
                <div key={result.id} className="rounded-md border p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{ backgroundColor: result.houseColor }}
                    />
                    <div>
                      <p className="font-medium">{result.eventName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {result.summary}
                      </p>
                      <p className="mt-2 text-sm font-semibold">
                        {result.houseName} +{result.points} points
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={Radio} title="No results posted yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Championship Pulse</CardTitle>
            <CardDescription>Quick public signals.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {announcements.length ? (
              announcements.slice(0, 4).map((announcement) => (
                <div key={announcement.id} className="rounded-md border p-4">
                  <div className="flex items-start gap-3">
                    <Bell className="mt-0.5 h-4 w-4 text-accent" />
                    <div>
                      <p className="font-medium">{announcement.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {announcement.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={Bell} title="No announcements yet" />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Featured Gallery
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              Moments From The Championship
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/events">Explore Events</Link>
          </Button>
        </div>
        {galleryImages.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {galleryImages.slice(0, 3).map((image) => (
              <figure key={image.id} className="overflow-hidden rounded-lg border bg-card">
                <div className="relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={800}
                    height={600}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <span
                    className="absolute left-4 top-4 h-3 w-12 rounded-full"
                    style={{ backgroundColor: image.houseColor }}
                  />
                </div>
                <figcaption className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                  <Camera className="h-4 w-4" />
                  {image.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <EmptyState icon={Camera} title="Gallery opens after uploads" />
        )}
      </section>
    </>
  );
}

function EmptyState({
  icon: Icon,
  title,
}: {
  icon: typeof Trophy;
  title: string;
}) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center text-muted-foreground">
      <Icon className="h-6 w-6" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium">{title}</p>
    </div>
  );
}
