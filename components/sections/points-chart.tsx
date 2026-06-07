"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { HouseStanding } from "@/types/championship";

export function PointsChart({ standings }: { standings: HouseStanding[] }) {
  const [mounted, setMounted] = useState(false);
  const data = standings.map((house) => ({
    name: house.name.replace(" House", ""),
    points: house.totalPoints,
    fill: house.color,
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-56 min-w-0 w-full sm:h-72">
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={32} />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="points" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-md bg-muted" />
      )}
    </div>
  );
}
