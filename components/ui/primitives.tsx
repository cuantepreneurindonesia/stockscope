'use client';

import React from 'react';

// ─── ChangeIndicator ──────────────────────────────────────────────────────────

interface ChangeIndicatorProps {
  value: number;
  showBg?: boolean;
  size?: 'xs' | 'sm' | 'lg';
}

export function ChangeIndicator({ value, showBg = false, size = 'sm' }: ChangeIndicatorProps): React.ReactElement {
  const pos = value > 0;
  const neg = value < 0;

  const sizeClass = size === 'lg' ? 'text-base' : size === 'xs' ? 'text-[10px]' : 'text-xs';
  const colorClass = pos ? 'text-bull' : neg ? 'text-bear' : 'text-neutral';
  const bgClass = showBg && pos
    ? 'bg-bull-bg px-2 py-0.5 rounded-full'
    : showBg && neg
    ? 'bg-bear-bg px-2 py-0.5 rounded-full'
    : '';

  return (
    <span className={`inline-flex items-center gap-0.5 num font-medium transition-colors duration-150 ${sizeClass} ${colorClass} ${bgClass}`}>
      {pos ? '▲' : neg ? '▼' : '—'}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps): React.ReactElement {
  return (
    <div className={`shimmer-bg rounded ${className}`} />
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_VARIANTS: Record<string, string> = {
  // AI tiers
  T1: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  T2: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  T3: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  T4: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  T5: 'bg-bear/10 text-bear border-bear/30',
  // Gov tiers
  Green: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  Amber: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  Red:   'bg-bear/10 text-bear border-bear/30',
};

interface BadgeProps {
  label: string;
  variant?: string;
}

export function Badge({ label, variant }: BadgeProps): React.ReactElement {
  const classes = (variant && BADGE_VARIANTS[variant])
    ? BADGE_VARIANTS[variant]
    : 'bg-base-700/50 text-ink-secondary border-base-500/50';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border transition-colors duration-150 ${classes}`}>
      {label}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value?: string | number;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
  onClick?: () => void;
}

export function StatCard({ label, value, delta, deltaType, loading = false, onClick }: StatCardProps): React.ReactElement {
  if (loading) {
    return (
      <div className="bg-base-800 border border-base-500/50 rounded-xl p-5">
        <Skeleton className="h-2.5 w-24 mb-3" />
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-base-800 border border-base-500/50 rounded-xl p-5 hover:border-base-400 hover:shadow-lg transition-all duration-200 animate-slide-up ${onClick ? 'cursor-pointer' : ''}`}
    >
      <p className="text-[11px] font-semibold tracking-widest uppercase text-ink-muted mb-3">
        {label}
      </p>
      <p className="num text-2xl font-bold text-ink-primary mb-1">{value ?? '—'}</p>
      {delta && (
        <p className={`text-xs num font-medium ${
          deltaType === 'positive' ? 'text-bull'
          : deltaType === 'negative' ? 'text-bear'
          : 'text-neutral'
        }`}>
          {delta}
        </p>
      )}
    </div>
  );
}
