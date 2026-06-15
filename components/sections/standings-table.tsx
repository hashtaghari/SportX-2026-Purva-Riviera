"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { getHouseBrand } from "@/lib/brand-assets";
import { formatPoints } from "@/lib/utils";
import type { HouseStanding } from "@/types/championship";

function getColumns(showPointProgress: boolean): ColumnDef<HouseStanding>[] {
  return [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => (
      <span className="font-semibold">#{row.original.rank}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "House",
    cell: ({ row }) => {
      const brand = getHouseBrand(row.original.slug);
      return (
        <div className="flex items-center gap-3">
        <Image
          src={brand.crest}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-full border object-cover"
        />
        <Link
          href={`/houses/${row.original.slug}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      </div>
      );
    },
  },
  {
    accessorKey: "totalPoints",
    header: "Points",
    cell: ({ row, table }) => {
      if (!showPointProgress) {
        return (
          <span className="font-semibold">
            {formatPoints(row.original.totalPoints)}
          </span>
        );
      }

      const leaderPoints = Math.max(
        ...table.options.data.map((house) => house.totalPoints),
        0,
      );
      const progress = leaderPoints
        ? Math.round((row.original.totalPoints / leaderPoints) * 100)
        : 0;

      return (
        <div className="min-w-36">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">
              {formatPoints(row.original.totalPoints)}
            </span>
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: row.original.color,
              }}
            />
          </div>
        </div>
      );
    },
  },
  {
    id: "medals",
    header: "Medals",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 text-sm">
        <span aria-label={`${row.original.goldMedals} gold medals`}>
          🥇 {row.original.goldMedals}
        </span>
        <span aria-label={`${row.original.silverMedals} silver medals`}>
          🥈 {row.original.silverMedals}
        </span>
        <span aria-label={`${row.original.bronzeMedals} bronze medals`}>
          🥉 {row.original.bronzeMedals}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "eventsParticipated",
    header: "Events",
  },
  {
    accessorKey: "pointsGap",
    header: "Gap",
    cell: ({ row, table }) =>
      table.options.data.every((house) => house.totalPoints === 0) ? (
        <Badge variant="outline">No scores</Badge>
      ) : row.original.pointsGap === 0 ? (
        <Badge variant="success">Leader</Badge>
      ) : (
        <span className="text-muted-foreground">
          {formatPoints(row.original.pointsGap)}
        </span>
      ),
  },
  {
    accessorKey: "trend",
    header: "Trend",
    cell: ({ row }) => {
      const trend = row.original.trend;
      if (trend === "up") {
        return (
          <Badge variant="success">
            <TrendingUp className="mr-1 h-3 w-3" /> Up
          </Badge>
        );
      }
      if (trend === "down") {
        return (
          <Badge variant="secondary">
            <TrendingDown className="mr-1 h-3 w-3" /> Down
          </Badge>
        );
      }
      return <Badge variant="outline">Steady</Badge>;
    },
  },
  ];
}

export function StandingsTable({
  standings,
  showPointProgress = true,
}: {
  standings: HouseStanding[];
  showPointProgress?: boolean;
}) {
  const columns = useMemo(
    () => getColumns(showPointProgress),
    [showPointProgress],
  );
  const table = useReactTable({
    data: standings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border bg-card">
      <div className="grid gap-3 p-3 sm:hidden">
        {standings.map((house) => {
          const leaderPoints = Math.max(
            ...standings.map((item) => item.totalPoints),
            0,
          );
          const progress = leaderPoints
            ? Math.round((house.totalPoints / leaderPoints) * 100)
            : 0;

          return (
            <Link
              key={house.id}
              href={`/houses/${house.slug}`}
              className="rounded-md border bg-background p-3 transition hover:bg-muted/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={getHouseBrand(house.slug).crest}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full border object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{house.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Rank #{house.rank} · {house.eventsParticipated} events
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPoints(house.totalPoints)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {leaderPoints === 0
                      ? "No scores"
                      : house.pointsGap === 0
                        ? "Leader"
                        : `${house.pointsGap} gap`}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <span aria-label={`${house.goldMedals} gold medals`}>
                  🥇 {house.goldMedals}
                </span>
                <span aria-label={`${house.silverMedals} silver medals`}>
                  🥈 {house.silverMedals}
                </span>
                <span aria-label={`${house.bronzeMedals} bronze medals`}>
                  🥉 {house.bronzeMedals}
                </span>
              </div>
              {showPointProgress ? (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progress}%`, backgroundColor: house.color }}
                  />
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table
          className={`w-full text-sm ${
            showPointProgress ? "min-w-[860px]" : "min-w-[720px]"
          }`}
        >
          <thead className="bg-muted/70">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
