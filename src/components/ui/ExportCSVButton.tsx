"use client";

interface ExportCSVButtonProps<T extends Record<string, unknown>> {
  data: T[];
  headers: { key: keyof T; label: string }[];
  filename?: string;
  disabled?: boolean;
  loading?: boolean;
  canExport?: boolean;
}

function rowToCsvValues<T extends Record<string, unknown>>(
  row: T,
  headers: { key: keyof T; label: string }[],
): string {
  return headers
    .map(({ key }) => {
      const val = row[key];
      if (val === null || val === undefined) return "";
      const str = String(val);
      // Escape quotes and wrap in quotes if value contains comma, quote, or any line break (RFC 4180)
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
    .join(",");
}

function buildCsv<T extends Record<string, unknown>>(
  data: T[],
  headers: { key: keyof T; label: string }[],
): string {
  const headerRow = headers.map((h) => h.label).join(",");
  const dataRows = data.map((row) => rowToCsvValues(row, headers));
  return [headerRow, ...dataRows].join("\n");
}

export function ExportCSVButton<T extends Record<string, unknown>>({
  data,
  headers,
  filename = `export-${new Date().toISOString().slice(0, 10)}.csv`,
  disabled = false,
  loading = false,
  canExport = true,
}: ExportCSVButtonProps<T>) {
  if (!canExport) return null;

  const handleExport = () => {
    if (disabled || loading || data.length === 0) return;
    const csv = buildCsv(data, headers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || loading || data.length === 0}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated text-xs font-medium hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Export current results as CSV"
    >
      <span className="text-sm leading-none" aria-hidden="true">
        ⬇
      </span>
      {loading ? "Exporting…" : "Export CSV"}
    </button>
  );
}
