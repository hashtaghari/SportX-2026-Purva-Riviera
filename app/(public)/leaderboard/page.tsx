import type { Metadata } from "next";
import { BarChart3, Medal, Trophy } from "lucide-react";

import { HouseRankingCards } from "@/components/sections/house-ranking-cards";
import { LeaderboardInsights } from "@/components/sections/leaderboard-insights";
import { MedalTable } from "@/components/sections/medal-table";
import { PointsChart } from "@/components/sections/points-chart";
import { PointsHistoryChart } from "@/components/sections/points-history-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPoints } from "@/lib/utils";
import {
  getChampionshipEvents,
  getHouseStandings,
  getMedalTable,
  getPointsHistory,
} from "@/lib/championship-queries";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export default async function LeaderboardPage() {
  const [standings, medals, events, history] = await Promise.all([
    getHouseStandings(),
    getMedalTable(),
    getChampionshipEvents(),
    getPointsHistory(),
  ]);

  const leader = standings[0];
  const challenger = standings[1];
  const leaderGap =
    leader && challenger ? leader.totalPoints - challenger.totalPoints : 0;
  const remainingEvents = events.filter((event) => event.status !== "completed").length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Overall Leaderboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">
            House Championship Standings
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Live rankings from event scores and medal results across Red,
            Green, Yellow, and Blue House.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          <HeroMetric
            icon={Trophy}
            label="Current Leader"
            value={leader?.name ?? "TBD"}
          />
          <HeroMetric
            icon={BarChart3}
            label="Leader Gap"
            value={leader ? formatPoints(leaderGap) : "0"}
          />
          <HeroMetric
            icon={Medal}
            label="Events Remaining"
            value={remainingEvents}
          />
        </div>
      </div>

      <div className="grid gap-6">
        <LeaderboardInsights standings={standings} events={events} />
        <HouseRankingCards standings={standings} />

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>Points Distribution</CardTitle>
              <CardDescription>Total points accumulated by house.</CardDescription>
            </CardHeader>
            <CardContent>
              <PointsChart standings={standings} />
            </CardContent>
          </Card>

          <MedalTable medals={medals} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Points History</CardTitle>
            <CardDescription>
              Cumulative house movement across scored events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PointsHistoryChart history={history} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HeroMetric({
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
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
