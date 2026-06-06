import type { Metadata } from "next";
import { ClipboardList, Medal, Trophy, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getChampionshipEvents,
  getChampionshipStats,
  getHouseStandings,
} from "@/lib/championship-queries";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const [stats, standings, events] = await Promise.all([
    getChampionshipStats(),
    getHouseStandings(),
    getChampionshipEvents(),
  ]);

  const cards = [
    { label: "Participants", value: stats.participants, icon: Users },
    { label: "Events", value: events.length, icon: ClipboardList },
    { label: "Leader", value: standings[0]?.name ?? "TBD", icon: Trophy },
    { label: "Completed", value: stats.completedEvents, icon: Medal },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Admin Portal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Championship Operations
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-muted">
                <card.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-xl font-semibold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Operations Queue</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>Registration approvals</p>
            <p>Waitlist decisions</p>
            <p>Score entries</p>
            <p>Fixture updates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>No activity logged yet.</p>
            <p>Score changes, approvals, uploads, and announcements will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
