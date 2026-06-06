"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";

import type { PointsHistoryPoint } from "@/types/championship";

export function PointsHistoryChart({
  history,
}: {
  history: PointsHistoryPoint[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!history.length) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-md border border-dashed text-center text-muted-foreground">
        <Activity className="h-6 w-6" />
        <p className="mt-3 text-sm font-medium">Points history appears after scores are recorded.</p>
      </div>
    );
  }

  const data = history.map((point) => ({
    ...point,
    label: point.eventName,
  }));

  return (
    <div className="h-72 w-full">
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 14, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="Red" stroke="#dc2626" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Green" stroke="#16a34a" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Yellow" stroke="#eab308" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Blue" stroke="#2563eb" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-md bg-muted" />
      )}
    </div>
  );
}
