'use client';

import { Badge, ChangeIndicator, Skeleton } from '@/components/ui';
import { FlagPill } from '@/components/ui';
import type { EnrichedStock } from '@/lib/types/unified';

interface ScreenerTableProps {
  stocks: EnrichedStock[];
  onSort: (field: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  loading?: boolean;
}

const SortIcon = ({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: 'asc' | 'desc' }) => {
  if (sortBy !== field) return <span className="text-ink-muted ml-1 opacity-50">⇅</span>;
  return <span className="text-accent ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
};

const getHhiColorClass = (hhi: number | undefined): string => {
  if (!hhi) return 'text-ink-muted';
  if (hhi < 1500) return 'text-tier-green';
  if (hhi <= 2500) return 'text-tier-amber';
  return 'text-tier-red';
};

const ScoreBar = ({ value }: { value: number | undefined }) => {
  if (!value) return <span className="text-ink-muted">—</span>;

  let barClass = 'bg-tier-red';
  if (value >= 80) barClass = 'bg-tier-green';
  else if (value >= 65) barClass = 'bg-accent';
  else if (value >= 50) barClass = 'bg-tier-amber';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-4 bg-base-600/50 rounded-sm overflow-hidden border border-base-500/30">
        <div
          className={`h-full transition-all duration-300 ${barClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-[11px] num font-semibold min-w-[28px] text-right ${barClass.replace('bg-', 'text-')}`}>
        {value}
      </span>
    </div>
  );
};

const TH_CLASS = 'px-3 py-3 text-left text-[9px] font-semibold tracking-widest uppercase text-ink-muted hover:text-ink-secondary cursor-pointer select-none transition-colors duration-150 whitespace-nowrap';
const TH_RIGHT_CLASS = 'px-3 py-3 text-right text-[9px] font-semibold tracking-widest uppercase text-ink-muted hover:text-ink-secondary cursor-pointer select-none transition-colors duration-150 whitespace-nowrap';

export function ScreenerTable({ stocks, onSort, sortBy, sortOrder, loading = false }: ScreenerTableProps) {
  const formatPrice = (price: number | undefined) => {
    if (!price) return '—';
    return price.toLocaleString('id-ID');
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-base-900 border-b border-base-600">
              {['Ticker', 'Issuer', 'Sector', 'Price', 'Change %', 'AI Score', 'AI Tier', 'Gov Tier', 'HHI', 'Flags', 'P/E', 'ROE %', 'Div Yield'].map((h) => (
                <th key={h} className={TH_CLASS}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(8).fill(0).map((_, i) => (
              <tr key={i} className="border-b border-base-600/30">
                {[16, 36, 20, 16, 16, 36, 12, 10, 14, 24, 10, 10, 14].map((w, j) => (
                  <td key={j} className="px-3 py-3">
                    <Skeleton className={`h-3 w-${w}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-base-900 border-b border-base-600">
            <th className={TH_CLASS} onClick={() => onSort('code')}>
              Ticker <SortIcon field="code" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th className={TH_CLASS}>Issuer</th>
            <th className={TH_CLASS}>Sector</th>
            <th className={TH_RIGHT_CLASS} onClick={() => onSort('price')}>
              Price <SortIcon field="price" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th className={TH_RIGHT_CLASS} onClick={() => onSort('change')}>
              Change % <SortIcon field="change" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th className={TH_CLASS} onClick={() => onSort('composite')}>
              AI Score <SortIcon field="composite" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th className="px-3 py-3 text-center text-[9px] font-semibold tracking-widest uppercase text-ink-muted whitespace-nowrap">
              AI Tier
            </th>
            <th className="px-3 py-3 text-center text-[9px] font-semibold tracking-widest uppercase text-ink-muted whitespace-nowrap">
              Gov Tier
            </th>
            <th className={TH_RIGHT_CLASS} onClick={() => onSort('hhi')}>
              HHI <SortIcon field="hhi" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th className={TH_CLASS}>Flags</th>
            <th className={TH_RIGHT_CLASS} onClick={() => onSort('pe')}>
              P/E <SortIcon field="pe" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th className={TH_RIGHT_CLASS} onClick={() => onSort('roe')}>
              ROE % <SortIcon field="roe" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th className={TH_RIGHT_CLASS} onClick={() => onSort('dividendYield')}>
              Div Yield % <SortIcon field="dividendYield" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
          </tr>
        </thead>
        <tbody>
          {stocks.length === 0 ? (
            <tr>
              <td
                colSpan={13}
                className="px-6 py-12 text-center text-ink-secondary text-sm"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  <span>No stocks found matching your criteria</span>
                </div>
              </td>
            </tr>
          ) : (
            stocks.map((stock, idx) => (
              <tr
                key={stock.code}
                style={{ animationDelay: `${Math.min(idx * 15, 300)}ms` }}
                className="border-b border-base-600/20 hover:bg-base-700/40 transition-colors duration-150 group animate-slide-up"
              >
                {/* Ticker */}
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="ticker-label text-sm text-accent group-hover:text-accent-hover transition-colors duration-150">
                    {stock.code}
                  </span>
                </td>

                {/* Issuer */}
                <td className="px-3 py-3 text-sm text-ink-primary max-w-[180px] truncate">
                  {stock.issuer}
                </td>

                {/* Sector */}
                <td className="px-3 py-3 text-sm text-ink-secondary max-w-[120px] truncate">
                  {stock.sector || '—'}
                </td>

                {/* Price */}
                <td className="px-3 py-3 text-right num text-sm text-ink-primary font-medium">
                  {formatPrice(stock.price)}
                </td>

                {/* Change */}
                <td className="px-3 py-3 text-right">
                  {stock.change != null
                    ? <ChangeIndicator value={stock.change} showBg />
                    : <span className="text-ink-muted text-xs">—</span>
                  }
                </td>

                {/* AI Score */}
                <td className="px-3 py-3 min-w-[140px]">
                  <ScoreBar value={stock.scores?.composite} />
                </td>

                {/* AI Tier */}
                <td className="px-3 py-3 text-center">
                  {stock.aiTier ? (
                    <Badge label={`T${stock.aiTier.level}`} variant={`T${stock.aiTier.level}`} />
                  ) : (
                    <span className="text-ink-muted text-xs">—</span>
                  )}
                </td>

                {/* Gov Tier */}
                <td className="px-3 py-3 text-center">
                  <Badge label={stock.tier[0]} variant={stock.tier} />
                </td>

                {/* HHI */}
                <td className={`px-3 py-3 text-right num text-sm font-medium ${getHhiColorClass(stock.hhi)}`}>
                  {stock.hhi ? stock.hhi.toFixed(0) : '—'}
                </td>

                {/* Flags */}
                <td className="px-3 py-3">
                  {stock.flags && stock.flags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {stock.flags.map(flag => (
                        <FlagPill key={flag} flag={flag} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-ink-muted text-xs">—</span>
                  )}
                </td>

                {/* P/E */}
                <td className="px-3 py-3 text-right num text-sm text-ink-secondary">
                  {stock.pe ? `${stock.pe.toFixed(1)}x` : '—'}
                </td>

                {/* ROE */}
                <td className="px-3 py-3 text-right num text-sm text-ink-secondary">
                  {stock.roe ? `${stock.roe.toFixed(1)}%` : '—'}
                </td>

                {/* Dividend Yield */}
                <td className="px-3 py-3 text-right num text-sm text-ink-secondary">
                  {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
