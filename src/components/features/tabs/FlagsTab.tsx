"use client";

import React from "react";

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

import { FLAG_DESCRIPTIONS } from "@/lib/constants";

import type { BarChartClickPayload, FlagCount, TabStats } from "@/types";

interface FlagsTabProps {
  stats: TabStats;
  flagCounts: FlagCount[];
  flagFilter: string | null;
  setFlagFilter: (flag: string | null) => void;
}

const FLAG_COLORS = ["#d62828", "#e76f51", "#e9843a", "#e9c46a", "#6d6875"];

export function FlagsTab({
  stats,
  flagCounts,
  flagFilter,
  setFlagFilter,
}: FlagsTabProps): React.ReactElement {
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
        GOVERNANCE FLAGS
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#e8f4f8",
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {flagCounts[0]?.count
          ? `"${flagCounts[0].flag}" Affects ${flagCounts[0].count} of ${stats.total} Filtered Stocks`
          : "Flag Distribution"}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={flagCounts}
          layout="vertical"
          onClick={(d) => {
            const payload = (d as BarChartClickPayload<FlagCount>)
              ?.activePayload?.[0]?.payload;
            if (payload) {
              setFlagFilter(flagFilter === payload.flag ? null : payload.flag);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#132030" />
          <XAxis type="number" tick={{ fill: "#6b8aad", fontSize: 10 }} />
          <YAxis
            type="category"
            dataKey="flag"
            width={140}
            tick={{ fill: "#a8c8e8", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: "#09131f",
              border: "1px solid #1e3a52",
              borderRadius: 6,
            }}
            labelStyle={{ color: "#e8f4f8" }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer">
            {flagCounts.map((f, i) => (
              <Cell key={f.flag} fill={FLAG_COLORS[i % FLAG_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 10, color: "#457B9D", marginTop: 8 }}>
        ↑ Click bars to filter stocks by flag
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginTop: 20,
        }}
      >
        {Object.entries(FLAG_DESCRIPTIONS).map(([flag, def]) => (
          <div
            key={flag}
            onClick={() => setFlagFilter(flagFilter === flag ? null : flag)}
            style={{
              background: "#060d18",
              border: `1px solid ${flagFilter === flag ? "#457B9D" : "#1e3a52"}`,
              borderRadius: 8,
              padding: "12px 14px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#e8f4f8",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {flag}
            </div>
            <div style={{ fontSize: 10, color: "#6b8aad", lineHeight: 1.4 }}>
              {def}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
