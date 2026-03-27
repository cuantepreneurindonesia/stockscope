import React from "react";

import { getHeatColor } from "@/lib/services/dataTransformService";

interface HeatCellProps {
  value: number;
  min: number;
  max: number;
  reverse?: boolean;
  fmt?: (value: number) => string;
}

/**
 * UI Component: HeatCell
 */
export function HeatCell({
  value,
  min,
  max,
  reverse = false,
  fmt,
}: HeatCellProps): React.ReactElement {
  const { r, g, b } = getHeatColor(value, min, max, reverse);
  const colorString = `rgba(${r},${g},${b},0.95)`;
  const bgColorString = `rgba(${r},${g},${b},0.08)`;

  return (
    <td
      style={{
        padding: "5px 8px",
        textAlign: "right",
        fontSize: 11,
        fontFamily: "monospace",
        color: colorString,
        background: bgColorString,
      }}
    >
      {fmt ? fmt(value) : value}
    </td>
  );
}
