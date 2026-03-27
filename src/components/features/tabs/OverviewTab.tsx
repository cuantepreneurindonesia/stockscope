"use client";

import React, { useMemo } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { TIER_COLORS } from "@/lib/constants";
import { calculateHhiDistribution } from "@/lib/services/analyticsService";

import type { AnalyticsStats, Stock } from "@/types";

interface OverviewTabProps {
  stocks: Stock[];
  stats: AnalyticsStats | null;
  loading?: boolean;
}

export function OverviewTab({
  stocks,
  stats,
  loading = false,
}: OverviewTabProps): React.ReactElement {
  const tierDist = useMemo(() => {
    return (Object.entries(TIER_COLORS) as [string, string][]).map(
      ([tier, color]) => ({
        name: tier,
        value: stocks.filter((s) => s.tier === tier).length,
        color,
      }),
    );
  }, [stocks]);

  const hhiData = useMemo(() => {
    const buckets = calculateHhiDistribution(stocks);
    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));
  }, [stocks]);

  if (loading) {
    return (
      <div className="overview-grid">
        <div
          style={{
            background: "#09131f",
            border: "1px solid #132030",
            borderRadius: 10,
            padding: 20,
            height: 300,
          }}
        />
        <div
          style={{
            background: "#09131f",
            border: "1px solid #132030",
            borderRadius: 10,
            padding: 20,
            height: 300,
          }}
        />
      </div>
    );
  }

  const redCount = stocks.filter((s) => s.tier === "Red").length;
  const greenCount = stocks.filter((s) => s.tier === "Green").length;
  const amberCount = stocks.filter((s) => s.tier === "Amber").length;

  return (
    <div className="overview-grid">
      {/* Risk Distribution Chart */}
      <div
        style={{
          background: "#09131f",
          border: "1px solid #132030",
          borderRadius: 10,
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#6b8aad",
            letterSpacing: 2,
            marginBottom: 4,
          }}
        >
          RISK DISTRIBUTION
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#e8f4f8",
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          {redCount > greenCount + amberCount
            ? "Most Stocks Have Governance Concerns"
            : "Risk Spread Across Tiers"}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={tierDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="#132030" />
            <XAxis dataKey="name" tick={{ fill: "#6b8aad", fontSize: 11 }} />
            <YAxis tick={{ fill: "#6b8aad", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#09131f",
                border: "1px solid #1e3a52",
                borderRadius: 6,
              }}
              labelStyle={{ color: "#e8f4f8" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} cursor="pointer">
              {tierDist.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 10, color: "#457B9D", marginTop: 8 }}>
          ↑ Click bars to filter
        </div>
      </div>

      {/* HHI Concentration Chart */}
      <div
        style={{
          background: "#09131f",
          border: "1px solid #132030",
          borderRadius: 10,
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#6b8aad",
            letterSpacing: 2,
            marginBottom: 4,
          }}
        >
          HHI CONCENTRATION
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#e8f4f8",
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          {stats && stats.avgHHI > 2500
            ? "High Average Concentration Across Market"
            : "Concentration Spread Across Zones"}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hhiData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#132030" />
            <XAxis dataKey="range" tick={{ fill: "#6b8aad", fontSize: 9 }} />
            <YAxis tick={{ fill: "#6b8aad", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#09131f",
                border: "1px solid #1e3a52",
                borderRadius: 6,
              }}
              labelStyle={{ color: "#e8f4f8" }}
            />
            <Bar dataKey="count" fill="#457b9d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 10, color: "#457B9D", marginTop: 8 }}>
          ↑ HHI zones distribution
        </div>
      </div>

      {/* Key Findings */}
      <div
        style={{
          background: "#09131f",
          border: "1px solid #132030",
          borderRadius: 10,
          padding: 20,
          gridColumn: "1 / -1",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#6b8aad",
            letterSpacing: 2,
            marginBottom: 12,
          }}
        >
          KEY FINDINGS
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              id: "red",
              icon: "⚠️",
              stat: `${redCount} stocks`,
              desc: `classified as Red risk (${stocks.length ? Math.round((redCount / stocks.length) * 100) : 0}%)`,
            },
            {
              id: "float",
              icon: "📉",
              stat: `${stats?.avgFloat?.toFixed(1) || "—"}% avg float`,
              desc: "average free float percentage",
            },
            {
              id: "hhi",
              icon: "📊",
              stat: `HHI avg ${stats?.avgHHI?.toFixed(0) || "—"}`,
              desc:
                stats?.avgHHI && stats.avgHHI > 2500
                  ? "deep into 'High concentration' zone"
                  : "concentration index average",
            },
            {
              id: "amber",
              icon: "🟡",
              stat: `${amberCount} stocks`,
              desc: "moderate concentration (HHI 1500–2500)",
            },
            {
              id: "green",
              icon: "🟢",
              stat: `${greenCount} stocks`,
              desc: "well-distributed ownership (HHI < 1500)",
            },
            {
              id: "total",
              icon: "📈",
              stat: `${stocks.length} total`,
              desc: "securities tracked in the dashboard",
            },
          ].map((f) => (
            <div
              key={f.id}
              style={{
                background: "#060d18",
                borderRadius: 8,
                padding: "12px 14px",
                borderLeft: "3px solid #1e3a52",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#e8f4f8",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {f.stat}
              </div>
              <div style={{ fontSize: 11, color: "#6b8aad", marginTop: 2 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
