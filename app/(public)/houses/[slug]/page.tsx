import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Award,
  Building2,
  Camera,
  ChevronLeft,
  Medal,
  Shield,
  Trophy,
  Users,
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
import { getHouseDetail } from "@/lib/championship-queries";
import { formatPoints } from "@/lib/utils";
import type { HouseSlug } from "@/types/championship";

const HOUSE_SLUGS = ["red", "green", "yellow", "blue"] as const;

type HousePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return HOUSE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: HousePageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isHouseSlug(slug)) {
    return { title: "House" };
  }

  const house = await getHouseDetail(slug);

  return {
    title: house ? house.name : "House",
    description: house
      ? `${house.name} profile, participants, points, medals, towers, achievements, and gallery for SportX 2026.`
      : "SportX 2026 house profile.",
  };
}

export default async function HouseDetailPage({ params }: HousePageProps) {
  const { slug } = await params;

  if (!isHouseSlug(slug)) {
    notFound();
  }

  const house = await getHouseDetail(slug);

  if (!house) {
    notFound();
  }

  const totalMedals =
    house.goldMedals + house.silverMedals + house.bronzeMedals;
  const bannerSrc = house.bannerUrl ?? "/images/sportx-championship-collage.png";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/#standings">
          <ChevronLeft className="h-4 w-4" />
          Standings
        </Link>
      </Button>

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="relative min-h-[340px] sm:min-h-[420px]">
          <Image
            src={bannerSrc}
            alt={`${house.name} SportX 2026 banner`}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/48 to-black/12" />
          <div className="relative z-10 grid min-h-[340px] content-end px-5 py-8 text-white sm:min-h-[420px] sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <Badge variant="outline" className="border-white/30 text-white">
                Rank #{house.rank || "TBD"}
              </Badge>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-6xl">
                {house.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
                {house.motto ?? "SportX 2026 championship house profile"}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span
                  className="h-3 w-20 rounded-full"
                  style={{ backgroundColor: house.color }}
                />
                <span className="h-3 w-12 rounded-full bg-white/25" />
                <span className="h-3 w-8 rounded-full bg-white/15" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Trophy} label="Total Points" value={formatPoints(house.totalPoints)} />
        <MetricCard icon={Medal} label="Medals" value={totalMedals} />
        <MetricCard icon={Users} label="Participants" value={house.participantCount} />
        <MetricCard icon={Shield} label="Events Participated" value={house.eventsParticipated} />
      </section>

      <section className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>House Leadership</CardTitle>
              <CardDescription>Captain details from Supabase.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <InfoRow label="Captain" value={house.captain ?? "To be announced"} />
              <InfoRow label="Vice Captain" value={house.viceCaptain ?? "To be announced"} />
              <InfoRow label="House Color" value={house.color} swatch={house.color} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Towers</CardTitle>
              <CardDescription>Blocks mapped to {house.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              {house.towers.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {house.towers.map((tower) => (
                    <div key={tower} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {tower}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No towers assigned yet." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Highlights from points and medals.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {house.achievements.length ? (
                house.achievements.map((achievement) => (
                  <div key={achievement.id} className="rounded-md border p-4">
                    <div className="flex items-start gap-3">
                      <Award className="mt-0.5 h-4 w-4 text-accent" />
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {achievement.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="Achievements will appear after results are posted." />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Event-Wise Points Contribution</CardTitle>
              <CardDescription>Computed from event score records.</CardDescription>
            </CardHeader>
            <CardContent>
              {house.eventContributions.length ? (
                <>
                <div className="grid gap-3 sm:hidden">
                  {house.eventContributions.map((event) => (
                    <div key={event.eventId} className="rounded-md border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">{event.eventName}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {event.category ?? "SportX"}
                          </p>
                          {event.resultLabel ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {event.resultLabel}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPoints(event.points)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {event.position ? `#${event.position}` : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[620px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-3 font-medium">Event</th>
                        <th className="py-3 font-medium">Category</th>
                        <th className="py-3 text-center font-medium">Position</th>
                        <th className="py-3 text-right font-medium">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {house.eventContributions.map((event) => (
                        <tr key={event.eventId} className="border-b last:border-0">
                          <td className="py-4">
                            <p className="font-medium">{event.eventName}</p>
                            {event.resultLabel ? (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {event.resultLabel}
                              </p>
                            ) : null}
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {event.category ?? "SportX"}
                          </td>
                          <td className="py-4 text-center">
                            {event.position ? `#${event.position}` : "-"}
                          </td>
                          <td className="py-4 text-right font-semibold">
                            {formatPoints(event.points)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              ) : (
                <EmptyState text="No event points recorded yet." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <CardDescription>Public participant roster for {house.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              {house.participants.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {house.participants.map((participant) => (
                    <div key={participant.id} className="rounded-md border p-4">
                      <p className="font-medium">{participant.fullName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {participant.blockName}
                        {participant.age ? ` · Age ${participant.age}` : ""}
                        {participant.gender ? ` · ${participant.gender}` : ""}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {participant.events.length ? (
                          participant.events.slice(0, 3).map((eventName) => (
                            <Badge key={eventName} variant="outline">
                              {eventName}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary">No approved events</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No public participants listed yet." />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>House Gallery</CardTitle>
            <CardDescription>Featured images associated with {house.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            {house.galleryImages.length ? (
              <div className="grid gap-4 md:grid-cols-3">
                {house.galleryImages.slice(0, 6).map((image) => (
                  <figure key={image.id} className="overflow-hidden rounded-lg border bg-background">
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
                        style={{ backgroundColor: house.color }}
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
              <EmptyState text="House gallery opens after uploads." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function isHouseSlug(slug: string): slug is HouseSlug {
  return HOUSE_SLUGS.includes(slug as HouseSlug);
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-muted">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  swatch,
}: {
  label: string;
  value: string;
  swatch?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border p-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium">
        {swatch ? (
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: swatch }} />
        ) : null}
        {value}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
