'use client';

import { ScreenerCard } from './ScreenerCard';
import type { EnrichedStock } from '@/lib/types/unified';

interface ScreenerCardListProps {
  stocks: EnrichedStock[];
}

export function ScreenerCardList({ stocks }: ScreenerCardListProps) {
  if (stocks.length === 0) {
    return (
      <div style={{
        padding: 48,
        textAlign: 'center',
        color: '#6b8aad',
        fontSize: '0.875rem'
      }}>
        No stocks found matching your criteria
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
        padding: '0 16px'
      }}
    >
      {stocks.map((stock) => (
        <ScreenerCard key={stock.code} stock={stock} />
      ))}
    </div>
  );
}
