"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";
import type { StockV1 } from "@/types/stock";
import type { Metrics } from "@/types/metrics";
import { METRIC_META } from "@/core/metrics/metrics";

type Row = StockV1 & Metrics;

interface ScreenerTableV1Props {
  data: Row[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSortChange: (field: string, direction: "asc" | "desc") => void;
}

const COLUMNS: ColumnDef<Row>[] = [
  {
    accessorKey: "symbol",
    header: "Symbol",
    size: 100,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{row.original.symbol}</span>
        <span className="text-[10px] text-on-surface-variant line-clamp-1">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "sector",
    header: "Sector",
    size: 130,
    cell: ({ getValue }) => (
      <span className="text-xs text-on-surface-variant">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "pe",
    header: METRIC_META.pe.label,
    size: 90,
    cell: ({ getValue }) => fmtNum(getValue() as number),
  },
  {
    accessorKey: "pbv",
    header: METRIC_META.pbv.label,
    size: 90,
    cell: ({ getValue }) => fmtNum(getValue() as number),
  },
  {
    accessorKey: "roe",
    header: METRIC_META.roe.label,
    size: 90,
    cell: ({ getValue }) => fmtPct(getValue() as number),
  },
  {
    accessorKey: "revenueGrowth",
    header: METRIC_META.revenueGrowth.label,
    size: 120,
    cell: ({ getValue }) => fmtPct(getValue() as number),
  },
  {
    accessorKey: "netMargin",
    header: METRIC_META.netMargin.label,
    size: 110,
    cell: ({ getValue }) => fmtPct(getValue() as number),
  },
  {
    accessorKey: "debtToEquity",
    header: METRIC_META.debtToEquity.label,
    size: 110,
    cell: ({ getValue }) => fmtNum(getValue() as number),
  },
];

function fmtNum(v: number) {
  return (
    <span className="tabular-nums text-sm text-right block">
      {v != null ? v.toFixed(2) : "—"}
    </span>
  );
}

function fmtPct(v: number) {
  return (
    <span className="tabular-nums text-sm text-right block">
      {v != null ? `${v.toFixed(2)}%` : "—"}
    </span>
  );
}

export function ScreenerTableV1({
  data,
  total,
  page,
  limit,
  onPageChange,
  onSortChange,
}: ScreenerTableV1Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next);
      if (next.length > 0) {
        onSortChange(next[0].id, next[0].desc ? "desc" : "asc");
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / limit),
  });

  const { rows } = table.getRowModel();

  const containerRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Table */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto border border-border-subtle rounded-t-xl bg-surface-card"
        style={{ maxHeight: "60vh" }}
      >
        <table className="w-full min-w-[800px] text-left table-fixed">
          <thead className="sticky top-0 z-10 bg-surface-elevated border-b border-border-subtle">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-on-surface-variant whitespace-nowrap select-none cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc" && (
                        <span className="text-[11px]">↑</span>
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <span className="text-[11px]">↓</span>
                      )}
                      {!header.column.getIsSorted() && (
                        <span className="text-[11px] opacity-20">↕</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}
          >
            {virtualizer.getVirtualItems().map((vRow) => {
              const row = rows[vRow.index];
              return (
                <tr
                  key={row.id}
                  data-index={vRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute left-0 w-full border-b border-border-subtle/30 hover:bg-white/5 transition-colors"
                  style={{ transform: `translateY(${vRow.start}px)` }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="px-3 py-2.5 align-middle"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2.5 border border-t-0 border-border-subtle rounded-b-xl bg-surface-base text-sm">
        <span className="text-on-surface-variant text-xs">
          Showing{" "}
          <strong>{Math.min((page - 1) * limit + 1, total)}</strong>–
          <strong>{Math.min(page * limit, total)}</strong> of{" "}
          <strong>{total}</strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1 rounded-md border border-border-subtle bg-surface-elevated text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            Prev
          </button>
          <span className="text-xs text-on-surface-variant">
            {page} / {totalPages || 1}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 rounded-md border border-border-subtle bg-surface-elevated text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
