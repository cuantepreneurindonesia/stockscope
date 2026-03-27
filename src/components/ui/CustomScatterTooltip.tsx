"use client";

import React from "react";

import { THEME_COLORS, TIER_COLORS } from "@/lib/constants";

import type { ScatterChartPoint } from "@/types";

interface TooltipPayload {
  payload?: Partial<ScatterChartPoint>;
}

interface CustomScatterTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

/**
 * UI Component: CustomScatterTooltip
 */
export function CustomScatterTooltip({
  active,
  payload,
}: CustomScatterTooltipProps): React.ReactElement | null {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div
      style={{
        background: THEME_COLORS.bgContent,
        border: `1px solid ${THEME_COLORS.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: THEME_COLORS.text,
          fontFamily: "monospace",
          marginBottom: 4,
        }}
      >
        {data.code}
      </div>
      <div style={{ color: THEME_COLORS.textTertiary }}>
        {data.issuer?.substring(0, 30)}
      </div>
      <div
        style={{
          color: TIER_COLORS[data.tier as keyof typeof TIER_COLORS],
          marginTop: 4,
        }}
      >
        {data.tier} Risk
      </div>
      <div style={{ color: THEME_COLORS.textSecondary, marginTop: 2 }}>
        HHI:{" "}
        <span style={{ fontFamily: "monospace" }}>{data.hhi?.toFixed(0)}</span>
      </div>
      <div style={{ color: THEME_COLORS.textSecondary }}>
        Float:{" "}
        <span style={{ fontFamily: "monospace" }}>
          {(data.ff ?? 0).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
