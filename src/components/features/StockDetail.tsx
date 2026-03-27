"use client";

import React from "react";

import { FlagPill } from "@/components/ui";
import { THEME_COLORS, TIER_COLORS } from "@/lib/constants";

import type { Stock } from "@/types";

interface StockDetailProps {
  stock: Stock;
  onClose: () => void;
}

export function StockDetail({
  stock,
  onClose,
}: StockDetailProps): React.ReactElement | null {
  if (!stock) return null;

  const ff = stock.floatPercentage ?? 0;
  const shareholders = stock.topHolder
    ? [{ n: stock.topHolder, t: stock.ownerType ?? "OT", p: stock.c1 }]
    : [];

  const metrics = [
    {
      label: "HHI",
      val: stock.hhi.toFixed(0),
      max: 10000,
      color:
        stock.hhi > 2500 ? "#E76F51" : stock.hhi > 1500 ? "#E9C46A" : "#2A9D8F",
    },
    {
      label: "Free Float",
      val: ff.toFixed(1) + "%",
      max: 100,
      pct: ff,
      color: ff < 5 ? "#d62828" : ff < 15 ? "#e9c46a" : "#2A9D8F",
    },
    {
      label: "C1 (Top holder)",
      val: (stock.c1 ?? 0).toFixed(1) + "%",
      max: 100,
      pct: stock.c1 ?? 0,
      color: (stock.c1 ?? 0) > 75 ? "#e76f51" : "#e9c46a",
    },
    {
      label: "C3 (Top 3)",
      val: (stock.c3 ?? 0).toFixed(1) + "%",
      max: 100,
      pct: stock.c3 ?? 0,
      color: "#e9843a",
    },
  ];

  return (
    <div
      style={{
        background: THEME_COLORS.bgAlt,
        border: `1px solid ${THEME_COLORS.border}`,
        borderRadius: 10,
        padding: 20,
        minWidth: 280,
        maxWidth: 320,
        position: "sticky",
        top: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: THEME_COLORS.text,
              fontFamily: "monospace",
            }}
          >
            {stock.code}
          </div>
          <div
            style={{
              fontSize: 12,
              color: THEME_COLORS.textTertiary,
              marginTop: 2,
              lineHeight: 1.3,
            }}
          >
            {stock.issuer}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span
            style={{
              background: TIER_COLORS[stock.tier] + "33",
              border: `1px solid ${TIER_COLORS[stock.tier]}66`,
              color: TIER_COLORS[stock.tier],
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {stock.tier}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: THEME_COLORS.textTertiary,
              cursor: "pointer",
              fontSize: 18,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {metrics.map((m) => (
        <div key={m.label} style={{ marginBottom: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 3,
            }}
          >
            <span style={{ fontSize: 11, color: THEME_COLORS.textTertiary }}>
              {m.label}
            </span>
            <span
              style={{
                fontSize: 11,
                color: m.color,
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              {m.val}
            </span>
          </div>
          <div style={{ background: "#132030", borderRadius: 3, height: 4 }}>
            <div
              style={{
                width:
                  (m.pct !== undefined
                    ? m.pct
                    : Math.min((parseFloat(m.val) / m.max) * 100, 100)) + "%",
                background: m.color,
                height: 4,
                borderRadius: 3,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
      ))}

      {shareholders.length > 0 && (
        <div
          style={{
            marginTop: 14,
            padding: "10px",
            background: "#060d18",
            borderRadius: 6,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: THEME_COLORS.textTertiary,
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            TOP HOLDER
          </div>
          {shareholders.map((holder, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: idx > 0 ? 5 : 0,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: THEME_COLORS.textSecondary,
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={holder.n}
              >
                {holder.n || "—"}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color:
                    holder.p > 50
                      ? "#e76f51"
                      : holder.p > 25
                        ? "#E9C46A"
                        : "#2A9D8F",
                }}
              >
                {holder.p != null ? holder.p.toFixed(1) + "%" : "—"}
              </span>
            </div>
          ))}
        </div>
      )}

      {stock.flags && stock.flags.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 10,
              color: THEME_COLORS.textTertiary,
              marginBottom: 5,
            }}
          >
            GOVERNANCE FLAGS
          </div>
          <div>
            {stock.flags.map((f) => (
              <FlagPill key={f} flag={f} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
