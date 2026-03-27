"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { BlurOverlay, FlagPill, HeatCell, Pagination } from "@/components/ui";
import { TIER_COLORS } from "@/lib/constants";
import {
  getMinMaxForField,
  sortStocks,
} from "@/lib/services/dataTransformService";
import { applyLimit } from "@/lib/services/planService";

import type { Stock } from "@/types";

interface ScreenerTabProps {
  stocks: Stock[];
  onStockSelect?: (stock: Stock) => void;
  loading?: boolean;
  dataLimit?: number;
  isPremium?: boolean;
}

type SortKey = "code" | "hhi" | "floatPercentage" | "c1" | "c3";

const DEFAULT_PAGE_SIZE = 50;

export function ScreenerTab({
  stocks,
  onStockSelect,
  loading = false,
  dataLimit = Number.POSITIVE_INFINITY,
  isPremium = true,
}: ScreenerTabProps): React.ReactElement {
  const [sortBy, setSortBy] = useState<SortKey>("code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const sortedStocks = useMemo(() => {
    return sortStocks(stocks, sortBy, sortDir);
  }, [stocks, sortBy, sortDir]);

  const { visible: limitedVisible, blurredCount } = useMemo(
    () => applyLimit(sortedStocks, dataLimit),
    [sortedStocks, dataLimit],
  );

  useEffect(() => {
    queueMicrotask(() => setPage(1));
  }, [stocks, sortBy, sortDir]);

  const paginatedStocks = useMemo(() => {
    if (!isPremium) {
      return limitedVisible;
    }
    const start = (page - 1) * pageSize;
    return sortedStocks.slice(start, start + pageSize);
  }, [isPremium, limitedVisible, sortedStocks, page, pageSize]);

  const hhiRange = useMemo(() => getMinMaxForField(stocks, "hhi"), [stocks]);
  const ffRange = useMemo(
    () => getMinMaxForField(stocks, "floatPercentage"),
    [stocks],
  );

  const handleSort = useCallback(
    (key: SortKey): void => {
      if (sortBy === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(key);
        setSortDir("asc");
      }
    },
    [sortBy],
  );

  const sortIcon = (key: SortKey): string => {
    if (sortBy !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const handleRowClick = useCallback(
    (stock: Stock): void => {
      setSelectedCode((prev) => (prev === stock.code ? null : stock.code));
      onStockSelect?.(stock);
    },
    [onStockSelect],
  );

  if (loading) {
    return (
      <div
        style={{
          background: "#09131f",
          border: "1px solid #132030",
          borderRadius: 10,
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#6b8aad",
            letterSpacing: 2,
            marginBottom: 16,
          }}
        >
          LOADING...
        </div>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            style={{
              height: 28,
              background: "#0d1e30",
              marginBottom: 2,
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    );
  }

  const tableCols: { key: SortKey; label: string }[] = [
    { key: "hhi", label: "HHI" },
    { key: "floatPercentage", label: "Float%" },
    { key: "c1", label: "C1%" },
    { key: "c3", label: "C3%" },
  ];

  return (
    <div
      style={{
        background: "#09131f",
        border: "1px solid #132030",
        borderRadius: 10,
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#6b8aad",
              letterSpacing: 2,
              marginBottom: 2,
            }}
          >
            STOCK SCREENER
          </div>
          <div style={{ fontSize: 13, color: "#e8f4f8" }}>
            {sortedStocks.length} stocks — cells colour-coded by value
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #132030" }}>
              <th
                style={{
                  textAlign: "left",
                  padding: 8,
                  color: "#457B9D",
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                }}
                onClick={() => handleSort("code")}
              >
                CODE{sortIcon("code")}
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 8,
                  color: "#457B9D",
                  fontSize: 10,
                }}
              >
                ISSUER
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 8,
                  color: "#457B9D",
                  fontSize: 10,
                }}
              >
                TIER
              </th>
              {tableCols.map((c) => (
                <th
                  key={c.key}
                  style={{
                    textAlign: "right",
                    padding: 8,
                    color: "#457B9D",
                    cursor: "pointer",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => handleSort(c.key)}
                >
                  {c.label}
                  {sortIcon(c.key)}
                </th>
              ))}
              <th
                style={{
                  textAlign: "left",
                  padding: 8,
                  color: "#457B9D",
                  fontSize: 10,
                }}
              >
                FLAGS
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedStocks.map((s, i) => (
              <tr
                key={s.code}
                onClick={() => handleRowClick(s)}
                style={{
                  borderBottom: "1px solid #0d1e30",
                  background:
                    selectedCode === s.code
                      ? "#132030"
                      : i % 2 === 0
                        ? "#09131f"
                        : "#060d18",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  selectedCode !== s.code &&
                  (e.currentTarget.style.background = "#0d1e30")
                }
                onMouseLeave={(e) =>
                  selectedCode !== s.code &&
                  (e.currentTarget.style.background =
                    i % 2 === 0 ? "#09131f" : "#060d18")
                }
              >
                <td
                  style={{
                    padding: "6px 8px",
                    color: "#e8f4f8",
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 600,
                    fontSize: 11,
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.code}
                </td>
                <td
                  style={{
                    padding: "6px 8px",
                    color: "#6b8aad",
                    maxWidth: 180,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.issuer}
                </td>
                <td style={{ padding: "6px 8px" }}>
                  <span
                    style={{
                      color: TIER_COLORS[s.tier as keyof typeof TIER_COLORS],
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {s.tier}
                  </span>
                </td>
                <HeatCell
                  value={s.hhi}
                  min={hhiRange.min}
                  max={hhiRange.max}
                  fmt={(v) => v.toFixed(0)}
                />
                <HeatCell
                  value={s.floatPercentage || 0}
                  min={ffRange.min}
                  max={ffRange.max}
                  reverse
                  fmt={(v) => v.toFixed(1) + "%"}
                />
                <HeatCell
                  value={s.c1 || 0}
                  min={0}
                  max={100}
                  fmt={(v) => v.toFixed(1) + "%"}
                />
                <HeatCell
                  value={s.c3 || 0}
                  min={0}
                  max={100}
                  fmt={(v) => v.toFixed(1) + "%"}
                />
                <td style={{ padding: "6px 8px", minWidth: 120 }}>
                  {s.flags?.map((f) => <FlagPill key={f} flag={f} />) || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {blurredCount > 0 && (
          <BlurOverlay
            isBlurred
            message={`${blurredCount} more rows — Upgrade to see all`}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 11,
              }}
            >
              <tbody>
                {Array.from({ length: Math.min(5, blurredCount) }).map(
                  (_, i) => (
                    <tr
                      key={`blurred-${i}`}
                      style={{
                        borderBottom: "1px solid #0d1e30",
                        background: i % 2 === 0 ? "#09131f" : "#060d18",
                      }}
                    >
                      <td
                        colSpan={8}
                        style={{
                          padding: "12px 8px",
                          color: "#6b8aad",
                          fontSize: 11,
                        }}
                      >
                        ••• ••• ••• ••• •••
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </BlurOverlay>
        )}
        {isPremium && (
          <Pagination
            page={page}
            totalItems={sortedStocks.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeOptions={[25, 50, 100, 200]}
          />
        )}
        {!isPremium && sortedStocks.length > 0 && (
          <div
            style={{
              fontSize: 11,
              color: "#6b8aad",
              padding: "12px 0",
              borderTop: "1px solid #132030",
            }}
          >
            Showing {limitedVisible.length} of {sortedStocks.length} — Upgrade
            to see all
          </div>
        )}
      </div>
    </div>
  );
}
