import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  Clock3,
  FileText,
  MapPin,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getEventDetail } from "@/lib/championship-queries";
import {
  PARTICIPANT_REGISTRATION_URL,
  VOLUNTEER_REGISTRATION_URL,
} from "@/lib/registration-links";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventDetail(slug);
  return {
    title: event?.name ?? "Event",
    description: event?.description ?? "SportX 2026 event details and rulebook.",
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventDetail(slug);
  if (!event) notFound();
  const posterImage = event.posterUrl ?? "/images/sportx-championship-collage.png";

  const posterHero = (
    <div
      className={`relative min-h-[320px] bg-muted bg-cover bg-center sm:min-h-[460px] ${
        event.posterUrl ? "cursor-zoom-in" : ""
      }`}
      style={{
        backgroundImage: `linear-gradient(to top, rgba(2,6,23,.88), rgba(2,6,23,.12)), url(${posterImage})`,
      }}
    >
      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-white/35 text-white">
            {event.category}
          </Badge>
          <Badge variant="outline" className="border-white/35 text-white">
            {event.status}
          </Badge>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-6xl">
          {event.name}
        </h1>
        {event.posterUrl ? (
          <p className="mt-3 text-sm text-white/80">Click poster to view full size</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-5">
        <Link href="/events">
          <ChevronLeft className="h-4 w-4" />
          All Events
        </Link>
      </Button>

      <section className="overflow-hidden rounded-lg border bg-card">
        {event.posterUrl ? (
          <Link href={event.posterUrl} target="_blank" rel="noreferrer">
            {posterHero}
          </Link>
        ) : (
          posterHero
        )}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line leading-7 text-muted-foreground">
                {event.description ?? "More event details will be published shortly."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rulebook</CardTitle>
              <CardDescription>Official event rules and participation instructions.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {event.rules ? (
                <p className="whitespace-pre-line leading-7 text-muted-foreground">
                  {event.rules}
                </p>
              ) : event.rulebookUrl ? null : (
                <p className="leading-7 text-muted-foreground">
                  The official rulebook will be published shortly.
                </p>
              )}
              {event.rulebookUrl ? (
                <Button asChild variant="outline" className="w-fit">
                  <Link href={event.rulebookUrl} target="_blank" rel="noreferrer">
                    <FileText className="h-4 w-4" />
                    View Rulebook PDF
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          {event.winnerDetails || event.scores.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Results & Points
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {event.winnerDetails ? (
                  <p className="whitespace-pre-line rounded-md border bg-muted/40 p-4 leading-7">
                    {event.winnerDetails}
                  </p>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  {event.scores.map((score) => (
                    <div key={score.houseId} className="rounded-md border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ background: score.houseColor }}
                          />
                          <div>
                            <p className="font-medium">{score.houseName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {score.resultLabel ?? "Result recorded"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{score.points} pts</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {score.position ? `#${score.position}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <Info icon={CalendarDays} label="Date" value={new Date(event.startsAt).toLocaleDateString("en-IN", { dateStyle: "full" })} />
              <Info icon={Clock3} label="Start time" value={new Date(event.startsAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} />
              <Info icon={MapPin} label="Venue" value={event.venue} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SportX Registration</CardTitle>
              <CardDescription>Registration is managed through the official Google Forms.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild>
                <Link
                  href={event.registrationLink ?? PARTICIPANT_REGISTRATION_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {event.registrationLink ? "Register for This Event" : "Participant Form"}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              {event.registrationLink ? (
                <Button asChild variant="outline">
                  <Link href={PARTICIPANT_REGISTRATION_URL} target="_blank" rel="noreferrer">
                    General Participant Form
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href={VOLUNTEER_REGISTRATION_URL} target="_blank" rel="noreferrer">
                  Volunteer Form
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-medium">{value}</p>
      </div>
    </div>
  );
}
