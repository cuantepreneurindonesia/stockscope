"use client";

import React from "react";

const FLAG_COLORS: Record<string, string> = {
  "Insider>75%": "#e76f51",
  "SingleCP>50%": "#e9843a",
  "LowFloat<15%": "#e9c46a",
  "CriticalFloat<5%": "#d62828",
  ZeroForeign: "#6d6875",
};

/**
 * UI Component: FlagPill
 */
export function FlagPill({ flag }: { flag: string }): React.ReactElement {
  const flagColor = FLAG_COLORS[flag] || "#444";

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        background: flagColor + "22",
        border: `1px solid ${flagColor}55`,
        color: flagColor,
        borderRadius: 4,
        fontSize: 9,
        padding: "1px 5px",
        margin: "1px",
        cursor: "default",
        lineHeight: 1.5,
      }}
    >
      {flag}
    </span>
  );
}
