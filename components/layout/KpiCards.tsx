'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
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
  color: string;
  click?: () => void;
};

export function KpiCards({ stats, loading = false, tierFilter, setTierFilter }: KpiCardsProps): React.ReactElement | null {
  const t = useTranslations('kpi');

  const cards = useMemo((): KpiCard[] | null => {
    if (loading || !stats) return null;
    return [
      { label: t('totalStocks'), val: stats.totalStocks, color: '#a8c8e8' },
      {
        label: t('redRisk'),
        val: stats.byTier.red,
        sub: t('pctOfTotal', {
          pct: stats.totalStocks ? Math.round((stats.byTier.red / stats.totalStocks) * 100) : 0,
        }),
        color: '#E76F51',
        click: () => setTierFilter(tierFilter === 'Red' ? null : 'Red'),
      },
      {
        label: t('amberRisk'),
        val: stats.byTier.amber,
        color: '#E9C46A',
        click: () => setTierFilter(tierFilter === 'Amber' ? null : 'Amber'),
      },
      {
        label: t('greenRisk'),
        val: stats.byTier.green,
        color: '#2A9D8F',
        click: () => setTierFilter(tierFilter === 'Green' ? null : 'Green'),
      },
      {
        label: t('avgHhi'),
        val: stats.avgHHI?.toFixed(0),
        sub: t('hhiHighConc'),
        color: stats.avgHHI > 2500 ? '#E76F51' : '#E9C46A',
      },
      {
        label: t('avgFloat'),
        val: stats.avgFloat?.toFixed(1) + '%',
        sub: t('idxMin'),
        color: stats.avgFloat < 15 ? '#E76F51' : '#2A9D8F',
      },
    ];
  }, [loading, stats, t, tierFilter, setTierFilter]);

  if (loading || !stats || !cards) {
    return (
      <div className="kpi-cards" data-tour="kpi-cards">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              background: '#09131f',
              padding: '14px 18px',
              borderRight: '1px solid #132030',
            }}
          >
            <div style={{ height: 10, background: '#1e3a52', borderRadius: 2, width: '60%', marginBottom: 8 }} />
            <div style={{ height: 24, background: '#1e3a52', borderRadius: 2, width: '40%' }} />
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
          style={{
            background: '#09131f',
            padding: '14px 18px',
            cursor: k.click ? 'pointer' : 'default',
            borderRight: '1px solid #132030',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => k.click && (e.currentTarget.style.background = '#0d1e30')}
          onMouseLeave={(e) => k.click && (e.currentTarget.style.background = '#09131f')}
        >
          <div style={{ fontSize: 9, letterSpacing: 2, color: '#457B9D', marginBottom: 4 }}>
            {k.label}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              color: k.color,
            }}
          >
            {k.val}
          </div>
          {k.sub && (
            <div style={{ fontSize: 10, color: '#6b8aad', marginTop: 2 }}>
              {k.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
