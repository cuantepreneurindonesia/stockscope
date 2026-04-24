"use client";

import type { Filter } from "@/types/screener";
import { METRIC_META } from "@/core/metrics/metrics";

interface ActiveFiltersProps {
  filters: Filter[];
  presetName?: string | null;
  onRemoveFilter: (idx: number) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filters,
  presetName,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const hasAnything = filters.length > 0 || presetName;

  if (!hasAnything) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presetName && (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30">
          Preset: {presetName}
        </span>
      )}

      {filters.map((f, idx) => (
        <span
          key={idx}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-elevated text-xs text-on-surface border border-border-subtle"
        >
          {METRIC_META[f.field].label} {f.operator} {f.value}
          <button
            onClick={() => onRemoveFilter(idx)}
            className="ml-0.5 text-on-surface-variant hover:text-destructive transition-colors leading-none"
            aria-label={`Remove filter: ${METRIC_META[f.field].label} ${f.operator} ${f.value}`}
          >
            ×
          </button>
        </span>
      ))}

      {(filters.length > 1 || (filters.length > 0 && presetName)) && (
        <button
          onClick={onClearAll}
          className="px-2.5 py-1 rounded-full text-xs text-on-surface-variant border border-border-subtle hover:text-destructive hover:border-destructive transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
