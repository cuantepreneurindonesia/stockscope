"use client";

import React from "react";

interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

/**
 * UI Component: Pagination
 */
export function Pagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100],
}: PaginationProps): React.ReactElement {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, totalItems);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const buttonStyle = (disabled: boolean) => ({
    background: disabled ? "#0d1e30" : "#132030",
    color: disabled ? "#6b8aad" : "#e8f4f8",
    border: "1px solid #1e3a52",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 11,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600,
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 0",
        borderTop: "1px solid #132030",
      }}
    >
      <div style={{ fontSize: 11, color: "#6b8aad" }}>
        Showing {totalItems === 0 ? 0 : start + 1}–{end} of {totalItems}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {onPageSizeChange && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#6b8aad" }}>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                background: "#060d18",
                border: "1px solid #1e3a52",
                borderRadius: 6,
                padding: "6px 10px",
                color: "#e8f4f8",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
            style={buttonStyle(!canPrev)}
          >
            Prev
          </button>
          <span
            style={{
              padding: "6px 12px",
              fontSize: 11,
              color: "#a8c8e8",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            style={buttonStyle(!canNext)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
