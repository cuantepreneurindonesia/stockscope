'use client';

import { ScreenerCard } from './ScreenerCard';
import type { EnrichedStock } from '@/lib/types/unified';

interface ScreenerCardListProps {
  stocks: EnrichedStock[];
  onStockClick: (stock: EnrichedStock) => void;
}

export function ScreenerCardList({ stocks, onStockClick }: ScreenerCardListProps) {
  if (stocks.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {stocks.map((stock) => (
        <ScreenerCard key={stock.code} stock={stock} onClick={() => onStockClick(stock)} />
      ))}
    </div>
  );
}
