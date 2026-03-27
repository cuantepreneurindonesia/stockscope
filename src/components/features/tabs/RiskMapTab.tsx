"use client";

import React, { useCallback } from "react";

import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StockDetail } from "@/components/features/StockDetail";
import { CustomScatterTooltip } from "@/components/ui/CustomScatterTooltip";
import { TIER_COLORS } from "@/lib/constants";

import type { ScatterChartPoint, Stock } from "@/types";

interface RiskMapTabProps {
  filtered: Stock[];
  selectedStock: Stock | null;
  setSelectedStock: (stock: Stock | null) => void;
  tierFilter: Stock["tier"] | null;
  setTierFilter: (tier: Stock["tier"] | null) => void;
}

/** Recharts Scatter passes payload with possible nested structure */
interface ScatterClickPayload {
  code?: string;
  payload?: { code?: string };
}

export function RiskMapTab({
  filtered,
  selectedStock,
  setSelectedStock,
  tierFilter,
  setTierFilter,
}: RiskMapTabProps): React.ReactElement {
  const scatterData: ScatterChartPoint[] = filtered.map((s) => ({
    ...s,
    ff: s.floatPercentage ?? 0,
  }));

  const handleScatterClick = useCallback(
    (payload: ScatterClickPayload) => {
      const code = payload?.code ?? payload?.payload?.code;
      const stock = scatterData.find((s) => s.code === code);
      setSelectedStock(
        stock && selectedStock?.code === stock.code ? null : (stock ?? null),
      );
    },
    [scatterData, selectedStock?.code, setSelectedStock],
  );

  return (
    <div
      className="scatter-layout"
      style={{ display: "flex", gap: 20, flexWrap: "wrap" }}
    >
      <div
        style={{
          flex: 1,
          background: "#09131f",
          border: "1px solid #132030",
          borderRadius: 10,
          padding: 20,
          minWidth: 400,
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
          GOVERNANCE RISK MAP
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#e8f4f8",
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Free Float % vs. HHI Concentration — Click a dot to inspect
        </div>
        <div style={{ fontSize: 11, color: "#6b8aad", marginBottom: 16 }}>
          Reference lines: HHI 2,500 (high concentration threshold) · Float 15%
          (IDX guideline)
        </div>
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#132030" />
            <XAxis
              dataKey="ff"
              name="Free Float %"
              type="number"
              domain={[0, 100]}
              tick={{ fill: "#6b8aad", fontSize: 10 }}
              label={{
                value: "Free Float %",
                position: "insideBottom",
                offset: -10,
                fill: "#6b8aad",
                fontSize: 11,
              }}
            />
            <YAxis
              dataKey="hhi"
              name="HHI"
              type="number"
              domain={[0, 10000]}
              tick={{ fill: "#6b8aad", fontSize: 10 }}
              label={{
                value: "HHI",
                angle: -90,
                position: "insideLeft",
                fill: "#6b8aad",
                fontSize: 11,
              }}
            />
            <Tooltip content={<CustomScatterTooltip />} />
            <ReferenceLine
              y={2500}
              stroke="#e9c46a"
              strokeDasharray="4 4"
              label={{ value: "HHI 2,500", fill: "#e9c46a", fontSize: 9 }}
            />
            <ReferenceLine
              x={15}
              stroke="#457B9D"
              strokeDasharray="4 4"
              label={{ value: "15%", fill: "#457B9D", fontSize: 9 }}
            />
            {(["Red", "Amber", "Green"] as const).map((tier) => (
              <Scatter
                key={tier}
                name={tier}
                data={scatterData.filter((s) => s.tier === tier)}
                fill={TIER_COLORS[tier]}
                fillOpacity={0.7}
                onClick={handleScatterClick}
                cursor="pointer"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          {(["Red", "Amber", "Green"] as const).map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                color: TIER_COLORS[t],
                cursor: "pointer",
              }}
              onClick={() => setTierFilter(tierFilter === t ? null : t)}
            >
              ● {t} ({filtered.filter((s) => s.tier === t).length})
            </span>
          ))}
        </div>
      </div>
      {selectedStock && (
        <StockDetail
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  );
}
