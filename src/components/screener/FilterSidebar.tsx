"use client";

import { useState } from "react";
import type { Filter, FilterOperator } from "@/types/screener";
import { METRIC_META, METRIC_FIELDS } from "@/core/metrics/metrics";

interface FilterSidebarV1Props {
  filters: Filter[];
  onChange: (filters: Filter[]) => void;
}

const OPERATORS: FilterOperator[] = [">", "<", ">=", "<=", "="];

export function FilterSidebarV1({ filters, onChange }: FilterSidebarV1Props) {
  const [draft, setDraft] = useState<Omit<Filter, "value"> & { value: string }>({
    field: "pe",
    operator: ">",
    value: "",
  });

  const addFilter = () => {
    const num = parseFloat(draft.value);
    if (isNaN(num)) return;
    onChange([
      ...filters,
      { field: draft.field, operator: draft.operator, value: num },
    ]);
    setDraft((d) => ({ ...d, value: "" }));
  };

  const removeFilter = (idx: number) => {
    onChange(filters.filter((_, i) => i !== idx));
  };

  return (
    <aside className="flex flex-col gap-4 w-56 shrink-0">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant px-1">
        Filters
      </h2>

      {/* Filter builder */}
      <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-card p-3">
        <label className="text-xs text-on-surface-variant">Metric</label>
        <select
          value={draft.field}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              field: e.target.value as Filter["field"],
            }))
          }
          className="w-full rounded-md bg-surface-elevated border border-border-subtle px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:border-primary"
        >
          {METRIC_FIELDS.map((f) => (
            <option key={f} value={f}>
              {METRIC_META[f].label}
            </option>
          ))}
        </select>

        <label className="text-xs text-on-surface-variant">Operator</label>
        <select
          value={draft.operator}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              operator: e.target.value as FilterOperator,
            }))
          }
          className="w-full rounded-md bg-surface-elevated border border-border-subtle px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:border-primary"
        >
          {OPERATORS.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>

        <label className="text-xs text-on-surface-variant">Value</label>
        <input
          type="number"
          value={draft.value}
          onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
          placeholder="e.g. 15"
          className="w-full rounded-md bg-surface-elevated border border-border-subtle px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:border-primary"
          onKeyDown={(e) => e.key === "Enter" && addFilter()}
        />

        <button
          onClick={addFilter}
          className="mt-1 w-full rounded-md bg-primary py-1.5 text-xs font-semibold text-white hover:bg-primary/80 transition-colors"
        >
          Add Filter
        </button>
      </div>

      {/* Active filters list */}
      {filters.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {filters.map((f, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-elevated px-2 py-1.5 text-xs"
            >
              <span className="text-on-surface">
                {METRIC_META[f.field].label} {f.operator} {f.value}
              </span>
              <button
                onClick={() => removeFilter(idx)}
                className="ml-2 text-on-surface-variant hover:text-destructive transition-colors"
                aria-label="Remove filter"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([])}
            className="mt-1 w-full rounded-md border border-border-subtle py-1 text-xs text-on-surface-variant hover:text-destructive hover:border-destructive transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </aside>
  );
}
