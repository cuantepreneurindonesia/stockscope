'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { HeatCell, FlagPill, Pagination, BlurOverlay } from '@/components/ui';
import { sortStocks, getMinMaxForField } from '@/lib/services/dataTransformService';
import { applyLimit } from '@/lib/services/planService';
import type { Stock } from '@/lib/types';

interface ScreenerTabProps {
  stocks: Stock[];
  onStockSelect?: (stock: Stock) => void;
  loading?: boolean;
  dataLimit?: number;
  isPremium?: boolean;
}

type SortKey = 'code' | 'hhi' | 'floatPercentage' | 'c1' | 'c3';

const DEFAULT_PAGE_SIZE = 50;

export function ScreenerTab({
  stocks,
  onStockSelect,
  loading = false,
  dataLimit = Number.POSITIVE_INFINITY,
  isPremium = true,
}: ScreenerTabProps): React.ReactElement {
  const [sortBy, setSortBy] = useState<SortKey>('code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const sortedStocks = useMemo(() => {
    return sortStocks(stocks, sortBy, sortDir);
  }, [stocks, sortBy, sortDir]);

  const { visible: limitedVisible, blurredCount } = useMemo(
    () => applyLimit(sortedStocks, dataLimit),
    [sortedStocks, dataLimit]
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

  const hhiRange = useMemo(() => getMinMaxForField(stocks, 'hhi'), [stocks]);
  const ffRange = useMemo(() => getMinMaxForField(stocks, 'floatPercentage'), [stocks]);

  const handleSort = useCallback(
    (key: SortKey): void => {
      if (sortBy === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(key);
        setSortDir('asc');
      }
    },
    [sortBy]
  );

  const sortIcon = (key: SortKey): string => {
    if (sortBy !== key) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const handleRowClick = useCallback(
    (stock: Stock): void => {
      setSelectedCode((prev) => (prev === stock.code ? null : stock.code));
      onStockSelect?.(stock);
    },
    [onStockSelect]
  );

  if (loading) {
    return (
      <div className="bg-base-800 border border-base-600 rounded-xl p-5">
        <div className="text-[11px] text-ink-muted tracking-widest uppercase mb-4 font-mono">LOADING...</div>
        <div className="space-y-1.5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-7 shimmer-bg rounded" />
          ))}
        </div>
      </div>
    );
  }

  const tableCols: { key: SortKey; label: string }[] = [
    { key: 'hhi', label: 'HHI' },
    { key: 'floatPercentage', label: 'Float%' },
    { key: 'c1', label: 'C1%' },
    { key: 'c3', label: 'C3%' },
  ];

  return (
    <div className="bg-base-800 border border-base-600 rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-[11px] text-ink-muted tracking-widest uppercase mb-0.5 font-mono font-semibold">
            STOCK SCREENER
          </div>
          <div className="text-sm text-ink-primary">
            {sortedStocks.length} stocks — cells colour-coded by value
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b-2 border-base-600">
              <th
                className="text-left p-2 text-ink-muted cursor-pointer font-mono text-[10px] hover:text-ink-secondary transition-colors duration-150"
                onClick={() => handleSort('code')}
              >
                CODE{sortIcon('code')}
              </th>
              <th className="text-left p-2 text-ink-muted font-mono text-[10px]">
                ISSUER
              </th>
              <th className="text-left p-2 text-ink-muted font-mono text-[10px]">
                TIER
              </th>
              {tableCols.map((c) => (
                <th
                  key={c.key}
                  className="text-right p-2 text-ink-muted cursor-pointer font-mono text-[10px] whitespace-nowrap hover:text-ink-secondary transition-colors duration-150"
                  onClick={() => handleSort(c.key)}
                >
                  {c.label}
                  {sortIcon(c.key)}
                </th>
              ))}
              <th className="text-left p-2 text-ink-muted font-mono text-[10px]">
                FLAGS
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedStocks.map((s, i) => (
              <tr
                key={s.code}
                onClick={() => handleRowClick(s)}
                className={`
                  border-b border-base-600/20 cursor-pointer transition-colors duration-100
                  ${selectedCode === s.code
                    ? 'bg-base-600'
                    : 'hover:bg-base-700/40'
                  }
                `}
              >
                <td className="p-[6px_8px] ticker-label text-[11px] text-accent whitespace-nowrap">
                  {s.code}
                </td>
                <td className="p-[6px_8px] text-ink-muted max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {s.issuer}
                </td>
                <td className="p-[6px_8px]">
                  <span
                    className={`text-[10px] font-bold ${
                      s.tier === 'Red' ? 'text-tier-red' : s.tier === 'Amber' ? 'text-tier-amber' : 'text-tier-green'
                    }`}
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
                  fmt={(v) => v.toFixed(1) + '%'}
                />
                <HeatCell
                  value={s.c1 || 0}
                  min={0}
                  max={100}
                  fmt={(v) => v.toFixed(1) + '%'}
                />
                <HeatCell
                  value={s.c3 || 0}
                  min={0}
                  max={100}
                  fmt={(v) => v.toFixed(1) + '%'}
                />
                <td className="p-[6px_8px] min-w-[120px]">
                  {s.flags?.map((f) => <FlagPill key={f} flag={f} />) || <span className="text-ink-muted">—</span>}
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
            <table className="w-full border-collapse text-[11px]">
              <tbody>
                {Array.from({ length: Math.min(5, blurredCount) }).map((_, i) => (
                  <tr
                    key={`blurred-${i}`}
                    className="border-b border-base-600/20"
                  >
                    <td colSpan={8} className="p-[12px_8px] text-ink-muted">
                      ••• ••• ••• ••• •••
                    </td>
                  </tr>
                ))}
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
          <div className="text-[11px] text-ink-muted py-3 border-t border-base-600">
            Showing {limitedVisible.length} of {sortedStocks.length} — Upgrade to see all
          </div>
        )}
      </div>
    </div>
  );
}
