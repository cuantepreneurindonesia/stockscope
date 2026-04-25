"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VirtualizedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  /**
   * Estimated row height in pixels – used by the virtualizer.
   * Defaults to 48.
   */
  estimatedRowHeight?: number;
  /**
   * Max CSS height of the scrollable table body. Defaults to "60vh".
   */
  maxHeight?: string;
  /**
   * Fired when the user clicks a sortable column header.
   * The consumer is responsible for updating the data/page.
   */
  onSortChange?: (field: string, direction: "asc" | "desc") => void;
  /** Controlled sort field (optional – enables external sorting). */
  sortField?: string;
  /** Controlled sort direction (optional – enables external sorting). */
  sortDirection?: "asc" | "desc";
  // ----- Pagination props -------------------------------------------------
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VirtualizedTable<T>({
  data,
  columns,
  estimatedRowHeight = 48,
  maxHeight = "60vh",
  onSortChange,
  sortField,
  sortDirection = "desc",
  total,
  page = 1,
  limit = 50,
  onPageChange,
}: VirtualizedTableProps<T>) {
  // Internal sort state when the consumer has not provided controlled sorting
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

  const sorting: SortingState = sortField
    ? [{ id: sortField, desc: sortDirection === "desc" }]
    : internalSorting;

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(internalSorting) : updater;
      setInternalSorting(next);
      if (onSortChange && next.length > 0 && next[0]) {
        onSortChange(next[0].id, next[0].desc ? "desc" : "asc");
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: !!onPageChange,
    manualSorting: !!onSortChange,
    pageCount:
      total !== undefined && limit > 0 ? Math.ceil(total / limit) : undefined,
  });

  const { rows } = table.getRowModel();
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 10,
  });

  const totalPages =
    total !== undefined && limit > 0 ? Math.ceil(total / limit) : 1;
  const hasPagination = !!onPageChange && total !== undefined;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Scrollable table body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto border border-border-subtle rounded-t-xl bg-surface-card"
        style={{ maxHeight }}
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
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                    }
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc" && (
                        <span className="text-[11px]" aria-hidden="true">
                          ↑
                        </span>
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <span className="text-[11px]" aria-hidden="true">
                          ↓
                        </span>
                      )}
                      {!header.column.getIsSorted() && (
                        <span
                          className="text-[11px] opacity-20"
                          aria-hidden="true"
                        >
                          ↕
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((vRow) => {
              const row = rows[vRow.index];
              if (!row) return null;
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {hasPagination && (
        <div className="flex items-center justify-between px-4 py-2.5 border border-t-0 border-border-subtle rounded-b-xl bg-surface-base text-sm">
          <span className="text-on-surface-variant text-xs">
            Showing{" "}
            <strong>{Math.min((page - 1) * limit + 1, total ?? 0)}</strong>–
            <strong>{Math.min(page * limit, total ?? 0)}</strong> of{" "}
            <strong>{total}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="px-3 py-1 rounded-md border border-border-subtle bg-surface-elevated text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              Prev
            </button>
            <span className="text-xs text-on-surface-variant">
              {page} / {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              className="px-3 py-1 rounded-md border border-border-subtle bg-surface-elevated text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
