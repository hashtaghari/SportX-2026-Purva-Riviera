import type { Metadata } from "next";

import { AdminGalleryManager } from "@/components/sections/admin-gallery-manager";
import { getAdminGalleryData } from "@/lib/admin-management-queries";

export const metadata: Metadata = { title: "Manage Gallery" };

export default async function AdminGalleryPage() {
  const { sections, images } = await getAdminGalleryData();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Media Desk
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">Gallery</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Create named photo sections and upload up to ten images in each section.
          Gallery photos are also used by the homepage carousel.
        </p>
      </div>
      <AdminGalleryManager sections={sections} images={images} />
    </div>
  );
}
