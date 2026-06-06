import { Medal, Trophy } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { formatPoints } from "@/lib/utils";
import type { HouseStanding } from "@/types/championship";

export function HouseRankingCards({ standings }: { standings: HouseStanding[] }) {
  const leaderPoints = standings[0]?.totalPoints ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {standings.map((house) => {
        const progress = leaderPoints
          ? Math.round((house.totalPoints / leaderPoints) * 100)
          : 0;

        return (
          <Card key={house.id} className="overflow-hidden">
            <div className="h-1.5" style={{ backgroundColor: house.color }} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rank #{house.rank}</p>
                  <Link
                    href={`/houses/${house.slug}`}
                    className="mt-2 block text-xl font-semibold hover:underline"
                  >
                    {house.name}
                  </Link>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  {house.rank === 1 ? (
                    <Trophy className="h-5 w-5 text-accent" />
                  ) : (
                    <Medal className="h-5 w-5" />
                  )}
                </span>
              </div>
              <p className="mt-5 text-3xl font-semibold">
                {formatPoints(house.totalPoints)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {house.pointsGap === 0
                  ? "Current leader"
                  : `${formatPoints(house.pointsGap)} points behind`}
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: house.color,
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <MedalMetric label="Gold" value={house.goldMedals} />
                <MedalMetric label="Silver" value={house.silverMedals} />
                <MedalMetric label="Bronze" value={house.bronzeMedals} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MedalMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background/60 p-2">
      <p className="font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
