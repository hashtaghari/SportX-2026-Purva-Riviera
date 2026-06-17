import type { Metadata } from "next";
import Image from "next/image";
import { Camera } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getGallerySections } from "@/lib/championship-queries";

export const metadata: Metadata = {
  title: "Gallery",
  description: "SportX 2026 championship photo gallery.",
};

export default async function GalleryPage() {
  const sections = await getGallerySections();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Championship Gallery
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          SportX Moments
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Event photos, house moments, and highlights from SportX 2026.
        </p>
      </div>

      {sections.length ? (
        <div className="grid gap-10">
          {sections.map((section) => (
            <section key={section.id} className="grid gap-4">
              <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-end">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold tracking-normal">
                      {section.name}
                    </h2>
                    <Badge variant="outline">{section.imageCount}/10 photos</Badge>
                  </div>
                  {section.description ? (
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  ) : null}
                </div>
              </div>

              {section.images.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {section.images.map((image) => (
                    <a
                      key={image.id}
                      href={image.src}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-lg border bg-card"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                        <Camera className="h-4 w-4 shrink-0" />
                        <span className="truncate">{image.caption}</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center text-muted-foreground">
                  <Camera className="h-6 w-6" />
                  <p className="mt-3 text-sm font-medium">
                    Photos for this section will appear soon.
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <Camera className="h-7 w-7 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Gallery opens soon</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Admins can publish photo sections after the first SportX moments are ready.
          </p>
        </div>
      )}
    </div>
  );
}
