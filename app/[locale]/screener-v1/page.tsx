"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { PresetSelector } from "@/components/screener/PresetSelector";
import { FilterSidebarV1 } from "@/components/screener/FilterSidebar";
import { ScreenerTableV1 } from "@/components/screener/ScreenerTable";
import { ScreenerToolbar } from "@/components/screener/ScreenerToolbar";
import { ActiveFilters } from "@/components/screener/ActiveFilters";
import { ScreenerCharts } from "@/components/charts/ScreenerCharts";
import { Navbar } from "@/components/layout/Navbar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

import { fetchScreenerResults } from "@/lib/api";
import type { Filter, ScreenPreset, ScreenerResponse } from "@/types/screener";
import type { StockV1 } from "@/types/stock";
import type { Metrics } from "@/types/metrics";

type Row = StockV1 & Metrics;

const LIMIT = 50;

export default function ScreenerV1Page() {
  const { data: session } = useSession();
  const canExport =
    (session?.user as { plan?: string } | null | undefined)?.plan === "premium" ||
    (session?.user as { plan?: string } | null | undefined)?.plan === "pro";

  // State
  const [filters, setFilters] = useState<Filter[]>([]);
  const [activePreset, setActivePreset] = useState<ScreenPreset | null>(null);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [showCharts, setShowCharts] = useState(false);

  // Response state
  const [result, setResult] = useState<ScreenerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchScreenerResults({
        filters,
        presetId: activePreset?.id,
        sort: sortField ? { field: sortField, direction: sortDir } : undefined,
        page,
        limit: LIMIT,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [filters, activePreset, sortField, sortDir, page]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const handlePresetChange = (preset: ScreenPreset | null) => {
    setActivePreset(preset);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: Filter[]) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleRemoveFilter = (idx: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== idx));
    setPage(1);
  };

  const handleClearAll = () => {
    setFilters([]);
    setActivePreset(null);
    setPage(1);
  };

  const handleSortChange = (field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDir(direction);
    setPage(1);
  };

  const handleExportCSV = async () => {
    if (!result?.data) return;
    setExportLoading(true);
    try {
      const rows = result.data as Row[];
      const headers = [
        "Symbol",
        "Name",
        "Sector",
        "Industry",
        "P/E",
        "P/BV",
        "ROE %",
        "Revenue Growth %",
        "Net Margin %",
        "Debt/Equity",
      ];
      const csvRows = rows.map((r) =>
        [
          r.symbol,
          `"${r.name.replace(/"/g, '""')}"`,
          r.sector,
          r.industry,
          r.pe,
          r.pbv,
          r.roe,
          r.revenueGrowth,
          r.netMargin,
          r.debtToEquity,
        ].join(","),
      );
      const csv = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stockscope-screener-v1-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  };

  const tableData = (result?.data ?? []) as Row[];

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-surface-base text-text-primary">
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
            <p className="mb-2 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
              Strategy Presets
            </p>
            <PresetSelector
              activePresetId={activePreset?.id ?? null}
              onChange={handlePresetChange}
            />
          </div>
        </section>

        <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar */}
          <div className="rounded-2xl border border-border-subtle bg-surface-card/50 p-3 backdrop-blur-sm">
            <FilterSidebarV1
              filters={filters}
              onChange={handleFiltersChange}
            />
          </div>

          {/* Main content */}
          <main className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-3 md:p-5 min-h-[600px]">
            {/* Active filters + toolbar */}
            <div className="flex flex-col gap-2">
              <ActiveFilters
                filters={filters}
                presetName={activePreset?.name}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAll}
              />
              <ScreenerToolbar
                totalResults={result?.total ?? 0}
                onExportCSV={handleExportCSV}
                exportLoading={exportLoading}
                canExport={canExport}
              />
            </div>

            {/* Charts toggle */}
            <button
              onClick={() => setShowCharts((v) => !v)}
              className="self-start text-xs text-on-surface-variant hover:text-primary transition-colors underline-offset-2 hover:underline"
            >
              {showCharts ? "Hide charts" : "Show charts"}
            </button>

            {/* Charts */}
            {showCharts && !loading && tableData.length > 0 && (
              <ScreenerCharts data={tableData} />
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

            {/* Table */}
            {!loading && !error && (
              <ScreenerTableV1
                data={tableData}
                total={result?.total ?? 0}
                page={page}
                limit={LIMIT}
                onPageChange={setPage}
                onSortChange={handleSortChange}
              />
            )}
          </main>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}
