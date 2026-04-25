"use client";

/**
 * ScreenerWorkspace (features/screener)
 *
 * The unified entry-point component for the Screener V1 workspace.
 *
 * Wires together:
 *  - useScreenerState (state management + API calls)
 *  - FilterSidebarV1 (metric filters)
 *  - PresetSelector (strategy presets)
 *  - ActiveFilters (chip strip showing active filters)
 *  - VirtualizedTable (generic virtualized table via ScreenerTableV1)
 *  - LightweightChart (P/E distribution + ROE vs P/BV scatter)
 *  - ExportCSVButton (client-side CSV download)
 *
 * This component is intentionally self-contained and does NOT depend on any
 * existing ScreenerWorkspace implementations in other directories.
 */

import { useSession } from "next-auth/react";
import type { ColumnDef } from "@tanstack/react-table";

import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { Navbar } from "@/components/layout/Navbar";
import { ActiveFilters } from "@/components/screener/ActiveFilters";
import { FilterSidebarV1 } from "@/components/screener/FilterSidebar";
import { PresetSelector } from "@/components/screener/PresetSelector";
import { ExportCSVButton } from "@/components/ui/ExportCSVButton";
import { LightweightChart } from "@/components/ui/LightweightChart";
import { VirtualizedTable } from "@/components/ui/VirtualizedTable";
import { METRIC_META } from "@/core/metrics/metrics";
import type { Metrics } from "@/types/metrics";
import type { StockV1 } from "@/types/stock";

import { useScreenerState } from "./useScreenerState";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Row = StockV1 & Metrics;

// ---------------------------------------------------------------------------
// Table columns (reused from existing ScreenerTableV1 definition)
// ---------------------------------------------------------------------------

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

const COLUMNS: ColumnDef<Row>[] = [
  {
    accessorKey: "symbol",
    header: "Symbol",
    size: 110,
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
    size: 140,
    cell: ({ getValue }) => (
      <span className="text-xs text-on-surface-variant">
        {getValue() as string}
      </span>
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
    size: 130,
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

// ---------------------------------------------------------------------------
// CSV export headers (must match Row keys)
// ---------------------------------------------------------------------------

const CSV_HEADERS: { key: keyof Row; label: string }[] = [
  { key: "symbol", label: "Symbol" },
  { key: "name", label: "Name" },
  { key: "sector", label: "Sector" },
  { key: "industry", label: "Industry" },
  { key: "pe", label: "P/E" },
  { key: "pbv", label: "P/BV" },
  { key: "roe", label: "ROE %" },
  { key: "revenueGrowth", label: "Revenue Growth %" },
  { key: "netMargin", label: "Net Margin %" },
  { key: "debtToEquity", label: "Debt/Equity" },
];

function csvFilename(): string {
  return `stockscope-screener-v1-${new Date().toISOString().slice(0, 10)}.csv`;
}

// ---------------------------------------------------------------------------
// Chart filter predicates
// ---------------------------------------------------------------------------

function hasValidPE(row: Row): boolean {
  return row.pe != null && isFinite(row.pe) && row.pe > 0;
}

function hasValidROEAndPBV(row: Row): boolean {
  return (
    row.roe != null &&
    isFinite(row.roe) &&
    row.pbv != null &&
    isFinite(row.pbv)
  );
}

// ---------------------------------------------------------------------------
// Chart data helpers
// ---------------------------------------------------------------------------

const PE_BUCKETS = [0, 5, 10, 15, 20, 30, 50, 100];

function buildPeDistribution(data: Row[]) {
  const counts = new Array<number>(PE_BUCKETS.length).fill(0);

  for (const row of data) {
    const pe = row.pe;
    if (pe == null || !isFinite(pe)) continue;
    if (pe >= 100) {
      counts[PE_BUCKETS.length - 1]++;
      continue;
    }
    for (let i = 0; i < PE_BUCKETS.length - 1; i++) {
      // Bounds are guaranteed by loop condition: i ≤ PE_BUCKETS.length - 2
      if (pe >= PE_BUCKETS[i] && pe < PE_BUCKETS[i + 1]) {
        counts[i]++;
        break;
      }
    }
  }

  const buckets = PE_BUCKETS.slice(0, -1).map((lower, i) => ({
    // Indices i and i+1 are guaranteed in-bounds by slice(0,-1)
    range: `${lower}–${PE_BUCKETS[i + 1]}`,
    count: counts[i] ?? 0,
  }));
  buckets.push({ range: ">100", count: counts[PE_BUCKETS.length - 1] ?? 0 });
  return buckets;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScreenerWorkspace() {
  const { data: session } = useSession();
  const userPlan =
    (session?.user as { plan?: string } | undefined)?.plan ?? "free";
  const canExport = userPlan === "premium" || userPlan === "pro";

  const {
    state,
    result,
    loading,
    error,
    setFilters,
    removeFilter,
    setPreset,
    setSort,
    setPage,
    toggleCharts,
    reset,
  } = useScreenerState();

  const tableData = (result?.data ?? []) as Row[];

  const peChartData = buildPeDistribution(
    tableData.filter(hasValidPE),
  ) as Record<string, unknown>[];

  const scatterData = tableData
    .filter(hasValidROEAndPBV)
    .slice(0, 200)
    .map((d) => ({ x: d.pbv, y: d.roe }));

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-surface-base text-text-primary">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_500px_at_85%_-10%,rgba(59,130,246,0.22),transparent),radial-gradient(900px_400px_at_10%_25%,rgba(16,185,129,0.12),transparent)]" />

      <Navbar />

      <div className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-4 md:px-6 md:pb-8 md:pt-6 lg:px-8">
        {/* Page header */}
        <section className="mb-5 rounded-2xl border border-border-subtle bg-surface-card/70 p-4 backdrop-blur-sm md:p-6">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Stock Screener V1
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Filter and rank IDX stocks using precomputed financial metrics and
            strategy presets.
          </p>

          {/* Preset selector */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Strategy Presets
            </p>
            <PresetSelector
              activePresetId={state.activePreset?.id ?? null}
              onChange={setPreset}
            />
          </div>
        </section>

        <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Filter sidebar */}
          <div className="rounded-2xl border border-border-subtle bg-surface-card/50 p-3 backdrop-blur-sm">
            <FilterSidebarV1 filters={state.filters} onChange={setFilters} />
          </div>

          {/* Main content */}
          <main className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-3 md:p-5 min-h-[600px]">
            {/* Active filters + toolbar */}
            <div className="flex flex-col gap-2">
              <ActiveFilters
                filters={state.filters}
                presetName={state.activePreset?.name}
                onRemoveFilter={removeFilter}
                onClearAll={reset}
              />

              <div className="flex items-center justify-between gap-4 py-2 px-1">
                <p className="text-sm text-on-surface-variant">
                  <span className="font-semibold text-on-surface">
                    {result?.total ?? 0}
                  </span>{" "}
                  {(result?.total ?? 0) === 1 ? "result" : "results"}
                </p>

                <div className="flex items-center gap-2">
                  {/* Charts toggle */}
                  <button
                    onClick={toggleCharts}
                    className="text-xs text-on-surface-variant hover:text-primary transition-colors underline-offset-2 hover:underline"
                    aria-pressed={state.showCharts}
                  >
                    {state.showCharts ? "Hide charts" : "Show charts"}
                  </button>

                  {/* CSV export */}
                  <ExportCSVButton<Row>
                    data={tableData}
                    headers={CSV_HEADERS}
                    filename={csvFilename()}
                    disabled={loading}
                    canExport={canExport}
                  />
                </div>
              </div>
            </div>

            {/* Charts */}
            {state.showCharts && !loading && tableData.length > 0 && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <LightweightChart
                  type="bar"
                  title="P/E Distribution"
                  data={peChartData}
                  xDataKey="range"
                  series={[{ dataKey: "count" }]}
                  height={180}
                />
                <LightweightChart
                  type="scatter"
                  title="ROE vs P/BV"
                  data={scatterData}
                  xLabel="P/BV"
                  yLabel="ROE %"
                  height={180}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="flex-1 animate-pulse rounded-xl bg-surface-elevated/20 min-h-[400px]" />
            )}

            {/* Empty state */}
            {!loading && !error && tableData.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
                No stocks match your current filters.{" "}
                <button
                  onClick={reset}
                  className="ml-2 text-primary hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}

            {/* Virtualized table */}
            {!loading && !error && tableData.length > 0 && (
              <VirtualizedTable<Row>
                data={tableData}
                columns={COLUMNS}
                sortField={state.sortField}
                sortDirection={state.sortDirection}
                onSortChange={setSort}
                total={result?.total}
                page={state.page}
                limit={result?.limit ?? 50}
                onPageChange={setPage}
              />
            )}
          </main>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}
