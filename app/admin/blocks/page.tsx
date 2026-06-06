import type { Metadata } from "next";

import { AdminBlocksManager } from "@/components/sections/admin-blocks-manager";
import { getAdminBlocksData } from "@/lib/admin-management-queries";

export const metadata: Metadata = { title: "Manage Towers" };

export default async function AdminBlocksPage() {
  const data = await getAdminBlocksData();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Championship Setup
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Towers & House Assignments
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Review the real Purva Riviera block names and assign each one to Red,
          Green, Yellow, or Blue House when the assignments are ready.
        </p>
      </div>
      <AdminBlocksManager houses={data.houses} blocks={data.blocks} />
    </div>
  );
}
