import { Toaster } from "sonner";

import { SiteHeader } from "@/components/layout/site-header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="sportx-surface flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/80 bg-card/45">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 text-sm sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <p className="font-semibold text-foreground">SportX 2026</p>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Purva Riviera Inter-House Sports Championship: live standings,
              registrations, schedules, announcements, and results.
            </p>
          </div>
          <div className="grid gap-3 md:justify-items-end">
            <div className="grid w-40 grid-cols-4 gap-2">
              <span className="h-2 rounded-full bg-house-red" />
              <span className="h-2 rounded-full bg-house-green" />
              <span className="h-2 rounded-full bg-house-yellow" />
              <span className="h-2 rounded-full bg-house-blue" />
            </div>
            <p className="text-muted-foreground">Red · Green · Yellow · Blue</p>
          </div>
        </div>
      </footer>
      <Toaster richColors position="top-right" />
    </div>
  );
}
