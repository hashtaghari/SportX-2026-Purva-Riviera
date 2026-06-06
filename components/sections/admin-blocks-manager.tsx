"use client";

import { useRouter } from "next/navigation";
import { Building2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminBlock, AdminHouseOption } from "@/lib/admin-management-queries";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminBlocksManager({
  houses,
  blocks,
}: {
  houses: AdminHouseOption[];
  blocks: AdminBlock[];
}) {
  const router = useRouter();

  async function createBlock(form: HTMLFormElement) {
    const values = new FormData(form);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return toast.error("Connect Supabase to manage towers.");
    const houseId = String(values.get("houseId") ?? "");

    const { error } = await supabase.from("blocks").insert({
      name: String(values.get("name") ?? "").trim(),
      display_order: Number(values.get("displayOrder")),
      house_id: houseId || null,
    });

    if (error) return toast.error(error.message);
    form.reset();
    toast.success("Tower created.");
    router.refresh();
  }

  async function updateBlock(block: AdminBlock, form: HTMLFormElement) {
    const values = new FormData(form);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return toast.error("Connect Supabase to manage towers.");
    const houseId = String(values.get("houseId") ?? "");

    const { error } = await supabase
      .from("blocks")
      .update({
        name: String(values.get("name") ?? "").trim(),
        display_order: Number(values.get("displayOrder")),
        house_id: houseId || null,
      })
      .eq("id", block.id);

    if (error) return toast.error(error.message);
    toast.success("Tower updated.");
    router.refresh();
  }

  async function deleteBlock(block: AdminBlock) {
    if (!window.confirm(`Delete ${block.name}? This only works before registrations use it.`)) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return toast.error("Connect Supabase to manage towers.");
    const { error } = await supabase.from("blocks").delete().eq("id", block.id);

    if (error) return toast.error(error.message);
    toast.success("Tower deleted.");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Tower
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-[1fr_140px_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void createBlock(event.currentTarget);
            }}
          >
            <Field label="Tower name">
              <Input name="name" required placeholder="Enter the real tower name" />
            </Field>
            <Field label="Display order">
              <Input name="displayOrder" type="number" min={1} max={16} required />
            </Field>
            <Field label="House">
              <HouseSelect houses={houses} />
            </Field>
            <Button type="submit" className="self-end" disabled={!houses.length}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Towers & House Assignments
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {blocks.length ? (
            blocks.map((block) => (
              <form
                key={block.id}
                className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_120px_1fr_auto_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  void updateBlock(block, event.currentTarget);
                }}
              >
                <Field label="Tower">
                  <Input name="name" defaultValue={block.name} required />
                </Field>
                <Field label="Order">
                  <Input
                    name="displayOrder"
                    type="number"
                    min={1}
                    max={16}
                    defaultValue={block.displayOrder}
                    required
                  />
                </Field>
                <Field label="House">
                  <HouseSelect houses={houses} defaultValue={block.houseId} />
                </Field>
                <Button type="submit" size="icon" variant="outline" className="self-end" aria-label="Save tower">
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="self-end"
                  aria-label="Delete tower"
                  onClick={() => void deleteBlock(block)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            ))
          ) : (
            <Empty text="No towers yet. Add the real Purva Riviera towers above." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HouseSelect({
  houses,
  defaultValue,
}: {
  houses: AdminHouseOption[];
  defaultValue?: string | null;
}) {
  return (
    <select
      name="houseId"
      defaultValue={defaultValue ?? ""}
      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
    >
      <option value="">Unassigned</option>
      {houses.map((house) => (
        <option key={house.id} value={house.id}>
          {house.name}
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

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
