"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ---------------------------------------------------------------------------
// Shared chart styling
// ---------------------------------------------------------------------------

const GRID_STROKE = "rgba(255,255,255,0.06)";
const TICK_FILL = "rgba(255,255,255,0.45)";
/** Minimum opacity for the leftmost bar in the auto-gradient */
const BAR_OPACITY_MIN = 0.4;
/** Additional opacity spread applied across all bars */
const BAR_OPACITY_RANGE = 0.6;

/**
 * Calculate the fill opacity for a bar at position `index` out of `totalBars`.
 * Returns a value clamped to [BAR_OPACITY_MIN, BAR_OPACITY_MIN + BAR_OPACITY_RANGE].
 */
function calculateBarOpacity(index: number, totalBars: number): number {
  if (totalBars <= 1) return BAR_OPACITY_MIN + BAR_OPACITY_RANGE;
  return BAR_OPACITY_MIN + (index / (totalBars - 1)) * BAR_OPACITY_RANGE;
}
const TOOLTIP_STYLE: {
  background: string;
  border: string;
  borderRadius: number;
  fontSize: number;
} = {
  background: "#1a1b1e",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
};

// ---------------------------------------------------------------------------
// Bar chart variant
// ---------------------------------------------------------------------------

export interface BarSeries {
  dataKey: string;
  /** When omitted, bars are colored with an indigo gradient that increases in opacity by index position */
  color?: string;
}

export interface LightweightBarChartProps {
  type: "bar";
  data: Record<string, unknown>[];
  xDataKey: string;
  series: BarSeries[];
  height?: number;
  title?: string;
}

// ---------------------------------------------------------------------------
// Scatter chart variant
// ---------------------------------------------------------------------------

export interface LightweightScatterChartProps {
  type: "scatter";
  data: { x: number; y: number; name?: string }[];
  xLabel?: string;
  yLabel?: string;
  color?: string;
  height?: number;
  title?: string;
}

// ---------------------------------------------------------------------------
// Union prop type
// ---------------------------------------------------------------------------

export type LightweightChartProps =
  | LightweightBarChartProps
  | LightweightScatterChartProps;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LightweightChart(props: LightweightChartProps) {
  const { title, height = 180 } = props;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-4">
      {title && (
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        {props.type === "bar" ? (
          <BarChart
            data={props.data}
            margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
            <XAxis
              dataKey={props.xDataKey}
              tick={{ fontSize: 10, fill: TICK_FILL }}
            />
            <YAxis tick={{ fontSize: 10, fill: TICK_FILL }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {props.series.map((s) => (
              <Bar key={s.dataKey} dataKey={s.dataKey} radius={[4, 4, 0, 0]}>
                {props.data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      s.color ??
                      `rgba(99,102,241,${calculateBarOpacity(i, props.data.length)})`
                    }
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        ) : (
          <ScatterChart margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
            <XAxis
              dataKey="x"
              name={props.xLabel ?? "X"}
              type="number"
              tick={{ fontSize: 10, fill: TICK_FILL }}
              label={
                props.xLabel
                  ? {
                      value: props.xLabel,
                      position: "insideBottomRight",
                      offset: -4,
                      fontSize: 10,
                      fill: "rgba(255,255,255,0.35)",
                    }
                  : undefined
              }
            />
            <YAxis
              dataKey="y"
              name={props.yLabel ?? "Y"}
              type="number"
              tick={{ fontSize: 10, fill: TICK_FILL }}
              label={
                props.yLabel
                  ? {
                      value: props.yLabel,
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 10,
                      fill: "rgba(255,255,255,0.35)",
                    }
                  : undefined
              }
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={TOOLTIP_STYLE}
            />
            <Scatter
              data={props.data}
              fill={props.color ?? "rgba(16,185,129,0.6)"}
            />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
