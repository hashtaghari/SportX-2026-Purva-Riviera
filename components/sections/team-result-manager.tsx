"use client";

import { useMemo, useState } from "react";
import { Calculator, CheckCircle2, Download, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AdminTeamEvent } from "@/lib/team-registration-queries";

type Allocation = {
  houseId: string;
  memberCount: number;
  teamSize: number;
  ratio: number;
  points: number;
};

export function TeamResultManager({ events }: { events: AdminTeamEvent[] }) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const selectedEvent = events.find((event) => event.id === selectedEventId);
  const selectedPositionPoints = selectedEvent?.positions.find(
    (position) => String(position.position) === selectedPosition,
  );
  const selectedTeam = selectedEvent?.teams.find((team) => team.id === selectedTeamId);

  const ready = Boolean(selectedEvent && selectedTeam && selectedPositionPoints);
  const approvedTeams = useMemo(
    () =>
      selectedEvent?.teams.filter(
        (team) => team.status === "approved" || team.status === "pending",
      ) ?? [],
    [selectedEvent],
  );

  async function saveSettings(event: AdminTeamEvent, form: HTMLFormElement) {
    const data = new FormData(form);
    const minimumTeamSize = Number(data.get("minimumTeamSize"));
    const maximumTeamSize = Number(data.get("maximumTeamSize"));
    const maximumTeams = Number(data.get("maximumTeams")) || null;
    const positions = event.positions.map((position) => ({
      id: position.id,
      event_id: event.id,
      position: position.position,
      label: String(data.get(`positionLabel-${position.position}`) ?? position.label),
      points: Number(data.get(`positionPoints-${position.position}`)),
    }));

    if (minimumTeamSize < 1 || maximumTeamSize < minimumTeamSize) {
      toast.error("Check the configured team-size range.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Connect Supabase to save event settings.");
      return;
    }

    const { error } = await supabase
      .from("event_registration_settings")
      .update({
        minimum_team_size: minimumTeamSize,
        maximum_team_size: maximumTeamSize,
        maximum_teams: maximumTeams,
      })
      .eq("event_id", event.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    const { error: pointsError } = await supabase
      .from("event_position_points")
      .upsert(positions, { onConflict: "id" });

    if (pointsError) toast.error(pointsError.message);
    else toast.success(`${event.name} registration and points settings updated.`);
  }

  function exportEvent(event: AdminTeamEvent) {
    const headings = [
      "Event",
      "Team",
      "Registration Status",
      "Captain",
      "Member Name",
      "Gender",
      "Age",
      "Block",
      "House",
      "House / Flat Number",
      "Mobile",
      "Email",
    ];
    const rows = event.teams.flatMap((team) =>
      team.members.map((member) => [
        event.name,
        team.name,
        team.status,
        member.isCaptain ? "Yes" : "No",
        member.name,
        member.gender,
        member.age,
        member.blockName,
        member.houseName,
        member.flatNumber,
        member.mobile ?? "",
        member.email ?? "",
      ]),
    );
    const csv = [headings, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `${event.name.toLowerCase().replaceAll(" ", "-")}-teams.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function confirmResult() {
    if (!selectedEvent || !selectedTeam || !selectedPositionPoints) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Connect Supabase and sign in as an admin.");
      return;
    }

    setIsSaving(true);
    const { data: result, error: resultError } = await supabase
      .from("event_team_results")
      .insert({
        event_id: selectedEvent.id,
        team_id: selectedTeam.id,
        position: selectedPositionPoints.position,
        total_points: selectedPositionPoints.points,
        result_label: selectedPositionPoints.label,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (resultError || !result) {
      toast.error(resultError?.message ?? "Could not save the team result.");
      setIsSaving(false);
      return;
    }

    const { data, error } = await supabase.rpc("confirm_team_result", {
      p_team_result_id: result.id,
    });
    setIsSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const confirmed = data as { allocations?: Allocation[] } | null;
    setAllocations(confirmed?.allocations ?? []);
    toast.success("Result confirmed and house points updated.");
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Team Registration Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {events.length ? (
            events.map((event) => (
              <form
                key={event.id}
                className="grid gap-4 rounded-md border p-4"
                onSubmit={(formEvent) => {
                  formEvent.preventDefault();
                  void saveSettings(event, formEvent.currentTarget);
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{event.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={event.registrationStatus === "open" ? "success" : "warning"}>
                      {event.registrationStatus}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Export ${event.name} registrations`}
                      onClick={() => exportEvent(event)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <AdminField label="Minimum">
                    <Input
                      name="minimumTeamSize"
                      type="number"
                      min={1}
                      defaultValue={event.minimumTeamSize}
                    />
                  </AdminField>
                  <AdminField label="Maximum">
                    <Input
                      name="maximumTeamSize"
                      type="number"
                      min={1}
                      defaultValue={event.maximumTeamSize}
                    />
                  </AdminField>
                  <AdminField label="Team capacity">
                    <Input
                      name="maximumTeams"
                      type="number"
                      min={1}
                      defaultValue={event.maximumTeams ?? ""}
                    />
                  </AdminField>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {event.positions.map((position) => (
                    <div key={position.id} className="grid gap-2 rounded-md border p-3">
                      <Input
                        name={`positionLabel-${position.position}`}
                        defaultValue={position.label}
                        aria-label={`Position ${position.position} label`}
                      />
                      <Input
                        name={`positionPoints-${position.position}`}
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={position.points}
                        aria-label={`${position.label} points`}
                      />
                    </div>
                  ))}
                </div>
                <Button type="submit" variant="outline" size="sm">
                  Save registration & points
                </Button>
              </form>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No team events are configured yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Confirm Team Result
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            <AdminField label="Event">
              <select
                value={selectedEventId}
                onChange={(event) => {
                  setSelectedEventId(event.target.value);
                  setSelectedTeamId("");
                  setSelectedPosition("");
                  setAllocations([]);
                }}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Placed Team">
              <select
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select team</option>
                {approvedTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Position">
              <select
                value={selectedPosition}
                onChange={(event) => setSelectedPosition(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select position</option>
                {selectedEvent?.positions.map((position) => (
                  <option key={position.id} value={position.position}>
                    {position.label} · {position.points} points
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
          <AdminField label="Result note">
            <Input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional winner or runner-up note"
            />
          </AdminField>
          <div className="rounded-md border bg-muted/40 p-4 text-sm">
            {ready ? (
              <p>
                Confirm <strong>{selectedTeam?.name}</strong> as{" "}
                <strong>{selectedPositionPoints?.label}</strong>. SportX will divide{" "}
                <strong>{selectedPositionPoints?.points} points</strong> according to
                the registered members&apos; houses.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Select an event, team, and position to calculate the house split.
              </p>
            )}
          </div>
          <Button disabled={!ready || isSaving} onClick={confirmResult}>
            {isSaving ? "Calculating and confirming..." : "Confirm Result & Allocate Points"}
          </Button>

          {allocations.length ? (
            <div className="grid gap-3">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-5 w-5 text-house-green" />
                Confirmed Allocation
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {allocations.map((allocation) => (
                  <div key={allocation.houseId} className="rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">
                      {allocation.memberCount} of {allocation.teamSize} members
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{allocation.points}</p>
                    <p className="text-sm text-muted-foreground">
                      {(allocation.ratio * 100).toFixed(1)}% of team points
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
