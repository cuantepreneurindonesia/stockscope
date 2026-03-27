"use client";

import { useEffect, useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import { AppShell } from "./AppShell";

import type { AnalyticsStats, Stock } from "@/types";

interface StocksResponse {
  success: boolean;
  data: Stock[];
  total: number;
}

interface AnalyticsResponse {
  success: boolean;
  data?: AnalyticsStats;
}

export function OverviewWorkspace(): React.ReactElement {
  const t = useTranslations("dashboard");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        const [stocksRes, analyticsRes] = await Promise.all([
          fetch("/api/stocks?limit=20&sortBy=hhi&sortDir=desc"),
          fetch("/api/analytics"),
        ]);

        if (!stocksRes.ok || !analyticsRes.ok) {
          throw new Error("Failed to load overview data");
        }

        const stocksJson = (await stocksRes.json()) as StocksResponse;
        const analyticsJson = (await analyticsRes.json()) as AnalyticsResponse;

        if (cancelled) return;

        setStocks(stocksJson.data ?? []);
        setAnalytics(analyticsJson.data ?? null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load overview data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(
    () => [
      { label: "Total Stocks", value: analytics?.totalStocks ?? 0 },
      { label: "Avg HHI", value: (analytics?.avgHHI ?? 0).toFixed(2) },
      { label: "Avg Float", value: `${(analytics?.avgFloat ?? 0).toFixed(2)}%` },
      { label: "High Risk (Red)", value: analytics?.byTier.red ?? 0 },
    ],
    [analytics],
  );

  return (
    <AppShell
      title={t("title.default", { count: analytics?.totalStocks ?? 0 })}
      subtitle="Governance concentration and ownership risk overview from live backend data."
    >
      <section className="grid-kpi" aria-label="Overview metrics">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="card">
            <p className="card-label">{kpi.label}</p>
            <p className="card-value">{kpi.value}</p>
          </article>
        ))}
      </section>

      <section className="card" aria-live="polite">
        <div className="section-head">
          <h2 className="section-title">Top Governance Concentration</h2>
          <p className="section-sub">Highest HHI stocks from /api/stocks</p>
        </div>

        {loading && <p className="section-sub">Loading stocks...</p>}
        {!loading && error && <p className="error-text">{error}</p>}
        {!loading && !error && stocks.length === 0 && (
          <p className="section-sub">No stocks available for the current data source.</p>
        )}

        {!loading && !error && stocks.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Issuer</th>
                  <th scope="col">Tier</th>
                  <th scope="col" className="num-right">HHI</th>
                  <th scope="col" className="num-right">Float %</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.code}>
                    <td className="mono">{stock.code}</td>
                    <td>{stock.issuer}</td>
                    <td>
                      <span className={`tier-pill tier-${stock.tier.toLowerCase()}`}>{stock.tier}</span>
                    </td>
                    <td className="num-right">{stock.hhi.toFixed(2)}</td>
                    <td className="num-right">{stock.floatPercentage.toFixed(2)}%</td>
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
