"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "./AppShell";

import type { OwnerWithPortfolio } from "@/types";

interface OwnersResponse {
  success: boolean;
  data: OwnerWithPortfolio[];
  error?: string;
}

export function OwnersWorkspace(): React.ReactElement {
  const [owners, setOwners] = useState<OwnerWithPortfolio[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOwners(): Promise<void> {
      try {
        setLoading(true);
        const res = await fetch("/api/owners?limit=100&detailed=true");
        if (!res.ok) {
          throw new Error(`Failed to fetch owners (${res.status})`);
        }
        const json = (await res.json()) as OwnersResponse;
        if (!cancelled) setOwners(json.data ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch owners");
          setOwners([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOwners();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return owners;
    return owners.filter((owner) => owner.name.toLowerCase().includes(q));
  }, [owners, search]);

  return (
    <AppShell
      title="Owners Intelligence"
      subtitle="Portfolio concentration and top-holder signals from existing owner APIs."
    >
      <section className="card">
        <label className="field" htmlFor="owner-search">
          <span>Find owner</span>
          <input
            id="owner-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type owner name"
            aria-label="Search owner by name"
          />
        </label>
      </section>

      <section className="card" aria-live="polite">
        {loading && <p className="section-sub">Loading owners...</p>}
        {!loading && error && <p className="error-text">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="section-sub">No owners found for the current query.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="owner-list">
            {filtered.map((owner) => (
              <details key={owner.name} className="owner-item">
                <summary>
                  <span>{owner.name}</span>
                  <span className="mono">{owner.type}</span>
                  <span className="num-right">{owner.totalPct.toFixed(2)}%</span>
                </summary>
                <div className="owner-portfolio">
                  {owner.stocks.length === 0 && <p className="section-sub">No portfolio rows available.</p>}
                  {owner.stocks.length > 0 && (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th scope="col">Code</th>
                          <th scope="col">Issuer</th>
                          <th scope="col" className="num-right">Holding %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {owner.stocks.map((item) => (
                          <tr key={`${owner.name}-${item.code}`}>
                            <td className="mono">{item.code}</td>
                            <td>{item.issuer || "-"}</td>
                            <td className="num-right">{item.pct.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
