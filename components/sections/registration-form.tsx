"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Crown, Plus, Trash2, Users } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { RegistrationBlock, TeamRegistrationEvent } from "@/types/championship";
import type { Json } from "@/types/database";

const memberSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the participant name."),
  gender: z.string().min(1, "Select a gender."),
  age: z.number().int().min(5).max(100),
  blockId: z.string().min(1, "Select a tower."),
  flatNumber: z.string().trim().min(1, "Enter a house or flat number."),
  isCaptain: z.boolean(),
  mobile: z.string().trim().optional(),
  email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
});

const teamRegistrationSchema = z
  .object({
    eventId: z.string().min(1, "Select an event."),
    teamName: z.string().trim().min(2, "Enter a team name."),
    notes: z.string().trim().max(500).optional(),
    members: z.array(memberSchema).min(1),
  })
  .superRefine((values, context) => {
    const captains = values.members.filter((member) => member.isCaptain);
    if (captains.length !== 1) {
      context.addIssue({
        code: "custom",
        path: ["members"],
        message: "Select exactly one team captain.",
      });
    } else if (!captains[0]?.mobile || captains[0].mobile.length < 10) {
      context.addIssue({
        code: "custom",
        path: ["members"],
        message: "The captain must provide a valid mobile number.",
      });
    }
  });

type TeamRegistrationValues = z.infer<typeof teamRegistrationSchema>;

type Confirmation = {
  teamName: string;
  eventName: string;
  status: "pending" | "waitlisted";
  waitlistPosition: number | null;
};

const blankMember = (isCaptain = false): TeamRegistrationValues["members"][number] => ({
  fullName: "",
  gender: "",
  age: 18,
  blockId: "",
  flatNumber: "",
  isCaptain,
  mobile: "",
  email: "",
});

export function RegistrationForm({
  events,
  blocks,
  initialEvent,
}: {
  events: TeamRegistrationEvent[];
  blocks: RegistrationBlock[];
  initialEvent?: string;
}) {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamRegistrationValues>({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      eventId:
        events.find((event) => event.id === initialEvent)?.databaseId ??
        events[0]?.databaseId ??
        "",
      teamName: "",
      notes: "",
      members: [blankMember(true), blankMember()],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "members" });
  const selectedEventId = watch("eventId");
  const members = watch("members");
  const selectedEvent = events.find((event) => event.databaseId === selectedEventId);
  const blockById = useMemo(
    () => new Map(blocks.map((block) => [block.id, block])),
    [blocks],
  );

  useEffect(() => {
    if (!selectedEvent) return;

    const missingMembers = selectedEvent.minimumTeamSize - fields.length;
    if (missingMembers > 0) {
      Array.from({ length: missingMembers }).forEach(() => append(blankMember()));
    }
  }, [append, fields.length, selectedEvent]);

  function selectCaptain(index: number) {
    members.forEach((_, memberIndex) => {
      setValue(`members.${memberIndex}.isCaptain`, memberIndex === index, {
        shouldValidate: true,
      });
    });
  }

  async function onSubmit(values: TeamRegistrationValues) {
    const event = events.find((item) => item.databaseId === values.eventId);

    if (!event) {
      toast.error("Select a valid team event.");
      return;
    }

    if (
      values.members.length < event.minimumTeamSize ||
      values.members.length > event.maximumTeamSize
    ) {
      toast.error(
        `This event requires ${event.minimumTeamSize}-${event.maximumTeamSize} members.`,
      );
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setConfirmation({
        teamName: values.teamName,
        eventName: event.name,
        status: event.registrationStatus === "waitlist" ? "waitlisted" : "pending",
        waitlistPosition: null,
      });
      toast.success("Registration validated. Connect Supabase to save it.");
      return;
    }

    const { data, error } = await supabase.rpc("submit_event_team", {
      p_event_id: event.databaseId,
      p_team_name: values.teamName,
      p_submitter_note: values.notes || null,
      p_members: values.members as unknown as Json,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const result = data as {
      status?: "pending" | "waitlisted";
      waitlistPosition?: number | null;
    } | null;
    const status = result?.status === "waitlisted" ? "waitlisted" : "pending";

    setConfirmation({
      teamName: values.teamName,
      eventName: event.name,
      status,
      waitlistPosition: result?.waitlistPosition ?? null,
    });
    toast.success(
      status === "waitlisted"
        ? "Team added to the waitlist."
        : "Team registration submitted.",
    );
    reset();
  }

  if (confirmation) {
    return (
      <Card>
        <CardContent className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-house-green/12 text-house-green">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <Badge
            className="mt-5"
            variant={confirmation.status === "waitlisted" ? "warning" : "success"}
          >
            {confirmation.status}
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold">{confirmation.teamName}</h2>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Registration for {confirmation.eventName} has been received.
            {confirmation.status === "waitlisted"
              ? ` Waitlist position: ${confirmation.waitlistPosition ?? "to be confirmed"}.`
              : " The SportX team will review it shortly."}
          </p>
          <Button className="mt-7" variant="outline" onClick={() => setConfirmation(null)}>
            Register another team
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Registration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label="Event" error={errors.eventId?.message}>
            <select
              {...register("eventId")}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select an open team event</option>
              {events
                .filter((event) => event.registrationStatus !== "closed")
                .map((event) => (
                  <option key={event.databaseId} value={event.databaseId}>
                    {event.name} · {event.minimumTeamSize}-{event.maximumTeamSize} members
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Team Name" error={errors.teamName?.message}>
            <Input {...register("teamName")} placeholder="e.g. Riviera Racers" />
          </Field>
          <div className="rounded-md border bg-muted/40 p-4 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{selectedEvent?.name ?? "Select an event"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedEvent
                    ? `${selectedEvent.minimumTeamSize}-${selectedEvent.maximumTeamSize} members allowed`
                    : "Team limits are configured by the event admin."}
                </p>
              </div>
              {selectedEvent ? (
                <Badge
                  variant={
                    selectedEvent.registrationStatus === "open" ? "success" : "warning"
                  }
                >
                  Registration {selectedEvent.registrationStatus}
                </Badge>
              ) : null}
            </div>
          </div>
          <Field label="Notes (optional)" error={errors.notes?.message} className="md:col-span-2">
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Anything the event coordinators should know"
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold">Team Members</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Houses are assigned automatically from each member&apos;s block.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            <Users className="mr-1 h-3.5 w-3.5" />
            {fields.length} members
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!selectedEvent || fields.length >= selectedEvent.maximumTeamSize}
            onClick={() => append(blankMember())}
          >
            <Plus className="h-4 w-4" />
            Add member
          </Button>
        </div>
      </div>

      {errors.members?.root?.message || errors.members?.message ? (
        <p className="text-sm text-destructive">
          {errors.members.root?.message ?? errors.members.message}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {fields.map((field, index) => {
          const member = members[index];
          const derivedHouse = blockById.get(member?.blockId ?? "");
          const isCaptain = Boolean(member?.isCaptain);
          const memberErrors = errors.members?.[index];

          return (
            <Card key={field.id} className={isCaptain ? "border-accent" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    Member {index + 1}
                    {isCaptain ? <Crown className="h-4 w-4 text-accent" /> : null}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={isCaptain ? "accent" : "outline"}
                      onClick={() => selectCaptain(index)}
                    >
                      {isCaptain ? "Captain" : "Make captain"}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove member ${index + 1}`}
                      disabled={
                        fields.length <= (selectedEvent?.minimumTeamSize ?? 1) || isCaptain
                      }
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" error={memberErrors?.fullName?.message}>
                  <Input {...register(`members.${index}.fullName`)} />
                </Field>
                <Field label="Gender" error={memberErrors?.gender?.message}>
                  <select
                    {...register(`members.${index}.gender`)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Age" error={memberErrors?.age?.message}>
                  <Input
                    {...register(`members.${index}.age`, { valueAsNumber: true })}
                    type="number"
                    min={5}
                    max={100}
                  />
                </Field>
                <Field label="Block / Tower" error={memberErrors?.blockId?.message}>
                  <select
                    {...register(`members.${index}.blockId`)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Select</option>
                    {blocks.map((block) => (
                      <option key={block.id} value={block.id}>
                        {block.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="House / Flat Number" error={memberErrors?.flatNumber?.message}>
                  <Input {...register(`members.${index}.flatNumber`)} />
                </Field>
                <div className="grid gap-2">
                  <Label>Assigned House</Label>
                  <div className="flex h-10 items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm">
                    {derivedHouse ? (
                      <>
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: derivedHouse.houseColor }}
                        />
                        {derivedHouse.houseName}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Select a block</span>
                    )}
                  </div>
                </div>
                {isCaptain ? (
                  <>
                    <Field label="Captain Mobile" error={memberErrors?.mobile?.message}>
                      <Input
                        {...register(`members.${index}.mobile`)}
                        autoComplete="tel"
                        placeholder="Mandatory"
                      />
                    </Field>
                    <Field label="Captain Email (optional)" error={memberErrors?.email?.message}>
                      <Input
                        {...register(`members.${index}.email`)}
                        type="email"
                        autoComplete="email"
                      />
                    </Field>
                  </>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting || !selectedEvent}>
        {isSubmitting ? "Submitting team..." : "Submit Team Registration"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
