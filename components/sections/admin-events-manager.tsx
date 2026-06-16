"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  FileText,
  ImageUp,
  Loader2,
  Save,
  Trash2,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  AdminEvent,
  AdminEventScore,
  AdminHouseOption,
} from "@/lib/admin-management-queries";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const UPLOAD_TIMEOUT_MS = 45_000;

function withUploadTimeout<T>(promise: Promise<T>) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      window.setTimeout(
        () => reject(new Error("Upload timed out. Check the connection and try again.")),
        UPLOAD_TIMEOUT_MS,
      );
    }),
  ]);
}

function getGoogleDriveFileId(url: string) {
  const trimmed = url.trim();
  if (!trimmed.includes("drive.google.com")) return null;

  const pathMatch = trimmed.match(/\/(?:file\/d|document\/d|presentation\/d)\/([^/?#]+)/);
  if (pathMatch?.[1]) return pathMatch[1];

  try {
    const parsed = new URL(trimmed);
    return parsed.searchParams.get("id");
  } catch {
    return null;
  }
}

function normalizePosterUrl(url: string) {
  const trimmed = url.trim();
  const driveId = getGoogleDriveFileId(trimmed);
  if (!driveId) return trimmed;
  return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
}

export function AdminEventsManager({
  events,
  houses,
  scores,
}: {
  events: AdminEvent[];
  houses: AdminHouseOption[];
  scores: AdminEventScore[];
}) {
  const router = useRouter();

  async function saveEvent(form: HTMLFormElement, eventId?: string) {
    const values = new FormData(form);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Connect Supabase to manage events.");
      return;
    }

    const name = String(values.get("name") ?? "").trim();
    const slug =
      String(values.get("slug") ?? "").trim() ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const startsAt = String(values.get("startsAt") ?? "");
    const endsAt = String(values.get("endsAt") ?? "");

    if (endsAt && new Date(endsAt) < new Date(startsAt)) {
      toast.error("Event end time cannot be before its start time.");
      return;
    }

    const eventValues = {
      slug,
      name,
      category: String(values.get("category") ?? "").trim(),
      description: String(values.get("description") ?? "").trim() || null,
      rules: String(values.get("rules") ?? "").trim() || null,
      rulebook_url: String(values.get("rulebookUrl") ?? "").trim() || null,
      poster_url:
        normalizePosterUrl(String(values.get("posterUrl") ?? "")) || null,
      registration_link:
        String(values.get("registrationLink") ?? "").trim() || null,
      winner_details: String(values.get("winnerDetails") ?? "").trim() || null,
      venue: String(values.get("venue") ?? "").trim(),
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      status: String(values.get("status")) as AdminEvent["status"],
      registration_status: "closed" as const,
    };

    const query = eventId
      ? supabase.from("events").update(eventValues).eq("id", eventId)
      : supabase.from("events").insert(eventValues);
    const { error } = await query;

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(eventId ? "Event updated." : "Event published.");
    if (!eventId) form.reset();
    router.refresh();
  }

  async function saveResults(event: AdminEvent, form: HTMLFormElement) {
    const values = new FormData(form);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Connect Supabase to manage results.");
      return;
    }

    const scoreRows = houses.map((house) => ({
      event_id: event.id,
      house_id: house.id,
      points: Number(values.get(`${house.id}-points`) ?? 0),
      position: Number(values.get(`${house.id}-position`)) || null,
      result_label: String(values.get(`${house.id}-resultLabel`) ?? "").trim() || null,
    }));

    const [{ error: scoresError }, { error: eventError }] = await Promise.all([
      supabase.from("event_scores").upsert(scoreRows, {
        onConflict: "event_id,house_id",
      }),
      supabase
        .from("events")
        .update({
          winner_details:
            String(values.get("winnerDetails") ?? "").trim() || null,
          status: String(values.get("status")) as AdminEvent["status"],
        })
        .eq("id", event.id),
    ]);

    if (scoresError || eventError) {
      toast.error(scoresError?.message ?? eventError?.message ?? "Could not save results.");
      return;
    }

    toast.success("Points and winner details updated.");
    router.refresh();
  }

  async function deleteEvent(event: AdminEvent) {
    if (!window.confirm(`Delete ${event.name} and all associated result data?`)) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Connect Supabase to manage events.");
      return;
    }
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Event deleted.");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <EventEditor onSubmit={(form) => saveEvent(form)} />

      <div className="grid gap-6">
        {events.length ? (
          events.map((event) => (
            <div key={event.id} className="grid gap-4">
              <EventEditor
                event={event}
                onSubmit={(form) => saveEvent(form, event.id)}
                onDelete={() => deleteEvent(event)}
              />
              <ResultsEditor
                event={event}
                houses={houses}
                scores={scores.filter((score) => score.eventId === event.id)}
                onSubmit={(form) => saveResults(event, form)}
              />
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
            No events yet. Publish the first SportX event above.
          </div>
        )}
      </div>
    </div>
  );
}

function EventEditor({
  event,
  onSubmit,
  onDelete,
}: {
  event?: AdminEvent;
  onSubmit: (form: HTMLFormElement) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  const [posterUrl, setPosterUrl] = useState(event?.posterUrl ?? "");
  const [rulebookUrl, setRulebookUrl] = useState(event?.rulebookUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadingRulebook, setUploadingRulebook] = useState(false);

  async function uploadAsset({
    file,
    folder,
    allowedTypes,
    maxSizeMb,
    onUploaded,
    setBusy,
    successMessage,
  }: {
    file: File;
    folder: string;
    allowedTypes: string[];
    maxSizeMb: number;
    onUploaded: (url: string) => void;
    setBusy: (busy: boolean) => void;
    successMessage: string;
  }) {
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        allowedTypes.includes("application/pdf")
          ? "Choose a PDF file for the rulebook."
          : "Choose a PNG, JPEG, or WebP image.",
      );
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`File must be smaller than ${maxSizeMb} MB.`);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Connect Supabase before uploading files.");
      return;
    }

    setBusy(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "bin";
      const path = `${folder}/${crypto.randomUUID()}.${safeExtension}`;
      const { error } = await withUploadTimeout(
        supabase.storage
          .from("sportx-gallery")
          .upload(path, file, { contentType: file.type, upsert: false }),
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      const { data } = supabase.storage.from("sportx-gallery").getPublicUrl(path);
      onUploaded(data.publicUrl);
      toast.success(successMessage);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Upload failed. Check the connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function uploadPoster(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file for the event poster.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Poster images must be smaller than 8 MB.");
      return;
    }

    await uploadAsset({
      file,
      folder: "event-posters",
      allowedTypes: ["image/png", "image/jpeg", "image/webp"],
      maxSizeMb: 8,
      onUploaded: setPosterUrl,
      setBusy: setUploading,
      successMessage: "Poster uploaded.",
    });
  }

  async function uploadRulebook(file: File) {
    await uploadAsset({
      file,
      folder: "event-rulebooks",
      allowedTypes: ["application/pdf"],
      maxSizeMb: 15,
      onUploaded: setRulebookUrl,
      setBusy: setUploadingRulebook,
      successMessage: "Rulebook PDF uploaded.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            {event ? event.name : "Publish Event"}
          </CardTitle>
          {event ? <Badge variant="outline">{event.status}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5"
          onSubmit={(submitEvent) => {
            submitEvent.preventDefault();
            void onSubmit(submitEvent.currentTarget);
          }}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Event name">
              <Input name="name" required defaultValue={event?.name} />
            </Field>
            <Field label="Slug">
              <Input name="slug" defaultValue={event?.slug} placeholder="Auto-generated if blank" />
              <p className="text-xs text-muted-foreground">
                The short URL for this event, like <code>football-finals</code>.
                Leave blank to generate it from the event name.
              </p>
            </Field>
            <Field label="Category">
              <Input name="category" required defaultValue={event?.category} />
            </Field>
            <Field label="Venue">
              <Input name="venue" required defaultValue={event?.venue} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <Field label="Event poster">
              <div className="grid gap-3">
                <Input
                  name="posterFile"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploading}
                  onChange={(changeEvent) => {
                    const file = changeEvent.target.files?.[0];
                    if (file) void uploadPoster(file);
                  }}
                />
                <input type="hidden" name="posterUrl" value={posterUrl} />
                <p className="text-xs text-muted-foreground">
                  Upload PNG, JPEG, or WebP up to 8 MB.
                </p>
                {uploading ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading poster...
                  </p>
                ) : null}
              </div>
            </Field>
            <Field label="Poster preview">
              {posterUrl ? (
                <div className="relative aspect-[16/9] overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={posterUrl}
                    alt="Event poster preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                  <ImageUp className="mr-2 h-4 w-4" />
                  No poster uploaded
                </div>
              )}
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Poster image URL">
              <Input
                type="url"
                value={posterUrl}
                placeholder="Paste direct image URL or public Google Drive image link"
                onBlur={() => setPosterUrl((value) => normalizePosterUrl(value))}
                onChange={(changeEvent) => setPosterUrl(changeEvent.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Google Drive images work if sharing is set to anyone with the link.
              </p>
            </Field>
            <Field label="Registration link (optional)">
              <Input
                name="registrationLink"
                type="url"
                defaultValue={event?.registrationLink}
                placeholder="https://forms.gle/..."
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Event details">
              <textarea
                name="description"
                rows={5}
                defaultValue={event?.description}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Rulebook">
              <div className="grid gap-3">
                <textarea
                  name="rules"
                  rows={5}
                  defaultValue={event?.rules}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Paste short rules or notes here."
                />
                <Input
                  type="file"
                  accept="application/pdf"
                  disabled={uploadingRulebook}
                  onChange={(changeEvent) => {
                    const file = changeEvent.target.files?.[0];
                    if (file) void uploadRulebook(file);
                  }}
                />
                <Input
                  type="url"
                  value={rulebookUrl}
                  placeholder="Or paste a PDF / Google Drive rulebook link"
                  onChange={(changeEvent) => setRulebookUrl(changeEvent.target.value.trim())}
                />
                <input type="hidden" name="rulebookUrl" value={rulebookUrl} />
                {uploadingRulebook ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading rulebook...
                  </p>
                ) : rulebookUrl ? (
                  <a
                    href={rulebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    View uploaded PDF
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Optional PDF upload, up to 15 MB.
                  </p>
                )}
              </div>
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Starts">
              <Input name="startsAt" type="datetime-local" required defaultValue={toLocalInput(event?.startsAt)} />
            </Field>
            <Field label="Ends">
              <Input name="endsAt" type="datetime-local" defaultValue={toLocalInput(event?.endsAt)} />
            </Field>
            <Field label="Event status">
              <Select name="status" defaultValue={event?.status ?? "upcoming"} options={["upcoming", "ongoing", "completed", "archived"]} />
            </Field>
          </div>
          <Field label="Winner details / result summary">
            <textarea
              name="winnerDetails"
              rows={3}
              defaultValue={event?.winnerDetails}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Winner, runner-up, notable performance..."
            />
          </Field>
          <div className="flex justify-end gap-2">
            {event && onDelete ? (
              <Button type="button" variant="ghost" onClick={() => void onDelete()}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
            <Button type="submit" disabled={uploading || uploadingRulebook}>
              <Save className="h-4 w-4" />
              {event ? "Save Event" : "Publish Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ResultsEditor({
  event,
  houses,
  scores,
  onSubmit,
}: {
  event: AdminEvent;
  houses: AdminHouseOption[];
  scores: AdminEventScore[];
  onSubmit: (form: HTMLFormElement) => void | Promise<void>;
}) {
  const scoreByHouse = new Map(scores.map((score) => [score.houseId, score]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Post-Event Points & Winners: {event.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          After the event is complete, enter each house&apos;s points and position
          here. The public leaderboard and house totals update from these rows.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(submitEvent) => {
            submitEvent.preventDefault();
            void onSubmit(submitEvent.currentTarget);
          }}
        >
          <div className="grid gap-3">
            {houses.map((house) => {
              const score = scoreByHouse.get(house.id);
              return (
                <div
                  key={house.id}
                  className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_120px_120px_1.2fr]"
                >
                  <div className="flex items-center gap-3 font-medium">
                    <span className="h-3 w-3 rounded-full" style={{ background: house.color }} />
                    {house.name}
                  </div>
                  <Input name={`${house.id}-points`} type="number" min={0} defaultValue={score?.points ?? 0} placeholder="Points" />
                  <Input name={`${house.id}-position`} type="number" min={1} defaultValue={score?.position ?? ""} placeholder="Position" />
                  <Input name={`${house.id}-resultLabel`} defaultValue={score?.resultLabel} placeholder="Winner, runner-up..." />
                </div>
              );
            })}
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <Field label="Winner details / result summary">
              <textarea
                name="winnerDetails"
                rows={3}
                defaultValue={event.winnerDetails}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Event status">
              <Select name="status" defaultValue={event.status} options={["upcoming", "ongoing", "completed", "archived"]} />
            </Field>
          </div>
          <Button type="submit" className="justify-self-end">
            <Save className="h-4 w-4" />
            Save Results
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Select({ name, defaultValue, options }: { name: string; defaultValue: string; options: string[] }) {
  return (
    <select name={name} defaultValue={defaultValue} className="h-10 w-full rounded-md border bg-background px-3 text-sm capitalize">
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
