"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ChampionshipStats } from "@/types/championship";

export function ChampionshipHero({ stats }: { stats: ChampionshipStats }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Purva Riviera Championship
          </p>
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            SportX 2026
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            A production-ready championship platform for registrations, live
            house standings, event schedules, results, and admin operations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="accent">
              <Link href="/register">
                Register for events <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/leaderboard">
                View leaderboard <BarChart3 className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="rounded-lg border border-border bg-card/78 p-5 shadow-2xl shadow-slate-950/10 backdrop-blur"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Participants", stats.participants],
              ["Completed", stats.completedEvents],
              ["Remaining", stats.remainingEvents],
              ["Leader", stats.leadingHouse],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border bg-background/72 p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md border bg-primary p-5 text-primary-foreground">
            <div className="flex items-center gap-2 text-sm opacity-80">
              <CalendarDays className="h-4 w-4" />
              Championship countdown
            </div>
            <p className="mt-3 text-3xl font-semibold">January 2026</p>
            <p className="mt-2 text-sm opacity-80">
              Opening fixtures begin with cricket, badminton, and chess.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {["bg-house-red", "bg-house-green", "bg-house-yellow", "bg-house-blue"].map(
              (item) => (
                <div key={item} className={`h-2 rounded-full ${item}`} />
              ),
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
