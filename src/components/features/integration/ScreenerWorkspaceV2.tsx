"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "./AppShell";

import type { EnrichedStock } from "@/types/unified";

interface EnrichedResponse {
  success: boolean;
  data: EnrichedStock[];
  total: number;
  error?: string;
}

interface SectorsResponse {
  sectors: string[];
}

export function ScreenerWorkspaceV2(): React.ReactElement {
  const [stocks, setStocks] = useState<EnrichedStock[]>([]);
  const [sectors, setSectors] = useState<string[]>(["All"]);
  const [query, setQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedTier, setSelectedTier] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState("composite");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSectors(): Promise<void> {
      try {
        const res = await fetch("/api/screener/filters");
        if (!res.ok) return;
        const json = (await res.json()) as SectorsResponse;
        if (!cancelled && Array.isArray(json.sectors) && json.sectors.length > 0) {
          setSectors(json.sectors);
        }
      } catch {
        if (!cancelled) setSectors(["All"]);
      }
    }

    loadSectors();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStocks(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (query) params.set("search", query);
        if (selectedSector !== "All") params.set("sector", selectedSector);
        if (selectedTier !== "all") params.set("aiTier", selectedTier);
        if (minScore > 0) params.set("minScore", String(minScore));
        params.set("sortBy", sortBy);
        params.set("order", order);
        params.set("limit", "200");

        const res = await fetch(`/api/stocks/enriched?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch screener data (${res.status})`);
        }

        const json = (await res.json()) as EnrichedResponse;
        setStocks(json.data ?? []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to fetch screener data");
      } finally {
        setLoading(false);
      }
    }

    loadStocks();
    return () => controller.abort();
  }, [query, selectedSector, selectedTier, minScore, sortBy, order]);

  const summary = useMemo(() => {
    if (stocks.length === 0) {
      return { count: 0, avgScore: 0, positives: 0 };
    }

    const composite = stocks.map((s) => s.scores?.composite ?? 0);
    const avgScore = composite.reduce((sum, value) => sum + value, 0) / composite.length;
    const positives = stocks.filter((s) => (s.change ?? 0) >= 0).length;
    return { count: stocks.length, avgScore, positives };
  }, [stocks]);

  return (
    <AppShell
      title="AI Screener Workspace"
      subtitle="Filter enriched governance plus market data using existing backend endpoints."
    >
      <section className="card">
        <div className="filter-grid">
          <label className="field">
            <span>Search</span>
            <input
              aria-label="Search stock"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ticker or issuer"
            />
          </label>

          <label className="field">
            <span>Sector</span>
            <select
              aria-label="Select sector"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>AI Tier</span>
            <select
              aria-label="Select AI tier"
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
            >
              <option value="all">All</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>

          <label className="field">
            <span>Minimum Score</span>
            <input
              aria-label="Minimum composite score"
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
            />
          </label>

          <label className="field">
            <span>Sort By</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="composite">Composite</option>
              <option value="pe">PE</option>
              <option value="change">Change</option>
              <option value="roe">ROE</option>
              <option value="dividendYield">Dividend Yield</option>
            </select>
          </label>

          <label className="field">
            <span>Order</span>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid-kpi">
        <article className="card">
          <p className="card-label">Matches</p>
          <p className="card-value">{summary.count}</p>
        </article>
        <article className="card">
          <p className="card-label">Average Composite</p>
          <p className="card-value">{summary.avgScore.toFixed(1)}</p>
        </article>
        <article className="card">
          <p className="card-label">Positive Daily Change</p>
          <p className="card-value">{summary.positives}</p>
        </article>
      </section>

      <section className="card" aria-live="polite">
        {loading && <p className="section-sub">Loading screener results...</p>}
        {!loading && error && <p className="error-text">{error}</p>}
        {!loading && !error && stocks.length === 0 && (
          <p className="section-sub">No screener matches. Adjust filters and try again.</p>
        )}

        {!loading && !error && stocks.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Issuer</th>
                  <th scope="col" className="num-right">Composite</th>
                  <th scope="col" className="num-right">PE</th>
                  <th scope="col" className="num-right">ROE</th>
                  <th scope="col" className="num-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.code}>
                    <td className="mono">{stock.code}</td>
                    <td>{stock.issuer}</td>
                    <td className="num-right">{stock.scores?.composite ?? 0}</td>
                    <td className="num-right">{stock.pe?.toFixed(2) ?? "-"}</td>
                    <td className="num-right">{stock.roe?.toFixed(2) ?? "-"}%</td>
                    <td className="num-right">
                      <span
                        className={(stock.change ?? 0) >= 0 ? "positive-text" : "negative-text"}
                      >
                        {stock.change?.toFixed(2) ?? "-"}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
