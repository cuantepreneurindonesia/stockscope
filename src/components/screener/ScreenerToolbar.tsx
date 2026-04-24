"use client";

interface ScreenerToolbarProps {
  totalResults: number;
  onExportCSV: () => void;
  exportLoading?: boolean;
  canExport?: boolean;
}

export function ScreenerToolbar({
  totalResults,
  onExportCSV,
  exportLoading = false,
  canExport = false,
}: ScreenerToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 px-1">
      <p className="text-sm text-on-surface-variant">
        <span className="font-semibold text-on-surface">{totalResults}</span>{" "}
        {totalResults === 1 ? "result" : "results"}
      </p>

      {canExport && (
        <button
          onClick={onExportCSV}
          disabled={exportLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated text-xs font-medium hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm leading-none">⬇</span>
          {exportLoading ? "Exporting…" : "Export CSV"}
        </button>
      )}
    </div>
  );
}
