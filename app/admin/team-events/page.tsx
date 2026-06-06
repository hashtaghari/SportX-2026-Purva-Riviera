import type { Metadata } from "next";

import { TeamResultManager } from "@/components/sections/team-result-manager";
import { getAdminTeamEvents } from "@/lib/team-registration-queries";

export const metadata: Metadata = {
  title: "Team Events",
};

export default async function AdminTeamEventsPage() {
  const events = await getAdminTeamEvents();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Team Events
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Registration & Result Allocation
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Configure team limits, select placed teams, and let SportX divide points
          across the houses represented by their members.
        </p>
      </div>
      <TeamResultManager events={events} />
    </div>
  );
}
