'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FilterPanel } from '@/components/screener/FilterPanel';
import { ScreenerTable } from '@/components/screener/ScreenerTable';
import { ScreenerCardList } from '@/components/screener/ScreenerCardList';
import { SkeletonLoader } from '@/components/screener/SkeletonLoader';
import { TerminalHeader } from '@/components/layout/TerminalHeader';
import { TerminalSidebar } from '@/components/layout/TerminalSidebar';
import { ResultsHeader } from '@/components/screener/ResultsHeader';
import { StockDetailPanel } from '@/components/screener/StockDetailPanel';
import type { EnrichedStock } from '@/lib/types/unified';

export default function ScreenerPage(): React.ReactElement {
  const t = useTranslations('screenerPage');
  const locale = useLocale();
  const loadErrorLabel = t('loadError');
  const [stocks, setStocks] = useState<EnrichedStock[]>([]);
  const [sectors, setSectors] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'table' | 'cards'>('table');
  
  // Stock Detail Panel state
  const [selectedStock, setSelectedStock] = useState<EnrichedStock | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleStockClick = (stock: EnrichedStock) => {
    setSelectedStock(stock);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedStock(null), 300);
  };

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
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      {/* Terminal Header */}
      <TerminalHeader locale={locale} />
      
      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1">
        {/* Terminal Sidebar */}
        <TerminalSidebar locale={locale} />
        
        {/* Content Area (Filter + Results) */}
        <div className="flex-1 flex gap-6 p-6 overflow-hidden">
          {/* Filter Panel Column */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24">
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
            </div>
          </div>

          {/* Results Column */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter (Full Width) */}
            <div className="lg:hidden mb-6">
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
            </div>

            {/* Results Header */}
            <ResultsHeader
              view={view}
              onViewChange={setView}
              totalResults={stocks.length}
            />

            {/* Results Content */}
            <div className="mt-6">
              {error ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-6xl text-error/40 mb-4 block">
                    error
                  </span>
                  <p className="font-headline text-sm uppercase tracking-widest text-error">
                    {error}
                  </p>
                </div>
              ) : loading ? (
                <SkeletonLoader rows={5} columns={7} />
              ) : view === 'cards' ? (
                <ScreenerCardList 
                  stocks={stocks} 
                  onStockClick={handleStockClick} 
                />
              ) : (
                <ScreenerTable
                  stocks={stocks}
                  onSort={handleSort}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onStockClick={handleStockClick}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <StockDetailPanel
        stock={selectedStock}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
      />
    </div>
  );
}
