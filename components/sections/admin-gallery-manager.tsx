"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, ImageUp, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  AdminGalleryImage,
  AdminGallerySection,
} from "@/lib/admin-management-queries";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_SECTION_PHOTOS = 10;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function AdminGalleryManager({
  sections,
  images,
}: {
  sections: AdminGallerySection[];
  images: AdminGalleryImage[];
}) {
  const router = useRouter();
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);

  async function createSection(form: HTMLFormElement) {
    const values = new FormData(form);
    const name = String(values.get("name") ?? "").trim();
    const description = String(values.get("description") ?? "").trim();
    const displayOrder = Number(values.get("displayOrder") ?? 0);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Connect Supabase to manage gallery sections.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("gallery_sections").insert({
      name,
      slug: slugify(name),
      description: description || null,
      display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
      created_by: userData.user?.id ?? null,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Gallery section created.");
    form.reset();
    router.refresh();
  }

  async function deleteSection(section: AdminGallerySection) {
    if (!window.confirm(`Delete "${section.name}" and its photos?`)) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const sectionImages = images.filter((image) => image.sectionId === section.id);
    if (sectionImages.length) {
      await supabase.storage
        .from("sportx-gallery")
        .remove(sectionImages.map((image) => image.storagePath));
    }

    const { error } = await supabase.from("gallery_sections").delete().eq("id", section.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Gallery section deleted.");
    router.refresh();
  }

  async function uploadPhotos(section: AdminGallerySection, files: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length) return;

    const existingCount = images.filter((image) => image.sectionId === section.id).length;
    const remaining = MAX_SECTION_PHOTOS - existingCount;
    if (selectedFiles.length > remaining) {
      toast.error(`Only ${remaining} photo${remaining === 1 ? "" : "s"} can be added to this section.`);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Connect Supabase before uploading photos.");
      return;
    }

    setUploadingSectionId(section.id);
    const { data: userData } = await supabase.auth.getUser();

    try {
      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image.`);
        }
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`${file.name} must be smaller than 8 MB.`);
        }

        const rawExtension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const extension = rawExtension.replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `gallery-sections/${section.id}/${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage.from("sportx-gallery").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (upload.error) throw upload.error;

        const insert = await supabase.from("gallery_images").insert({
          section_id: section.id,
          storage_bucket: "sportx-gallery",
          storage_path: path,
          alt_text: `${section.name} photo`,
          caption: section.name,
          featured: true,
          uploaded_by: userData.user?.id ?? null,
        });
        if (insert.error) throw insert.error;
      }

      toast.success("Photos uploaded.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed.");
    } finally {
      setUploadingSectionId(null);
    }
  }

  async function deleteImage(image: AdminGalleryImage) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const [{ error: storageError }, { error: dbError }] = await Promise.all([
      supabase.storage.from("sportx-gallery").remove([image.storagePath]),
      supabase.from("gallery_images").delete().eq("id", image.id),
    ]);

    if (storageError || dbError) {
      toast.error(storageError?.message ?? dbError?.message ?? "Could not delete photo.");
      return;
    }

    toast.success("Photo deleted.");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Create Gallery Section
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-[1fr_1.3fr_140px_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void createSection(event.currentTarget);
            }}
          >
            <Field label="Section name">
              <Input name="name" required placeholder="Opening Ceremony" />
            </Field>
            <Field label="Description">
              <Input name="description" placeholder="Optional short note" />
            </Field>
            <Field label="Order">
              <Input name="displayOrder" type="number" defaultValue={0} />
            </Field>
            <Button type="submit" className="self-end">
              <Save className="h-4 w-4" />
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      {sections.length ? (
        sections.map((section) => {
          const sectionImages = images.filter((image) => image.sectionId === section.id);
          const remaining = MAX_SECTION_PHOTOS - sectionImages.length;

          return (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <CardTitle>{section.name}</CardTitle>
                    {section.description ? (
                      <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
                    ) : null}
                    <Badge className="mt-3" variant="outline">
                      {sectionImages.length}/10 photos
                    </Badge>
                  </div>
                  <Button type="button" variant="ghost" onClick={() => void deleteSection(section)}>
                    <Trash2 className="h-4 w-4" />
                    Delete Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Upload photos</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    disabled={remaining <= 0 || uploadingSectionId === section.id}
                    onChange={(event) => void uploadPhotos(section, event.target.files)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {remaining > 0
                      ? `${remaining} upload slot${remaining === 1 ? "" : "s"} remaining.`
                      : "This section has reached the 10-photo limit."}
                  </p>
                </div>

                {sectionImages.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {sectionImages.map((image) => (
                      <div key={image.id} className="overflow-hidden rounded-md border bg-card">
                        <div className="relative aspect-square bg-muted">
                          <Image
                            src={image.src}
                            alt={image.altText}
                            fill
                            sizes="180px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 p-2">
                          <p className="truncate text-xs text-muted-foreground">{image.caption}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Delete photo"
                            onClick={() => void deleteImage(image)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-36 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center text-muted-foreground">
                    <ImageUp className="h-6 w-6" />
                    <p className="mt-3 text-sm font-medium">No photos in this section yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          Create the first gallery section to start uploading photos.
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
