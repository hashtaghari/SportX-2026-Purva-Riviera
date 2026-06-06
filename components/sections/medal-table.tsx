import { Award } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MedalStanding } from "@/types/championship";

export function MedalTable({ medals }: { medals: MedalStanding[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medal Table</CardTitle>
      </CardHeader>
      <CardContent>
        {medals.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 font-medium">Rank</th>
                  <th className="py-3 font-medium">House</th>
                  <th className="py-3 text-center font-medium">Gold</th>
                  <th className="py-3 text-center font-medium">Silver</th>
                  <th className="py-3 text-center font-medium">Bronze</th>
                  <th className="py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {medals.map((house) => (
                  <tr key={house.houseId} className="border-b last:border-0">
                    <td className="py-4 font-semibold">#{house.rank}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: house.color }}
                        />
                        <span className="font-medium">{house.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-semibold text-house-yellow">
                      {house.goldMedals}
                    </td>
                    <td className="py-4 text-center">{house.silverMedals}</td>
                    <td className="py-4 text-center">{house.bronzeMedals}</td>
                    <td className="py-4 text-right font-semibold">
                      {house.totalMedals}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed text-center text-muted-foreground">
            <Award className="h-6 w-6" />
            <p className="mt-3 text-sm font-medium">No medals awarded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
