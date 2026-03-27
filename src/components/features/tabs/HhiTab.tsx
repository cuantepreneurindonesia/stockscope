"use client";

import React from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Tooltip2 } from "@/components/ui/TooltipAlt";
import { HHI_COLORS, METRIC_DESCRIPTIONS } from "@/lib/constants";
import { getHierarchyLevel } from "@/lib/services/tabStatsService";

import type { HhiHistBin, HierarchyLevel, Stock, TabStats } from "@/types";

interface HhiTabProps {
  stats: TabStats;
  filtered: Stock[];
  hhiHist: HhiHistBin[];
  hhiFilter: string | null;
  setHhiFilter: (hl: string | null) => void;
}

export function HhiTab({
  stats,
  filtered,
  hhiHist,
  hhiFilter,
  setHhiFilter,
}: HhiTabProps): React.ReactElement {
  return (
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
        HHI DISTRIBUTION
        <Tooltip2 text={METRIC_DESCRIPTIONS.HHI} />
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#e8f4f8",
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {stats.highConc > stats.total / 2
          ? `${Math.round(((stats.highConc || 0) / (stats.total || 1)) * 100)}% of Filtered Stocks Are Highly Concentrated (HHI > 2,500)`
          : "HHI Distribution of Filtered Stocks"}
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={hhiHist}>
          <CartesianGrid strokeDasharray="3 3" stroke="#132030" />
          <XAxis dataKey="range" tick={{ fill: "#6b8aad", fontSize: 11 }} />
          <YAxis tick={{ fill: "#6b8aad", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "#09131f",
              border: "1px solid #1e3a52",
              borderRadius: 6,
            }}
            labelStyle={{ color: "#e8f4f8" }}
          />
          <Legend wrapperStyle={{ color: "#6b8aad", fontSize: 11 }} />
          <Bar
            dataKey="Low"
            stackId="a"
            fill="#2A9D8F"
            name="Low HHI (<1,500)"
          />
          <Bar
            dataKey="Moderate"
            stackId="a"
            fill="#E9C46A"
            name="Moderate HHI (1,500–2,500)"
          />
          <Bar
            dataKey="High"
            stackId="a"
            fill="#E76F51"
            name="High HHI (>2,500)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div
        style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}
      >
        {(["Low", "Moderate", "High"] as HierarchyLevel[]).map((hl) => {
          const cnt = filtered.filter(
            (s) => getHierarchyLevel(s.hhi) === hl,
          ).length;
          return (
            <div
              key={hl}
              onClick={() => setHhiFilter(hhiFilter === hl ? null : hl)}
              style={{
                background: "#060d18",
                border: `1px solid ${HHI_COLORS[hl]}55`,
                borderRadius: 8,
                padding: "12px 18px",
                cursor: "pointer",
                minWidth: 120,
              }}
            >
              <div style={{ fontSize: 10, color: "#6b8aad", marginBottom: 4 }}>
                {hl.toUpperCase()} HHI
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: HHI_COLORS[hl],
                  fontFamily: "DM Mono, monospace",
                }}
              >
                {cnt}
              </div>
              <div style={{ fontSize: 10, color: "#6b8aad" }}>
                {stats.total ? Math.round((cnt / stats.total) * 100) : 0}% of
                filtered
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
