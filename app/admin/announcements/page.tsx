import type { Metadata } from "next";

import { AdminAnnouncementsManager } from "@/components/sections/admin-announcements-manager";
import { getAdminAnnouncements } from "@/lib/admin-management-queries";

export const metadata: Metadata = { title: "Manage Announcements" };

export default async function AdminAnnouncementsPage() {
  const announcements = await getAdminAnnouncements();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Championship Pulse
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">Announcements</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Publish updates for the homepage pulse section. Pinned announcements
          appear first.
        </p>
      </div>
      <AdminAnnouncementsManager announcements={announcements} />
    </div>
  );
}
