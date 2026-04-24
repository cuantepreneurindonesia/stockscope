"use client";

import { presets } from "@/core/screener/preset";
import type { ScreenPreset } from "@/types/screener";

interface PresetSelectorProps {
  activePresetId: string | null;
  onChange: (preset: ScreenPreset | null) => void;
}

export function PresetSelector({ activePresetId, onChange }: PresetSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
          activePresetId === null
            ? "bg-primary text-white border-primary"
            : "bg-transparent border-border-subtle text-on-surface-variant hover:border-primary hover:text-primary"
        }`}
      >
        All
      </button>
      {presets.map((preset) => (
        <button
          key={preset.id}
          title={preset.description}
          onClick={() => onChange(activePresetId === preset.id ? null : preset)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activePresetId === preset.id
              ? "bg-primary text-white border-primary"
              : "bg-transparent border-border-subtle text-on-surface-variant hover:border-primary hover:text-primary"
          }`}
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}
