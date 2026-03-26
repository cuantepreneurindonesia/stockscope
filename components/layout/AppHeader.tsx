'use client';

import React, { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { TIER_COLORS } from '@/lib/constants';
import { AuthButton } from './AuthButton';
import type { Stock } from '@/lib/types';

interface AppHeaderProps {
  dynamicTitle: string;
  search: string;
  setSearch: (query: string) => void;
  hasFilter: boolean;
  clearFilters: () => void;
  setDrawerOpen: (open: boolean) => void;
  drawerOpen: boolean;
  tierFilter: Stock['tier'] | null;
  setTierFilter: (tier: Stock['tier'] | null) => void;
  hhiFilter?: string | null;
  setHhiFilter?: (hl: string | null) => void;
  flagFilter?: string | null;
  setFlagFilter?: (flag: string | null) => void;
  onReplayTour?: () => void;
}

export function AppHeader({
  dynamicTitle,
  search,
  setSearch,
  hasFilter,
  clearFilters,
  setDrawerOpen,
  drawerOpen,
  tierFilter,
  setTierFilter,
  hhiFilter = null,
  setHhiFilter,
  flagFilter = null,
  setFlagFilter,
  onReplayTour,
}: AppHeaderProps): React.ReactElement {
  const t = useTranslations('header');

  const presets = useMemo(
    () =>
      [
        {
          id: 'red',
          label: t('presetRed'),
          active: tierFilter === 'Red',
          onClick: () => setTierFilter(tierFilter === 'Red' ? null : 'Red'),
          color: 'text-tier-red',
        },
        {
          id: 'amber',
          label: t('presetAmber'),
          active: tierFilter === 'Amber',
          onClick: () => setTierFilter(tierFilter === 'Amber' ? null : 'Amber'),
          color: 'text-tier-amber',
        },
        {
          id: 'green',
          label: t('presetGreen'),
          active: tierFilter === 'Green',
          onClick: () => setTierFilter(tierFilter === 'Green' ? null : 'Green'),
          color: 'text-tier-green',
        },
        {
          id: 'hhi',
          label: t('presetHighHhi'),
          active: hhiFilter === 'High',
          onClick: () => setHhiFilter && setHhiFilter(hhiFilter === 'High' ? null : 'High'),
          color: 'text-tier-red',
        },
        {
          id: 'lowFloat',
          label: t('presetLowFloat'),
          active: flagFilter === 'LowFloat<15%',
          onClick:
            () =>
              setFlagFilter &&
              setFlagFilter(flagFilter === 'LowFloat<15%' ? null : 'LowFloat<15%'),
          color: 'text-tier-amber',
        },
        {
          id: 'criticalFloat',
          label: t('presetCriticalFloat'),
          active: flagFilter === 'CriticalFloat<5%',
          onClick:
            () =>
              setFlagFilter &&
              setFlagFilter(flagFilter === 'CriticalFloat<5%' ? null : 'CriticalFloat<5%'),
          color: 'text-bear',
        },
        {
          id: 'reset',
          label: t('presetReset'),
          active: false,
          onClick: clearFilters,
          color: 'text-ink-secondary',
        },
      ] as const,
    [t, tierFilter, hhiFilter, flagFilter, setTierFilter, setHhiFilter, setFlagFilter, clearFilters]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setSearch(e.target.value);
    },
    [setSearch]
  );

  return (
    <div className="px-[clamp(12px,4vw,28px)] pt-[clamp(12px,4vw,20px)] pb-3.5 bg-gradient-to-b from-base-700 to-base-800 border-b border-base-600">
      {/* Top row */}
      <div className="flex justify-between items-center flex-wrap gap-2.5">
        <div>
          <div className="text-[11px] tracking-[3px] text-accent font-mono mb-1">
            {t('eyebrow')}
          </div>
          <h1 className="text-[clamp(0.875rem,5vw,1.375rem)] m-0 font-bold text-ink-primary">
            {dynamicTitle}
          </h1>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          {/* Search */}
          <div className="relative flex items-center" data-tour="search">
            <span
              aria-hidden="true"
              className="absolute left-2.5 text-ink-muted text-sm pointer-events-none select-none"
            >
              🔍
            </span>
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchAria')}
              className={`
                bg-base-700 rounded-full text-ink-primary text-xs outline-none
                pl-8 pr-8 py-2 transition-all duration-150
                border placeholder:text-ink-muted
                focus:ring-2 focus:ring-accent-dim focus:border-accent
                w-[clamp(140px,40vw,260px)]
                ${search ? 'border-accent' : 'border-base-500'}
              `}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                title={t('clearSearch')}
                className="absolute right-2.5 bg-transparent border-none text-ink-muted cursor-pointer text-base p-0 leading-none hover:text-ink-primary transition-colors duration-150"
              >
                ×
              </button>
            )}
          </div>

          <Link
            href="/screener"
            className="bg-base-600 border border-base-500 text-ink-secondary rounded-md px-3 py-1.5 cursor-pointer text-xs whitespace-nowrap no-underline inline-flex items-center transition-all duration-150 hover:border-base-400 hover:text-ink-primary"
          >
            {t('screener')}
          </Link>

          <LocaleSwitcher />

          {onReplayTour && (
            <button
              onClick={onReplayTour}
              title={t('tourTitle')}
              aria-label={t('tourTitle')}
              className="bg-base-600 border border-accent/40 text-ink-secondary rounded-md px-3 py-1.5 cursor-pointer text-xs whitespace-nowrap transition-all duration-150 hover:border-accent hover:text-ink-primary"
            >
              {t('tour')}
            </button>
          )}

          <AuthButton />

          {hasFilter && (
            <button
              onClick={clearFilters}
              className="bg-base-600 border border-bear/30 text-bear rounded-md px-3.5 py-1.5 cursor-pointer text-xs whitespace-nowrap transition-all duration-150 hover:border-bear/60"
            >
              {t('clearFilters')}
            </button>
          )}

          <button
            className="hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label={t('menuOpen')}
            aria-expanded={drawerOpen}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Preset filter chips */}
      <div
        data-tour="presets"
        className="flex gap-2 flex-nowrap overflow-x-auto mt-3 mb-0 pb-1 scrollbar-hide"
      >
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={p.onClick}
            className={`
              h-8 px-3 min-w-fit rounded-md border text-[13px] font-medium
              cursor-pointer whitespace-nowrap flex-shrink-0
              transition-all duration-150
              ${p.active
                ? 'bg-accent text-base-900 border-accent font-semibold'
                : `bg-base-600 border-base-500 ${p.color} hover:border-base-400`
              }
            `}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Active filter chips */}
      {hasFilter && (
        <div className="flex gap-1.5 flex-wrap mt-2.5">
          {tierFilter && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] cursor-pointer border transition-opacity duration-150 hover:opacity-80"
              style={{
                background: TIER_COLORS[tierFilter] + '33',
                border: `1px solid ${TIER_COLORS[tierFilter]}`,
                color: TIER_COLORS[tierFilter],
              }}
              onClick={() => setTierFilter(null)}
            >
              {t('chipTier', { tier: tierFilter })}
            </span>
          )}
          {hhiFilter && setHhiFilter && (
            <span
              className="bg-tier-green/20 border border-tier-green text-tier-green rounded-full px-2.5 py-0.5 text-[11px] cursor-pointer transition-opacity duration-150 hover:opacity-80"
              onClick={() => setHhiFilter(null)}
            >
              {t('chipHhi', { level: hhiFilter })}
            </span>
          )}
          {flagFilter && setFlagFilter && (
            <span
              className="bg-tier-amber/20 border border-tier-amber text-tier-amber rounded-full px-2.5 py-0.5 text-[11px] cursor-pointer transition-opacity duration-150 hover:opacity-80"
              onClick={() => setFlagFilter(null)}
            >
              {t('chipFlag', { flag: flagFilter })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
