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
          color: '#E76F51',
        },
        {
          id: 'amber',
          label: t('presetAmber'),
          active: tierFilter === 'Amber',
          onClick: () => setTierFilter(tierFilter === 'Amber' ? null : 'Amber'),
          color: '#E9C46A',
        },
        {
          id: 'green',
          label: t('presetGreen'),
          active: tierFilter === 'Green',
          onClick: () => setTierFilter(tierFilter === 'Green' ? null : 'Green'),
          color: '#2A9D8F',
        },
        {
          id: 'hhi',
          label: t('presetHighHhi'),
          active: hhiFilter === 'High',
          onClick: () => setHhiFilter && setHhiFilter(hhiFilter === 'High' ? null : 'High'),
          color: '#E76F51',
        },
        {
          id: 'lowFloat',
          label: t('presetLowFloat'),
          active: flagFilter === 'LowFloat<15%',
          onClick:
            () =>
              setFlagFilter &&
              setFlagFilter(flagFilter === 'LowFloat<15%' ? null : 'LowFloat<15%'),
          color: '#E9C46A',
        },
        {
          id: 'criticalFloat',
          label: t('presetCriticalFloat'),
          active: flagFilter === 'CriticalFloat<5%',
          onClick:
            () =>
              setFlagFilter &&
              setFlagFilter(flagFilter === 'CriticalFloat<5%' ? null : 'CriticalFloat<5%'),
          color: '#d62828',
        },
        {
          id: 'reset',
          label: t('presetReset'),
          active: false,
          onClick: clearFilters,
          color: '#6b8aad',
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
    <div className="app-header">
      <div className="header-row">
        <div>
          <div className="header-eyebrow">{t('eyebrow')}</div>
          <h1 className="header-title">{dynamicTitle}</h1>
        </div>
        <div className="header-right">
          <div className="search-wrap" data-tour="search">
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 10,
                color: '#457B9D',
                fontSize: 13,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchAria')}
              className="search-input"
              style={{
                border: `1px solid ${search ? '#457B9D' : '#1e3a52'}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#457B9D';
                e.currentTarget.style.boxShadow = '0 0 0 2px #457B9D33';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = search ? '#457B9D' : '#1e3a52';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                title={t('clearSearch')}
                style={{
                  position: 'absolute',
                  right: 10,
                  background: 'none',
                  border: 'none',
                  color: '#6b8aad',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>
          <Link
            href="/screener"
            style={{
              background: '#132030',
              border: '1px solid #1e3a52',
              color: '#a8c8e8',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12,
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'border-color 0.2s, color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#457b9d';
              e.currentTarget.style.color = '#e8f4f8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1e3a52';
              e.currentTarget.style.color = '#a8c8e8';
            }}
          >
            {t('screener')}
          </Link>
          <LocaleSwitcher />
          {onReplayTour && (
            <button
              onClick={onReplayTour}
              title={t('tourTitle')}
              aria-label={t('tourTitle')}
              style={{
                background: '#132030',
                border: '1px solid #457B9D',
                color: '#a8c8e8',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}
            >
              {t('tour')}
            </button>
          )}
          <AuthButton />
          {hasFilter && (
            <button
              onClick={clearFilters}
              style={{
                background: '#132030',
                border: '1px solid #e76f5155',
                color: '#e76f51',
                borderRadius: 6,
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}
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

      <div data-tour="presets" style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto', margin: '12px 0', paddingBottom: 4 }}>
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={p.onClick}
            style={{
              height: 32,
              padding: '0 12px',
              minWidth: 'fit-content',
              background: p.active ? '#64b5f6' : '#2d3748',
              border: '1px solid #4b5563',
              borderRadius: 6,
              color: p.active ? '#ffffff' : (p.id === 'reset' ? '#9ca3af' : p.color),
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {hasFilter && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {tierFilter && (
            <span
              style={{
                background: TIER_COLORS[tierFilter] + '33',
                border: `1px solid ${TIER_COLORS[tierFilter]}`,
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 11,
                color: TIER_COLORS[tierFilter],
                cursor: 'pointer',
              }}
              onClick={() => setTierFilter(null)}
            >
              {t('chipTier', { tier: tierFilter })}
            </span>
          )}
          {hhiFilter && setHhiFilter && (
            <span
              style={{
                background: '#2A9D8F33',
                border: '1px solid #2A9D8F',
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 11,
                color: '#2A9D8F',
                cursor: 'pointer',
              }}
              onClick={() => setHhiFilter(null)}
            >
              {t('chipHhi', { level: hhiFilter })}
            </span>
          )}
          {flagFilter && setFlagFilter && (
            <span
              style={{
                background: '#e9c46a33',
                border: '1px solid #e9c46a',
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 11,
                color: '#e9c46a',
                cursor: 'pointer',
              }}
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
