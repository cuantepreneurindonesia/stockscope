import React from "react";

interface MicroBarProps {
  label: string;
  value: number;
  max: number;
  thresholds: {
    type: "lower-is-better" | "higher-is-better";
    green: number;
    amber: number;
  };
  unit?: string;
  statusLabels: {
    green: string;
    amber: string;
    red: string;
  };
}

export function MicroBar({
  label,
  value,
  max,
  thresholds,
  unit = "",
  statusLabels,
}: MicroBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  // Determine color and status based on thresholds
  let color = {
    bg: "bg-brand",
    text: "text-brand",
    shadow: "shadow-glow",
    label: statusLabels.green,
  };

  if (thresholds.type === "lower-is-better") {
    if (value >= thresholds.amber) {
      color = {
        bg: "bg-bear",
        text: "text-bear",
        shadow: "shadow-[0_0_20px_rgba(231,111,81,0.3)]",
        label: statusLabels.red,
      };
    } else if (value >= thresholds.green && value < thresholds.amber) {
      color = {
        bg: "bg-warning",
        text: "text-warning",
        shadow: "shadow-[0_0_20px_rgba(233,196,106,0.3)]",
        label: statusLabels.amber,
      };
    }
  } else {
    // higher-is-better
    if (value <= thresholds.amber) {
      color = {
        bg: "bg-bear",
        text: "text-bear",
        shadow: "shadow-[0_0_20px_rgba(231,111,81,0.3)]",
        label: statusLabels.red,
      };
    } else if (value <= thresholds.green && value > thresholds.amber) {
      color = {
        bg: "bg-warning",
        text: "text-warning",
        shadow: "shadow-[0_0_20px_rgba(233,196,106,0.3)]",
        label: statusLabels.amber,
      };
    }
  }

  return (
    <div className="space-y-1 my-4">
      <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${color.bg} ${color.shadow} transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="font-label text-sm tabular-nums text-on-surface min-w-[4rem] text-right">
          {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          {unit}
        </span>
      </div>
      <div className={`font-body text-xs ${color.text}`}>{color.label}</div>
    </div>
  );
}
