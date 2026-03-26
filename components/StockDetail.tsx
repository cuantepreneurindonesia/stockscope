'use client';

import React from 'react';
import { Badge } from '@/components/ui';
import { FlagPill } from '@/components/ui';
import type { Stock } from '@/lib/types';

interface StockDetailProps {
  stock: Stock;
  onClose: () => void;
}

export function StockDetail({ stock, onClose }: StockDetailProps): React.ReactElement | null {
  if (!stock) return null;

  const ff = stock.floatPercentage ?? 0;
  const shareholders = stock.topHolder
    ? [{ n: stock.topHolder, t: stock.ownerType ?? 'OT', p: stock.c1 }]
    : [];

  const metrics = [
    {
      label: 'HHI',
      val: stock.hhi.toFixed(0),
      max: 10000,
      colorClass: stock.hhi > 2500 ? 'text-tier-red' : stock.hhi > 1500 ? 'text-tier-amber' : 'text-tier-green',
      barClass: stock.hhi > 2500 ? 'bg-tier-red' : stock.hhi > 1500 ? 'bg-tier-amber' : 'bg-tier-green',
      pct: Math.min((stock.hhi / 10000) * 100, 100),
    },
    {
      label: 'Free Float',
      val: ff.toFixed(1) + '%',
      max: 100,
      colorClass: ff < 5 ? 'text-bear' : ff < 15 ? 'text-tier-amber' : 'text-tier-green',
      barClass: ff < 5 ? 'bg-bear' : ff < 15 ? 'bg-tier-amber' : 'bg-tier-green',
      pct: ff,
    },
    {
      label: 'C1 (Top holder)',
      val: (stock.c1 ?? 0).toFixed(1) + '%',
      max: 100,
      colorClass: (stock.c1 ?? 0) > 75 ? 'text-tier-red' : 'text-tier-amber',
      barClass: (stock.c1 ?? 0) > 75 ? 'bg-tier-red' : 'bg-tier-amber',
      pct: stock.c1 ?? 0,
    },
    {
      label: 'C3 (Top 3)',
      val: (stock.c3 ?? 0).toFixed(1) + '%',
      max: 100,
      colorClass: 'text-tier-amber',
      barClass: 'bg-tier-amber',
      pct: stock.c3 ?? 0,
    },
  ];

  return (
    <div className="bg-base-800 border border-base-500/50 rounded-xl p-5 min-w-[280px] max-w-[320px] sticky top-5 animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="ticker-label text-xl text-ink-primary mb-1">
            {stock.code}
          </div>
          <div className="text-xs text-ink-muted leading-snug max-w-[180px]">
            {stock.issuer}
          </div>
        </div>
        <div className="flex gap-1.5 items-center">
          <Badge label={stock.tier} variant={stock.tier} />
          <button
            onClick={onClose}
            className="bg-transparent border-none text-ink-muted cursor-pointer text-lg p-0 leading-none hover:text-ink-primary transition-colors duration-150"
          >
            ×
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2.5">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] text-ink-muted">{m.label}</span>
              <span className={`text-[11px] num font-semibold ${m.colorClass}`}>
                {m.val}
              </span>
            </div>
            <div className="bg-base-600 rounded-sm h-1">
              <div
                className={`h-full rounded-sm transition-all duration-300 ${m.barClass}`}
                style={{ width: `${m.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Top Holder */}
      {shareholders.length > 0 && (
        <div className="mt-3.5 p-2.5 bg-base-900 rounded-lg">
          <div className="text-[10px] text-ink-muted tracking-wide uppercase mb-1.5 font-semibold">
            TOP HOLDER
          </div>
          {shareholders.map((holder, idx) => (
            <div key={idx} className="flex justify-between items-center mt-0 first:mt-0">
              <div
                className="text-[11px] text-ink-secondary flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                title={holder.n}
              >
                {holder.n || '—'}
              </div>
              <span className={`text-[11px] num font-semibold ml-2 ${
                holder.p > 50 ? 'text-tier-red' : holder.p > 25 ? 'text-tier-amber' : 'text-tier-green'
              }`}>
                {holder.p != null ? holder.p.toFixed(1) + '%' : '—'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Flags */}
      {stock.flags && stock.flags.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] text-ink-muted mb-1.5 uppercase font-semibold tracking-wide">
            GOVERNANCE FLAGS
          </div>
          <div className="flex flex-wrap gap-1">
            {stock.flags.map((f) => (
              <FlagPill key={f} flag={f} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
