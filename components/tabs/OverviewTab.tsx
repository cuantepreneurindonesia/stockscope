'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { TIER_COLORS } from '@/lib/constants';
import { calculateHhiDistribution } from '@/lib/services/analyticsService';
import type { Stock, AnalyticsStats } from '@/lib/types';

interface OverviewTabProps {
  stocks: Stock[];
  stats: AnalyticsStats | null;
  loading?: boolean;
}

export function OverviewTab({ stocks, stats, loading = false }: OverviewTabProps): React.ReactElement {
  const tierDist = useMemo(() => {
    return (Object.entries(TIER_COLORS) as [string, string][]).map(([tier, color]) => ({
      name: tier,
      value: stocks.filter((s) => s.tier === tier).length,
      color,
    }));
  }, [stocks]);

  const hhiData = useMemo(() => {
    const buckets = calculateHhiDistribution(stocks);
    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));
  }, [stocks]);

  if (loading) {
    return (
      <div className="overview-grid">
        <div className="bg-base-800 border border-base-600 rounded-xl p-5 h-[300px] shimmer-bg" />
        <div className="bg-base-800 border border-base-600 rounded-xl p-5 h-[300px] shimmer-bg" />
      </div>
    );
  }

  const redCount = stocks.filter((s) => s.tier === 'Red').length;
  const greenCount = stocks.filter((s) => s.tier === 'Green').length;
  const amberCount = stocks.filter((s) => s.tier === 'Amber').length;

  return (
    <div className="overview-grid">
      {/* Risk Distribution Chart */}
      <div className="bg-base-800 border border-base-600 rounded-xl p-5">
        <div className="text-[11px] text-ink-muted tracking-widest uppercase mb-1 font-mono font-semibold">
          RISK DISTRIBUTION
        </div>
        <div className="text-sm text-ink-primary font-semibold mb-4">
          {redCount > greenCount + amberCount
            ? 'Most Stocks Have Governance Concerns'
            : 'Risk Spread Across Tiers'}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={tierDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1D26" />
            <XAxis dataKey="name" tick={{ fill: '#4A4F66', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4A4F66', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#111318',
                border: '1px solid #2A2D3A',
                borderRadius: 8,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
              }}
              labelStyle={{ color: '#FFFFFF' }}
              cursor={{ fill: '#1A1D26' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} cursor="pointer">
              {tierDist.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="text-[10px] text-ink-muted mt-2">
          ↑ Click bars to filter
        </div>
      </div>

      {/* HHI Concentration Chart */}
      <div className="bg-base-800 border border-base-600 rounded-xl p-5">
        <div className="text-[11px] text-ink-muted tracking-widest uppercase mb-1 font-mono font-semibold">
          HHI CONCENTRATION
        </div>
        <div className="text-sm text-ink-primary font-semibold mb-4">
          {stats && stats.avgHHI > 2500
            ? 'High Average Concentration Across Market'
            : 'Concentration Spread Across Zones'}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hhiData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1D26" />
            <XAxis dataKey="range" tick={{ fill: '#4A4F66', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4A4F66', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#111318',
                border: '1px solid #2A2D3A',
                borderRadius: 8,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
              }}
              labelStyle={{ color: '#FFFFFF' }}
              cursor={{ fill: '#1A1D26' }}
            />
            <Bar dataKey="count" fill="#00C805" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-[10px] text-ink-muted mt-2">
          ↑ HHI zones distribution
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-base-800 border border-base-600 rounded-xl p-5" style={{ gridColumn: '1 / -1' }}>
        <div className="text-[11px] text-ink-muted tracking-widest uppercase mb-3 font-mono font-semibold">
          KEY FINDINGS
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {[
            {
              id: 'red',
              icon: '⚠️',
              stat: `${redCount} stocks`,
              desc: `classified as Red risk (${stocks.length ? Math.round((redCount / stocks.length) * 100) : 0}%)`,
            },
            {
              id: 'float',
              icon: '📉',
              stat: `${stats?.avgFloat?.toFixed(1) || '—'}% avg float`,
              desc: 'average free float percentage',
            },
            {
              id: 'hhi',
              icon: '📊',
              stat: `HHI avg ${stats?.avgHHI?.toFixed(0) || '—'}`,
              desc: stats?.avgHHI && stats.avgHHI > 2500 ? "deep into 'High concentration' zone" : 'concentration index average',
            },
            {
              id: 'amber',
              icon: '🟡',
              stat: `${amberCount} stocks`,
              desc: 'moderate concentration (HHI 1500–2500)',
            },
            {
              id: 'green',
              icon: '🟢',
              stat: `${greenCount} stocks`,
              desc: 'well-distributed ownership (HHI < 1500)',
            },
            {
              id: 'total',
              icon: '📈',
              stat: `${stocks.length} total`,
              desc: 'securities tracked in the dashboard',
            },
          ].map((f) => (
            <div
              key={f.id}
              className="bg-base-900 rounded-lg px-3.5 py-3 border-l-[3px] border-base-500"
            >
              <div className="text-lg mb-1">{f.icon}</div>
              <div className="text-base font-bold text-ink-primary num mb-0.5">
                {f.stat}
              </div>
              <div className="text-[11px] text-ink-muted">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
