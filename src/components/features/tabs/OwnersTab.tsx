"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { BlurOverlay, Pagination } from "@/components/ui";
import { OWNER_TYPE_STYLES } from "@/lib/constants";
import { applyLimit } from "@/lib/services/planService";

import type {
  OwnerTypeData,
  OwnerWithPortfolio,
  TopOwnersBarData,
} from "@/types";

interface OwnersTabProps {
  filteredOwners: OwnerWithPortfolio[];
  ownerSearch: string;
  setOwnerSearch: (value: string) => void;
  ownerTypeData: OwnerTypeData[];
  topOwnersBarData: TopOwnersBarData[];
  expandedPortfolios: Record<string, boolean>;
  toggleExpand: (name: string) => void;
  dataLimit?: number;
  isPremium?: boolean;
}

const DEFAULT_PAGE_SIZE = 25;

export function OwnersTab({
  filteredOwners,
  ownerSearch,
  setOwnerSearch,
  ownerTypeData,
  topOwnersBarData,
  expandedPortfolios,
  toggleExpand,
  dataLimit = Number.POSITIVE_INFINITY,
  isPremium = true,
}: OwnersTabProps): React.ReactElement {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { visible: limitedVisible, blurredCount } = useMemo(
    () => applyLimit(filteredOwners, dataLimit),
    [filteredOwners, dataLimit],
  );

  useEffect(() => {
    queueMicrotask(() => setPage(1));
  }, [filteredOwners]);

  const paginatedOwners = useMemo(() => {
    if (!isPremium) {
      return limitedVisible;
    }
    const start = (page - 1) * pageSize;
    return filteredOwners.slice(start, start + pageSize);
  }, [isPremium, limitedVisible, filteredOwners, page, pageSize]);

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
          marginBottom: 4,
        }}
      >
        TOP HOLDERS DISSECTION
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 16,
          gap: 10,
        }}
      >
        <div style={{ fontSize: 14, color: "#e8f4f8", fontWeight: 600 }}>
          {filteredOwners.length} Unique Owners Found
        </div>
        <input
          type="text"
          placeholder="Search owner name..."
          value={ownerSearch}
          onChange={(e) => setOwnerSearch(e.target.value)}
          style={{
            background: "#060d18",
            border: "1px solid #1e3a52",
            borderRadius: 6,
            padding: "8px 12px",
            color: "#e8f4f8",
            fontSize: 12,
            outline: "none",
            width: 200,
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "#060d18",
            border: "1px solid #132030",
            borderRadius: 8,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#6b8aad",
              letterSpacing: 1,
              marginBottom: 8,
              alignSelf: "flex-start",
            }}
          >
            OWNER COMPOSITION
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={ownerTypeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                stroke="none"
              >
                {ownerTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#09131f",
                  border: "1px solid #1e3a52",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                itemStyle={{ color: "#e8f4f8" }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, color: "#a8c8e8" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div
          style={{
            background: "#060d18",
            border: "1px solid #132030",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#6b8aad",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            LARGEST HOLDING ENTITIES
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={topOwnersBarData}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#132030"
                horizontal={false}
              />
              <XAxis type="number" tick={{ fill: "#6b8aad", fontSize: 9 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={110}
                tick={{ fill: "#a8c8e8", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#09131f",
                  border: "1px solid #1e3a52",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#e8f4f8" }}
                cursor={{ fill: "#132030" }}
              />
              <Bar
                dataKey="count"
                fill="#2A9D8F"
                radius={[0, 4, 4, 0]}
                name="Stocks Held"
              />
            </BarChart>
          </ResponsiveContainer>
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
                  padding: "10px 8px",
                  color: "#457B9D",
                  fontSize: 10,
                  width: "30%",
                }}
              >
                OWNER NAME
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 8px",
                  color: "#457B9D",
                  fontSize: 10,
                  width: "12%",
                }}
              >
                TYPE
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 8px",
                  color: "#457B9D",
                  fontSize: 10,
                  width: "10%",
                }}
              >
                STOCKS
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 8px",
                  color: "#457B9D",
                  fontSize: 10,
                  width: "12%",
                }}
              >
                ∑ EST. RISK WT
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 16px",
                  color: "#457B9D",
                  fontSize: 10,
                  width: "36%",
                }}
              >
                PORTFOLIO EXPOSURE
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOwners.map((o, i) => {
              const isExpanded = expandedPortfolios[o.name];
              const visibleStocks = isExpanded
                ? o.stocks
                : o.stocks.slice(0, 5);
              const hiddenCount = o.stocks.length - 5;
              return (
                <tr
                  key={o.name}
                  style={{
                    borderBottom: "1px solid #132030",
                    background: i % 2 === 0 ? "#09131f" : "#060d18",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 8px",
                      color: "#e8f4f8",
                      fontWeight: 600,
                      maxWidth: 240,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={o.name}
                  >
                    {o.name}
                  </td>
                  <td style={{ padding: "14px 8px" }}>
                    <span
                      style={{
                        background:
                          OWNER_TYPE_STYLES[o.type]?.bg ?? "#E9C46A22",
                        color: OWNER_TYPE_STYLES[o.type]?.color ?? "#E9C46A",
                        border: `1px solid ${OWNER_TYPE_STYLES[o.type]?.border ?? "#E9C46A55"}`,
                        borderRadius: 4,
                        padding: "3px 8px",
                        fontSize: 9,
                        fontWeight: 500,
                      }}
                      title={OWNER_TYPE_STYLES[o.type]?.label ?? o.type}
                    >
                      {OWNER_TYPE_STYLES[o.type]?.label ?? o.type}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "14px 8px",
                      textAlign: "right",
                      color: "#a8c8e8",
                      fontFamily: "DM Mono, monospace",
                      fontSize: 14,
                    }}
                  >
                    {o.count}
                  </td>
                  <td
                    style={{
                      padding: "14px 8px",
                      textAlign: "right",
                      color: o.totalPct > 100 ? "#e76f51" : "#E9C46A",
                      fontFamily: "DM Mono, monospace",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {o.totalPct.toFixed(1)}%
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        alignItems: "center",
                      }}
                    >
                      {visibleStocks.map((sym) => (
                        <span
                          key={sym.code}
                          style={{
                            background: "#132030",
                            color: "#e8f4f8",
                            borderRadius: 4,
                            padding: "4px 8px",
                            fontSize: 10,
                            fontFamily: "DM Mono, monospace",
                            border: "1px solid #1e3a52",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            minWidth: 100,
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <b style={{ color: "#a8c8e8" }}>{sym.code}</b>
                            <span
                              style={{
                                color:
                                  sym.pct > 50
                                    ? "#e76f51"
                                    : sym.pct > 25
                                      ? "#E9C46A"
                                      : "#2A9D8F",
                              }}
                            >
                              {sym.pct.toFixed(2)}%
                            </span>
                          </span>
                          {sym.issuer && (
                            <span
                              style={{
                                fontSize: 9,
                                color: "#6b8aad",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 140,
                              }}
                              title={sym.issuer}
                            >
                              {sym.issuer}
                            </span>
                          )}
                        </span>
                      ))}
                      {!isExpanded && hiddenCount > 0 && (
                        <button
                          onClick={() => toggleExpand(o.name)}
                          style={{
                            background: "#2A9D8F22",
                            color: "#2A9D8F",
                            border: "1px dashed #2A9D8F55",
                            borderRadius: 4,
                            padding: "3px 8px",
                            fontSize: 10,
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          +{hiddenCount} More
                        </button>
                      )}
                      {isExpanded && hiddenCount > 0 && (
                        <button
                          onClick={() => toggleExpand(o.name)}
                          style={{
                            background: "transparent",
                            color: "#e76f51",
                            border: "none",
                            padding: "3px 8px",
                            fontSize: 10,
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontWeight: 600,
                          }}
                        >
                          Show Less
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {blurredCount > 0 && (
          <BlurOverlay
            isBlurred
            message={`${blurredCount} more owners — Upgrade to see all`}
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
                      key={`blurred-owner-${i}`}
                      style={{
                        borderBottom: "1px solid #132030",
                        background: i % 2 === 0 ? "#09131f" : "#060d18",
                      }}
                    >
                      <td
                        colSpan={5}
                        style={{
                          padding: "14px 8px",
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
            totalItems={filteredOwners.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeOptions={[25, 50, 100]}
          />
        )}
        {!isPremium && filteredOwners.length > 0 && (
          <div
            style={{
              fontSize: 11,
              color: "#6b8aad",
              padding: "12px 0",
              borderTop: "1px solid #132030",
            }}
          >
            Showing {limitedVisible.length} of {filteredOwners.length} — Upgrade
            to see all
          </div>
        )}
      </div>
    </div>
  );
}
