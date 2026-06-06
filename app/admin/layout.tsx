import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { AdminSessionGate } from "@/components/sections/admin-session-gate";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5" />
            SportX Admin
          </Link>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/blocks">Towers</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/events">Events</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/team-events">Team Events</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Public Site</Link>
            </Button>
          </div>
        </div>
      </header>
      <main>
        <AdminSessionGate>{children}</AdminSessionGate>
      </main>
    </div>
  );
}
