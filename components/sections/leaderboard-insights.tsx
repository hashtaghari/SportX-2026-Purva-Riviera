import { CalendarClock, Flag, Gauge } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatPoints } from "@/lib/utils";
import type { ChampionshipEvent, HouseStanding } from "@/types/championship";

export function LeaderboardInsights({
  standings,
  events,
}: {
  standings: HouseStanding[];
  events: ChampionshipEvent[];
}) {
  const leader = standings[0];
  const challenger = standings[1];
  const gap = leader && challenger ? leader.totalPoints - challenger.totalPoints : 0;
  const remainingEvents = events.filter((event) => event.status !== "completed").length;
  const maxRemainingSwing = remainingEvents * 50;
  const canBeCaught = challenger ? gap <= maxRemainingSwing : false;

  const insights = [
    {
      icon: Flag,
      label: "Leader Gap",
      value: leader
        ? `${leader.name} +${formatPoints(gap)}`
        : "Awaiting scores",
      detail: challenger
        ? `${challenger.name} is the nearest challenger.`
        : "Scores will appear after the first result.",
    },
    {
      icon: CalendarClock,
      label: "Events Remaining",
      value: remainingEvents,
      detail:
        remainingEvents > 0
          ? `${remainingEvents} events can still change the table.`
          : "All scheduled events are complete.",
    },
    {
      icon: Gauge,
      label: "Can Still Flip",
      value: canBeCaught ? "Yes" : leader ? "Unlikely" : "TBD",
      detail: canBeCaught
        ? `Up to ${formatPoints(maxRemainingSwing)} points remain in play.`
        : "The leader has a strong cushion at current scoring pace.",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {insights.map((insight) => (
        <Card key={insight.label}>
          <CardContent className="flex gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted">
              <insight.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{insight.label}</p>
              <p className="mt-1 text-xl font-semibold">{insight.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{insight.detail}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
