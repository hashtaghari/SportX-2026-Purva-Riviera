"use client";

import { useRouter } from "next/navigation";
import { CalendarPlus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminEvent } from "@/lib/admin-management-queries";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminEventsManager({ events }: { events: AdminEvent[] }) {
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
    const registrationType = String(values.get("registrationType")) as "individual" | "team";
    const startsAt = String(values.get("startsAt") ?? "");
    const endsAt = String(values.get("endsAt") ?? "");
    const minimumTeamSize =
      registrationType === "team" ? Number(values.get("minimumTeamSize")) : 1;
    const maximumTeamSize =
      registrationType === "team" ? Number(values.get("maximumTeamSize")) : 1;

    if (registrationType === "team" && maximumTeamSize < minimumTeamSize) {
      toast.error("Maximum team size must be at least the minimum team size.");
      return;
    }
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
      venue: String(values.get("venue") ?? "").trim(),
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      status: String(values.get("status")) as AdminEvent["status"],
      registration_status: String(
        values.get("registrationStatus"),
      ) as AdminEvent["registrationStatus"],
    };

    let savedEventId = eventId;
    if (eventId) {
      const { error } = await supabase.from("events").update(eventValues).eq("id", eventId);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("events")
        .insert(eventValues)
        .select("id")
        .single();
      if (error || !data) {
        toast.error(error?.message ?? "Could not create event.");
        return;
      }
      savedEventId = data.id;
    }

    const maximumTeams =
      registrationType === "team" ? Number(values.get("maximumTeams")) || null : null;

    const { error: settingsError } = await supabase
      .from("event_registration_settings")
      .upsert({
        event_id: String(savedEventId),
        registration_type: registrationType,
        minimum_team_size: minimumTeamSize,
        maximum_team_size: maximumTeamSize,
        maximum_teams: maximumTeams,
      });

    if (settingsError) {
      toast.error(settingsError.message);
      return;
    }
    toast.success(eventId ? "Event updated." : "Event created.");
    if (!eventId) form.reset();
    router.refresh();
  }

  async function deleteEvent(event: AdminEvent) {
    if (!window.confirm(`Delete ${event.name} and all associated registration data?`)) {
      return;
    }
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

      <div className="grid gap-4">
        {events.length ? (
          events.map((event) => (
            <EventEditor
              key={event.id}
              event={event}
              onSubmit={(form) => saveEvent(form, event.id)}
              onDelete={() => deleteEvent(event)}
            />
          ))
        ) : (
          <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
            No events yet. Create the first SportX event above.
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            {event ? event.name : "Create Event"}
          </CardTitle>
          {event ? (
            <Badge variant={event.registrationStatus === "open" ? "success" : "warning"}>
              {event.registrationStatus}
            </Badge>
          ) : null}
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
            </Field>
            <Field label="Category">
              <Input name="category" required defaultValue={event?.category} placeholder="Team Sport, Aquatics..." />
            </Field>
            <Field label="Venue">
              <Input name="venue" required defaultValue={event?.venue} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Description">
              <textarea
                name="description"
                rows={3}
                defaultValue={event?.description}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Rules">
              <textarea
                name="rules"
                rows={3}
                defaultValue={event?.rules}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Starts">
              <Input name="startsAt" type="datetime-local" required defaultValue={toLocalInput(event?.startsAt)} />
            </Field>
            <Field label="Ends">
              <Input name="endsAt" type="datetime-local" defaultValue={toLocalInput(event?.endsAt)} />
            </Field>
            <Field label="Event status">
              <Select name="status" defaultValue={event?.status ?? "upcoming"} options={["upcoming", "ongoing", "completed", "archived"]} />
            </Field>
            <Field label="Registration status">
              <Select name="registrationStatus" defaultValue={event?.registrationStatus ?? "closed"} options={["open", "waitlist", "closed"]} />
            </Field>
          </div>
          <div className="grid gap-4 rounded-md border bg-muted/35 p-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Registration type">
              <Select name="registrationType" defaultValue={event?.registrationType ?? "individual"} options={["individual", "team"]} />
            </Field>
            <Field label="Minimum team size">
              <Input name="minimumTeamSize" type="number" min={1} defaultValue={event?.minimumTeamSize ?? 1} />
            </Field>
            <Field label="Maximum team size">
              <Input name="maximumTeamSize" type="number" min={1} defaultValue={event?.maximumTeamSize ?? 1} />
            </Field>
            <Field label="Maximum teams">
              <Input name="maximumTeams" type="number" min={1} defaultValue={event?.maximumTeams ?? ""} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            {event && onDelete ? (
              <Button type="button" variant="ghost" onClick={() => void onDelete()}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
            <Button type="submit">
              <Save className="h-4 w-4" />
              {event ? "Save Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Select({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="h-10 w-full rounded-md border bg-background px-3 text-sm capitalize"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
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

function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
