"use client";

import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { StockV1 } from "@/types/stock";
import type { Metrics } from "@/types/metrics";

type Row = StockV1 & Metrics;

interface ScreenerChartsProps {
  data: Row[];
}

const PE_BUCKETS = [0, 5, 10, 15, 20, 30, 50, 100];

function buildPeDistribution(data: Row[]) {
  const buckets = PE_BUCKETS.slice(0, -1).map((lower, i) => {
    const upper = PE_BUCKETS[i + 1]!;
    return {
      range: `${lower}–${upper}`,
      count: data.filter((r) => r.pe >= lower && r.pe < upper).length,
    };
  });
  // Add ">100" bucket
  buckets.push({
    range: ">100",
    count: data.filter((r) => r.pe >= 100).length,
  });
  return buckets;
}

export function ScreenerCharts({ data }: ScreenerChartsProps) {
  if (data.length === 0) return null;

  const peDistribution = buildPeDistribution(data.filter((d) => d.pe > 0));

  const scatterData = data
    .filter((d) => d.roe !== 0 || d.pbv !== 0)
    .slice(0, 200)
    .map((d) => ({ x: d.pbv, y: d.roe, name: d.symbol }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* P/E Distribution */}
      <div className="rounded-xl border border-border-subtle bg-surface-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          P/E Distribution
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={peDistribution} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.45)" }}
            />
            <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.45)" }} />
            <Tooltip
              contentStyle={{
                background: "#1a1b1e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {peDistribution.map((_, i) => (
                <Cell
                  key={i}
                  fill={`rgba(99,102,241,${0.4 + (i / peDistribution.length) * 0.6})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ROE vs P/BV Scatter */}
      <div className="rounded-xl border border-border-subtle bg-surface-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          ROE vs P/BV
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <ScatterChart margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="x"
              name="P/BV"
              type="number"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.45)" }}
              label={{
                value: "P/BV",
                position: "insideBottomRight",
                offset: -4,
                fontSize: 10,
                fill: "rgba(255,255,255,0.35)",
              }}
            />
            <YAxis
              dataKey="y"
              name="ROE %"
              type="number"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.45)" }}
              label={{
                value: "ROE %",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
                fill: "rgba(255,255,255,0.35)",
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                background: "#1a1b1e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(val, name) => {
                const num = typeof val === "number" ? val : 0;
                return [
                  name === "ROE %" ? `${num.toFixed(1)}%` : num.toFixed(2),
                  name as string,
                ];
              }}
            />
            <Scatter data={scatterData} fill="rgba(16,185,129,0.6)" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
