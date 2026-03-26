'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FilterPanel } from '@/components/screener/FilterPanel';
import { ScreenerTable } from '@/components/screener/ScreenerTable';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import type { EnrichedStock } from '@/lib/types/unified';

export default function ScreenerPage(): React.ReactElement {
  const t = useTranslations('screenerPage');
  const loadErrorLabel = t('loadError');
  const [stocks, setStocks] = useState<EnrichedStock[]>([]);
  const [sectors, setSectors] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="bg-base-900 min-h-screen">
      {/* Page header */}
      <div className="px-[clamp(12px,4vw,28px)] pt-[clamp(12px,4vw,20px)] pb-3.5 bg-gradient-to-b from-base-700 to-base-800 border-b border-base-600">
        <div className="flex justify-between items-center flex-wrap gap-2.5">
          <Link
            href="/"
            className="text-[clamp(0.875rem,5vw,1.375rem)] font-bold text-ink-primary no-underline transition-colors duration-150 hover:text-accent"
          >
            {t('brand')}
          </Link>
          <LocaleSwitcher />
        </div>
      </div>

      {/* Sub-nav */}
      <div className="tab-nav-desktop">
        <Link
          href="/"
          className="bg-transparent border-none border-b-2 border-b-transparent text-ink-muted px-[18px] py-3 cursor-pointer text-xs font-mono tracking-wide transition-colors duration-150 whitespace-nowrap min-h-[44px] no-underline flex items-center hover:text-ink-secondary"
        >
          {t('navDashboard')}
        </Link>
        <div className="bg-transparent border-none border-b-2 border-b-accent text-accent px-[18px] py-3 text-xs font-mono tracking-wide whitespace-nowrap min-h-[44px] flex items-center">
          {t('navScreener')}
        </div>
      </div>

      <div className="px-[clamp(12px,4vw,28px)] py-[clamp(12px,4vw,20px)]">
        {/* Section label */}
        <div className="text-[9px] tracking-[2px] text-accent font-mono mb-3 uppercase">
          {t('sectionLabel')}
        </div>

        <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
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

        {/* Results table */}
        <div className="bg-base-800 border border-base-600 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-base-600 flex justify-between items-center">
            <div className="text-[9px] tracking-[2px] text-ink-muted font-mono uppercase">
              {t('results', { count: stocks.length })}
            </div>
            {loading && (
              <span className="text-xs text-ink-muted font-mono animate-pulse-dot">{t('loading')}</span>
            )}
          </div>

          {error ? (
            <div className="px-8 py-10 text-center text-bear text-sm">
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          ) : (
            <ScreenerTable
              stocks={stocks}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              loading={loading}
            />
          )}
        </div>

        {/* Methodology */}
        <div className="mt-6 bg-base-800 border border-base-600 rounded-xl p-4">
          <div className="text-[9px] tracking-[2px] text-ink-muted font-mono mb-3 uppercase">
            {t('methodology')}
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed">
            {t.rich('methodologyBody', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
