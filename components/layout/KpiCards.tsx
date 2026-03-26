'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui';
import type { AnalyticsStats, Stock } from '@/lib/types';

interface KpiCardsProps {
  stats: AnalyticsStats | null;
  loading?: boolean;
  tierFilter: Stock['tier'] | null;
  setTierFilter: (tier: Stock['tier'] | null) => void;
}

type KpiCard = {
  label: string;
  val: string | number | undefined;
  sub?: string;
  colorClass: string;
  click?: () => void;
};

export function KpiCards({ stats, loading = false, tierFilter, setTierFilter }: KpiCardsProps): React.ReactElement | null {
  const t = useTranslations('kpi');

  const cards = useMemo((): KpiCard[] | null => {
    if (loading || !stats) return null;
    return [
      {
        label: t('totalStocks'),
        val: stats.totalStocks,
        colorClass: 'text-ink-secondary',
      },
      {
        label: t('redRisk'),
        val: stats.byTier.red,
        sub: t('pctOfTotal', {
          pct: stats.totalStocks ? Math.round((stats.byTier.red / stats.totalStocks) * 100) : 0,
        }),
        colorClass: 'text-tier-red',
        click: () => setTierFilter(tierFilter === 'Red' ? null : 'Red'),
      },
      {
        label: t('amberRisk'),
        val: stats.byTier.amber,
        colorClass: 'text-tier-amber',
        click: () => setTierFilter(tierFilter === 'Amber' ? null : 'Amber'),
      },
      {
        label: t('greenRisk'),
        val: stats.byTier.green,
        colorClass: 'text-tier-green',
        click: () => setTierFilter(tierFilter === 'Green' ? null : 'Green'),
      },
      {
        label: t('avgHhi'),
        val: stats.avgHHI?.toFixed(0),
        sub: t('hhiHighConc'),
        colorClass: stats.avgHHI > 2500 ? 'text-tier-red' : 'text-tier-amber',
      },
      {
        label: t('avgFloat'),
        val: stats.avgFloat?.toFixed(1) + '%',
        sub: t('idxMin'),
        colorClass: stats.avgFloat < 15 ? 'text-tier-red' : 'text-tier-green',
      },
    ];
  }, [loading, stats, t, tierFilter, setTierFilter]);

  if (loading || !stats || !cards) {
    return (
      <div className="kpi-cards" data-tour="kpi-cards">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-base-800 px-4 py-3.5 border-r border-base-600">
            <Skeleton className="h-2.5 w-20 mb-2.5" />
            <Skeleton className="h-6 w-14 mb-1.5" />
            <Skeleton className="h-2 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="kpi-cards" data-tour="kpi-cards">
      {cards.map((k) => (
        <div
          key={k.label}
          onClick={k.click}
          className={`
            bg-base-800 px-4 py-3.5 border-r border-base-600
            transition-colors duration-150
            ${k.click ? 'cursor-pointer hover:bg-base-700' : ''}
          `}
        >
          <div className="text-[9px] tracking-[2px] text-ink-muted mb-1 uppercase font-semibold">
            {k.label}
          </div>
          <div className={`text-2xl font-bold num ${k.colorClass}`}>
            {k.val}
          </div>
          {k.sub && (
            <div className="text-[10px] text-ink-muted mt-0.5">
              {k.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
