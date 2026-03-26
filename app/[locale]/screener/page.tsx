'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FilterPanel } from '@/components/screener/FilterPanel';
import { ScreenerTable } from '@/components/screener/ScreenerTable';
import { ScreenerCardList } from '@/components/screener/ScreenerCardList';
import { ViewToggle } from '@/components/screener/ViewToggle';
import { SkeletonLoader } from '@/components/screener/SkeletonLoader';
import { LoadingSpinner } from '@/components/screener/LoadingSpinner';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import type { EnrichedStock } from '@/lib/types/unified';

export default function ScreenerPage(): React.ReactElement {
  const t = useTranslations('screenerPage');
  const loadErrorLabel = t('loadError');
  const [stocks, setStocks] = useState<EnrichedStock[]>([]);
  const [sectors, setSectors] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'table' | 'cards'>('table');

  // Auto-switch to cards on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setView('cards');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedAiTier, setSelectedAiTier] = useState('');
  const [selectedGovTier, setSelectedGovTier] = useState<'Red' | 'Amber' | 'Green' | ''>('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [sortBy, setSortBy] = useState('composite');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetch('/api/screener/filters')
      .then((res) => res.json())
      .then((data) => setSectors(data.sectors || ['All']))
      .catch((err) => console.error('Failed to load sectors:', err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedSector !== 'All') params.append('sector', selectedSector);
    if (selectedAiTier) params.append('aiTier', selectedAiTier);
    if (selectedGovTier) params.append('tier', selectedGovTier);
    if (minScore) params.append('minScore', minScore);
    if (maxScore) params.append('maxScore', maxScore);
    params.append('sortBy', sortBy);
    params.append('order', sortOrder);

    queueMicrotask(() => setLoading(true));
    fetch(`/api/stocks/enriched?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStocks(data.data);
          setError(null);
        } else {
          setError(data.error || loadErrorLabel);
        }
      })
      .catch((err) => {
        console.error('Error fetching stocks:', err);
        setError(loadErrorLabel);
      })
      .finally(() => setLoading(false));
  }, [
    searchQuery,
    selectedSector,
    selectedAiTier,
    selectedGovTier,
    minScore,
    maxScore,
    sortBy,
    sortOrder,
    loadErrorLabel,
  ]);

  const handleSort = (field: string): void => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div style={{ background: '#060d18', minHeight: '100vh' }}>
      <div
        style={{
          padding: 'clamp(12px, 4vw, 20px) clamp(12px, 4vw, 28px) 14px',
          background: 'linear-gradient(180deg, #0d1e30 0%, #09131f 100%)',
          borderBottom: '1px solid #132030',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 'clamp(0.875rem, 5vw, 1.375rem)',
              fontWeight: 700,
              color: '#e8f4f8',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#a8d8ea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#e8f4f8';
            }}
          >
            {t('brand')}
          </Link>
          <LocaleSwitcher />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #132030',
          padding: 'clamp(12px, 4vw, 28px) 0',
          background: '#09131f',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <Link
          href="/"
          style={{
            background: 'none',
            border: 'none',
            borderBottom: '2px solid transparent',
            color: '#6b8aad',
            padding: '12px 18px',
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: 1,
            transition: 'color 0.15s',
            whiteSpace: 'nowrap',
            minHeight: 44,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#a8d8ea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b8aad';
          }}
        >
          {t('navDashboard')}
        </Link>
        <div
          style={{
            background: 'none',
            borderBottom: '2px solid #457b9d',
            color: '#a8d8ea',
            padding: '12px 18px',
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: 1,
            transition: 'color 0.15s',
            whiteSpace: 'nowrap',
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {t('navScreener')}
        </div>
      </div>

      <div style={{ padding: 'clamp(12px, 4vw, 20px) clamp(12px, 4vw, 28px)' }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: 2,
            color: '#457b9d',
            fontFamily: "'DM Mono', monospace",
            marginBottom: 16,
            textTransform: 'uppercase',
          }}
        >
          {t('sectionLabel')}
        </div>

        <p style={{ fontSize: '0.875rem', color: '#a8c8e8', marginBottom: 24, lineHeight: 1.6 }}>
          {t('description')}
        </p>

        <FilterPanel
          sectors={sectors}
          selectedSector={selectedSector}
          onSectorChange={setSelectedSector}
          selectedAiTier={selectedAiTier}
          onAiTierChange={setSelectedAiTier}
          selectedGovTier={selectedGovTier}
          onGovTierChange={setSelectedGovTier}
          minScore={minScore}
          onMinScoreChange={setMinScore}
          maxScore={maxScore}
          onMaxScoreChange={setMaxScore}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div
          style={{
            background: '#09131f',
            border: '1px solid #132030',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: 16,
              borderBottom: '1px solid #132030',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: 2,
                color: '#457b9d',
                fontFamily: "'DM Mono', monospace",
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size={14} />
                  <span>{t('loading')}</span>
                </>
              ) : (
                t('results', { count: stocks.length })
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {!loading && stocks.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#6b8aad' }}>
                  {searchQuery || selectedSector !== 'All' || selectedAiTier || selectedGovTier || minScore || maxScore 
                    ? t('filtered') 
                    : t('showing')}
                </span>
              )}
              <ViewToggle view={view} onChange={setView} />
            </div>
          </div>

          {error ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#e76f51', fontSize: '0.875rem' }}>
              {error}
            </div>
          ) : loading ? (
            <SkeletonLoader rows={5} columns={7} />
          ) : view === 'cards' ? (
            <ScreenerCardList stocks={stocks} />
          ) : (
            <ScreenerTable
              stocks={stocks}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          )}
        </div>

        <div
          style={{
            marginTop: 24,
            background: '#09131f',
            border: '1px solid #1e3a52',
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              color: '#457b9d',
              fontFamily: "'DM Mono', monospace",
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            {t('methodology')}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#a8c8e8', lineHeight: 1.6 }}>
            {t.rich('methodologyBody', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
