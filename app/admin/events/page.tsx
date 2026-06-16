import type { Metadata } from "next";

import { AdminEventsManager } from "@/components/sections/admin-events-manager";
import {
  getAdminBlocksData,
  getAdminEvents,
  getAdminEventScores,
} from "@/lib/admin-management-queries";

export const metadata: Metadata = { title: "Manage Events" };

export default async function AdminEventsPage() {
  const [events, scores, { houses }] = await Promise.all([
    getAdminEvents(),
    getAdminEventScores(),
    getAdminBlocksData(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Championship Operations
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">Manage Events</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Upload event posters, publish schedules and rulebooks, add optional
          registration links, and update winner details and house-wise points.
        </p>
      </div>
      <AdminEventsManager events={events} houses={houses} scores={scores} />
    </div>
  );
}
