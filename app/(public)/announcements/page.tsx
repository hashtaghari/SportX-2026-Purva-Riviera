import type { Metadata } from "next";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAnnouncements } from "@/lib/championship-queries";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Official SportX 2026 championship announcements.",
};

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Championship Pulse
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Announcements
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Official updates, reminders, and championship notices from the SportX
          organizing team.
        </p>
      </div>

      {announcements.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="grid gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Bell className="h-5 w-5 text-accent" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold">{announcement.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {announcement.body}
                      </p>
                    </div>
                  </div>
                  {announcement.pinned ? <Badge variant="secondary">Pinned</Badge> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <Bell className="h-7 w-7 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No announcements yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Updates will appear here once the organizing team publishes them.
          </p>
        </div>
      )}
    </div>
  );
}
