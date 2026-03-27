"use client";

import React, { useMemo } from "react";

import type { AnalyticsStats, Stock } from "@/types";

interface StatsTabProps {
  stats: AnalyticsStats | null;
  stocks: Stock[];
  loading?: boolean;
}

export function StatsTab({
  stats,
  loading = false,
}: StatsTabProps): React.ReactElement {
  const statItems = useMemo(() => {
    if (!stats) return null;
    return [
      { label: "Total Stocks", value: stats.totalStocks.toString() },
      {
        label: "Red Tier (HHI > 2500)",
        value: stats.byTier.red.toString(),
        sub: `${((stats.byTier.red / stats.totalStocks) * 100).toFixed(1)}% of total`,
        color: "#E76F51",
      },
      {
        label: "Amber Tier (HHI 1500-2500)",
        value: stats.byTier.amber.toString(),
        sub: `${((stats.byTier.amber / stats.totalStocks) * 100).toFixed(1)}% of total`,
        color: "#E9C46A",
      },
      {
        label: "Green Tier (HHI < 1500)",
        value: stats.byTier.green.toString(),
        sub: `${((stats.byTier.green / stats.totalStocks) * 100).toFixed(1)}% of total`,
        color: "#2A9D8F",
      },
      { label: "Average HHI", value: stats.avgHHI.toFixed(0) },
      { label: "Average Float %", value: stats.avgFloat.toFixed(1) + "%" },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              background: "#09131f",
              border: "1px solid #132030",
              borderRadius: 10,
              padding: 20,
              height: 100,
            }}
          />
        ))}
      </div>
    );
  }

  if (!stats || !statItems) {
    return (
      <div style={{ color: "#a8c8e8", padding: 20 }}>
        No analytics data available
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {statItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: "#09131f",
              border: "1px solid #132030",
              borderRadius: 10,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#6b8aad",
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              {item.label.toUpperCase()}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
                color: item.color || "#e8f4f8",
              }}
            >
              {item.value}
            </div>
            {item.sub && (
              <div style={{ fontSize: 10, color: "#6b8aad", marginTop: 4 }}>
                {item.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Flags Distribution */}
      {Object.keys(stats.byFlag).length > 0 && (
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
              marginBottom: 16,
            }}
          >
            FLAGS DISTRIBUTION
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(stats.byFlag).map(([flag, count]) => (
              <div
                key={flag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#a8c8e8", fontSize: 12 }}>{flag}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 120,
                      background: "#132030",
                      borderRadius: 4,
                      height: 6,
                    }}
                  >
                    <div
                      style={{
                        width: `${(count / stats.totalStocks) * 100}%`,
                        background: "#457b9d",
                        borderRadius: 4,
                        height: 6,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      color: "#e8f4f8",
                      fontWeight: 600,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      width: 40,
                      textAlign: "right",
                    }}
                  >
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
