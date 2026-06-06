"use client";

import { useEffect, useState } from "react";

const target = new Date("2026-12-12T08:00:00+05:30").getTime();

function getCountdown() {
  const distance = Math.max(target - Date.now(), 0);
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
}

export function CountdownCard() {
  const [time, setTime] = useState(getCountdown);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        ["Days", time.days],
        ["Hours", time.hours],
        ["Mins", time.minutes],
        ["Secs", time.seconds],
      ].map(([label, value]) => (
        <div key={label} className="rounded-md border bg-background/72 p-3 text-center">
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
