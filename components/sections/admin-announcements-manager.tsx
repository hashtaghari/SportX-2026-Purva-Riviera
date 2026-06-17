"use client";

import { useRouter } from "next/navigation";
import { Megaphone, Pin, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminAnnouncement } from "@/lib/admin-management-queries";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function toLocalDateTimeInput(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function localDateTimeInputToIso(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw ? new Date(raw).toISOString() : null;
}

export function AdminAnnouncementsManager({
  announcements,
}: {
  announcements: AdminAnnouncement[];
}) {
  const router = useRouter();

  async function saveAnnouncement(form: HTMLFormElement, announcementId?: string) {
    const values = new FormData(form);
    const title = String(values.get("title") ?? "").trim();
    const body = String(values.get("body") ?? "").trim();

    if (!title || !body) {
      toast.error("Add a title and announcement text.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Connect Supabase to manage announcements.");
      return;
    }

    const payload = {
      title,
      body,
      pinned: values.get("pinned") === "on",
      published_at:
        localDateTimeInputToIso(values.get("publishedAt")) ?? new Date().toISOString(),
      expires_at: localDateTimeInputToIso(values.get("expiresAt")),
    };

    const query = announcementId
      ? supabase.from("announcements").update(payload).eq("id", announcementId)
      : supabase.from("announcements").insert(payload);
    const { error } = await query;

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(announcementId ? "Announcement updated." : "Announcement published.");
    if (!announcementId) form.reset();
    router.refresh();
  }

  async function deleteAnnouncement(announcement: AdminAnnouncement) {
    if (!window.confirm(`Delete "${announcement.title}"?`)) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcement.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Announcement deleted.");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <AnnouncementEditor onSubmit={(form) => saveAnnouncement(form)} />

      {announcements.length ? (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <AnnouncementEditor
              key={announcement.id}
              announcement={announcement}
              onSubmit={(form) => saveAnnouncement(form, announcement.id)}
              onDelete={() => deleteAnnouncement(announcement)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          No announcements yet. Publish the first update above.
        </div>
      )}
    </div>
  );
}

function AnnouncementEditor({
  announcement,
  onSubmit,
  onDelete,
}: {
  announcement?: AdminAnnouncement;
  onSubmit: (form: HTMLFormElement) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <CardTitle className="flex items-center gap-2">
            {announcement?.pinned ? <Pin className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
            {announcement ? announcement.title : "New Announcement"}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {announcement?.pinned ? <Badge variant="secondary">Pinned</Badge> : null}
            {onDelete ? (
              <Button type="button" variant="ghost" onClick={() => void onDelete()}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit(event.currentTarget);
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <Input name="title" defaultValue={announcement?.title ?? ""} required />
            </Field>
            <Field label="Published at">
              <Input
                name="publishedAt"
                type="datetime-local"
                defaultValue={toLocalDateTimeInput(announcement?.publishedAt ?? "")}
              />
            </Field>
          </div>
          <Field label="Announcement">
            <textarea
              name="body"
              required
              defaultValue={announcement?.body ?? ""}
              rows={4}
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <Field label="Expires at">
              <Input
                name="expiresAt"
                type="datetime-local"
                defaultValue={toLocalDateTimeInput(announcement?.expiresAt ?? "")}
              />
            </Field>
            <label className="flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm">
              <input
                name="pinned"
                type="checkbox"
                defaultChecked={announcement?.pinned ?? false}
                className="h-4 w-4"
              />
              Pin announcement
            </label>
          </div>
          <Button type="submit" className="w-full sm:w-fit">
            <Save className="h-4 w-4" />
            {announcement ? "Save Announcement" : "Publish Announcement"}
          </Button>
        </form>
      </CardContent>
    </Card>
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
