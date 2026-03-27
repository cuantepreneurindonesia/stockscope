'use client';

import React from 'react';
import type { EnrichedStock } from '@/lib/types/unified';

interface ScreenerTableProps {
  stocks: EnrichedStock[];
  onSort: (field: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  locale?: string;
  onStockClick: (stock: EnrichedStock) => void;
}

const SortIcon = ({ 
  field, 
  sortBy, 
  sortOrder 
}: { 
  field: string; 
  sortBy: string; 
  sortOrder: 'asc' | 'desc';
}) => {
  if (sortBy !== field) {
    return <span className="material-symbols-outlined text-sm opacity-40">unfold_more</span>;
  }
  return sortOrder === 'asc' ? (
    <span className="material-symbols-outlined text-sm text-primary">arrow_upward</span>
  ) : (
    <span className="material-symbols-outlined text-sm text-primary">arrow_downward</span>
  );
};

const ScoreBar = ({ score, type }: { score: number; type: 'ai' | 'gov' }) => {
  const width = Math.min(Math.max(score, 0), 100);
  const color = type === 'ai' 
    ? score >= 70 ? 'bg-primary' : score >= 40 ? 'bg-tertiary' : 'bg-error'
    : score >= 70 ? 'bg-primary' : score >= 40 ? 'bg-tertiary' : 'bg-error';
  
  const glowColor = type === 'ai'
    ? score >= 70 ? 'shadow-[0_0_8px_rgba(78,222,163,0.4)]' : score >= 40 ? 'shadow-[0_0_8px_rgba(255,185,95,0.4)]' : 'shadow-[0_0_8px_rgba(255,180,171,0.3)]'
    : score >= 70 ? 'shadow-[0_0_8px_rgba(78,222,163,0.4)]' : score >= 40 ? 'shadow-[0_0_8px_rgba(255,185,95,0.4)]' : 'shadow-[0_0_8px_rgba(255,180,171,0.3)]';

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} ${glowColor} transition-all duration-500`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="font-label text-xs tabular-nums text-on-surface-variant min-w-[2rem] text-right">
        {score.toFixed(0)}
      </span>
    </div>
  );
};

const TierBadge = ({ tier }: { tier: string }) => {
  const tierLower = tier?.toLowerCase() || '';
  const colors: Record<string, string> = {
    'green': 'bg-primary/10 text-primary',
    'amber': 'bg-tertiary/10 text-tertiary', 
    'red': 'bg-error/10 text-error',
    'strong buy': 'bg-primary/10 text-primary',
    'buy': 'bg-primary/10 text-primary',
    'watch': 'bg-tertiary/10 text-tertiary',
    'neutral': 'bg-on-surface-variant/10 text-on-surface-variant',
    'avoid': 'bg-error/10 text-error',
    'n/a': 'bg-on-surface-variant/10 text-on-surface-variant'
  };
  
  const color = colors[tierLower] || colors['amber'];
  
  return (
    <span className={`${color} px-2 py-1 rounded-full text-xs font-label uppercase tracking-wider`}>
      {tier || 'N/A'}
    </span>
  );
};

export function ScreenerTable({ stocks, onSort, sortBy, sortOrder, locale = 'en', onStockClick }: ScreenerTableProps) {
  const formatNumber = (num: number | null | undefined, decimals = 2): string => {
    if (num == null) return '-';
    return num.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatPercent = (num: number | null | undefined): string => {
    if (num == null) return '-';
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline-variant/10">
            {/* Status Pill Column */}
            <th className="w-8 py-4" />
            
            {/* Ticker */}
            <th 
              className="px-4 py-4 text-left cursor-pointer group transition-colors"
              onClick={() => onSort('ticker')}
            >
              <div className="flex items-center gap-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">
                  Ticker
                </span>
                <SortIcon field="ticker" sortBy={sortBy} sortOrder={sortOrder} />
              </div>
            </th>

            {/* Price */}
            <th 
              className="px-4 py-4 text-right cursor-pointer group transition-colors"
              onClick={() => onSort('price')}
            >
              <div className="flex items-center justify-end gap-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">
                  Price
                </span>
                <SortIcon field="price" sortBy={sortBy} sortOrder={sortOrder} />
              </div>
            </th>

            {/* Change % */}
            <th 
              className="px-4 py-4 text-right cursor-pointer group transition-colors"
              onClick={() => onSort('change')}
            >
              <div className="flex items-center justify-end gap-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">
                  Change
                </span>
                <SortIcon field="change" sortBy={sortBy} sortOrder={sortOrder} />
              </div>
            </th>

            {/* Volume */}
            <th 
              className="px-4 py-4 text-right cursor-pointer group transition-colors"
              onClick={() => onSort('volume')}
            >
              <div className="flex items-center justify-end gap-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">
                  Volume
                </span>
                <SortIcon field="volume" sortBy={sortBy} sortOrder={sortOrder} />
              </div>
            </th>

            {/* AI Score */}
            <th 
              className="px-4 py-4 text-left cursor-pointer group transition-colors min-w-[140px]"
              onClick={() => onSort('aiScore')}
            >
              <div className="flex items-center gap-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">
                  AI Score
                </span>
                <SortIcon field="aiScore" sortBy={sortBy} sortOrder={sortOrder} />
              </div>
            </th>

            {/* Gov Score */}
            <th 
              className="px-4 py-4 text-left cursor-pointer group transition-colors min-w-[140px]"
              onClick={() => onSort('govScore')}
            >
              <div className="flex items-center gap-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">
                  Gov Score
                </span>
                <SortIcon field="govScore" sortBy={sortBy} sortOrder={sortOrder} />
              </div>
            </th>

            {/* HHI */}
            <th 
              className="px-4 py-4 text-right cursor-pointer group transition-colors"
              onClick={() => onSort('hhi')}
            >
              <div className="flex items-center justify-end gap-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">
                  HHI
                </span>
                <SortIcon field="hhi" sortBy={sortBy} sortOrder={sortOrder} />
              </div>
            </th>

            {/* AI Tier */}
            <th className="px-4 py-4 text-left">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                AI Tier
              </span>
            </th>

            {/* Gov Tier */}
            <th className="px-4 py-4 text-left">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Gov Tier
              </span>
            </th>

            {/* Actions */}
            <th className="px-4 py-4 w-12" />
          </tr>
        </thead>

        <tbody>
          {stocks.map((stock) => {
            const isPositive = (stock.change ?? 0) >= 0;

            return (
              <React.Fragment key={stock.code}>
                <tr 
                  className="group hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => onStockClick(stock)}
                >
                  {/* Vertical Status Pill */}
                  <td className="py-4 pl-4">
                    <div 
                      className={`w-2 h-8 rounded-full ${
                        isPositive ? 'bg-primary shadow-[0_0_8px_rgba(78,222,163,0.4)]' : 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.3)]'
                      }`}
                    />
                  </td>

                  {/* Ticker */}
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-label text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {stock.code}
                      </div>
                      <div className="font-body text-xs text-on-surface-variant mt-0.5">
                        {stock.issuer || 'N/A'}
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4 text-right">
                    <span className="font-label text-sm tabular-nums text-on-surface">
                      {formatNumber(stock.price)}
                    </span>
                  </td>

                  {/* Change % */}
                  <td className="px-4 py-4 text-right">
                    <span className={`font-label text-sm font-semibold tabular-nums ${
                      isPositive ? 'text-primary' : 'text-error'
                    }`}>
                      {formatPercent(stock.change)}
                    </span>
                  </td>

                  {/* Volume */}
                  <td className="px-4 py-4 text-right">
                    <span className="font-label text-sm tabular-nums text-on-surface-variant">
                      {stock.volume ? (stock.volume / 1000000).toFixed(1) + 'M' : '-'}
                    </span>
                  </td>

                  {/* AI Score */}
                  <td className="px-4 py-4">
                    <ScoreBar score={stock.scores?.composite ?? 0} type="ai" />
                  </td>

                  {/* Gov Score */}
                  <td className="px-4 py-4">
                    <ScoreBar score={stock.hhi ? 100 - (stock.hhi / 100) : 0} type="gov" />
                  </td>

                  {/* HHI */}
                  <td className="px-4 py-4 text-right">
                    <span className="font-label text-sm tabular-nums text-on-surface">
                      {stock.hhi ? stock.hhi.toFixed(0) : '-'}
                    </span>
                  </td>

                  {/* AI Tier */}
                  <td className="px-4 py-4">
                    <TierBadge tier={stock.aiTier?.label ?? 'N/A'} />
                  </td>

                  {/* Gov Tier */}
                  <td className="px-4 py-4">
                    <TierBadge tier={stock.tier ?? 'Amber'} />
                  </td>

                  <td className="px-4 py-4">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary transition-all">
                      chevron_right
                    </span>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {stocks.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">
            search_off
          </span>
          <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant">
            No stocks found
          </p>
          <p className="font-body text-sm text-on-surface-variant/60 mt-2">
            Try adjusting your filters
          </p>
        </div>
      )}
    </div>
  );
}
