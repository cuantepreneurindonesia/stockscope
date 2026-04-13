"use client";

import { useState } from "react";
import Select from "react-select";
import ReactSlider from "react-slider";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterSidebarProps {
  sectors?: FilterOption[];
  onSectorChange?: (sectorId: string) => void;
  onPriceRangeChange?: (min: number, max: number) => void;
  onResetFilters?: () => void;
  activeSectors?: string[];
  priceRange?: [number, number];
  isMobile?: boolean;
}

export function FilterSidebar({
  sectors = [],
  onSectorChange,
  onPriceRangeChange,
  onResetFilters,
  activeSectors = [],
  priceRange = [0, 10000],
  isMobile = false,
}: FilterSidebarProps): React.ReactElement {

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sector: true,
    price: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const sectorOptions = sectors.map((s) => ({ value: s.id, label: s.label }));
  const selectedSectorValues = sectorOptions.filter((opt) => activeSectors.includes(opt.value));

  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: "var(--color-surface-input, rgba(255,255,255,0.05))",
      borderColor: "var(--color-border, rgba(255,255,255,0.1))",
      color: "#fff",
      boxShadow: "none"
    }),
    singleValue: (base: any) => ({ ...base, color: "#fff" }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#1a1b1e",
      zIndex: 50
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "rgba(255,255,255,0.1)" : "transparent",
      color: "#fff"
    })
  };

  return (
    <aside
      className={`
        flex flex-col gap-1 
        ${isMobile ? "w-full h-full" : "w-56 shrink-0 sticky top-[56px] h-[calc(100vh-56px)]"}
        overflow-y-auto bg-surface-base pr-4
      `}
    >
      {/* Sector Filter */}
      <div className="space-y-2 mt-2">
        <button
          onClick={() => toggleSection("sector")}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-text-primary hover:bg-surface-elevated transition-colors"
        >
          Industry Sector
          <span className="text-text-muted text-lg">{expandedSections.sector ? "−" : "+"}</span>
        </button>
        {expandedSections.sector && (
          <div className="px-3 pb-3">
            <Select
              options={sectorOptions}
              value={selectedSectorValues[0] || null}
              onChange={(val: any) => onSectorChange?.(val ? val.value : "")}
              styles={customSelectStyles}
              placeholder="Select sector..."
              isClearable
            />
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-text-primary hover:bg-surface-elevated transition-colors"
        >
          Price Range
          <span className="text-text-muted text-lg">{expandedSections.price ? "−" : "+"}</span>
        </button>
        {expandedSections.price && (
          <div className="px-3 pb-3 pt-4">
            <ReactSlider
              className="w-full h-1 bg-surface-elevated rounded-full mb-6"
              thumbClassName="w-4 h-4 bg-brand rounded-full -top-1.5 cursor-pointer hover:scale-110 transition-transform focus:outline-none"
              trackClassName="h-1 bg-brand rounded-full"
              min={0}
              max={15000}
              step={100}
              value={priceRange}
              onChange={(val: any) => onPriceRangeChange?.(val[0], val[1])}
              pearling
              minDistance={100}
            />
            <div className="flex justify-between text-xs text-text-muted mt-2">
              <span className="bg-surface-input px-2 py-1 rounded">Rp {priceRange[0]}</span>
              <span className="bg-surface-input px-2 py-1 rounded">Rp {priceRange[1]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={onResetFilters}
        className="mt-auto mb-4 w-full py-2 px-3 rounded-lg border border-border text-sm font-medium text-text-muted hover:text-brand hover:border-brand/30 hover:bg-brand/10 transition-all duration-150"
      >
        Reset Filters
      </button>
    </aside>
  );
}
