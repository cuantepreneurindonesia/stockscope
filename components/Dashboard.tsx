'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AppHeader, KpiCards, TabBar, MobileDrawer } from '@/components/layout';
import { OnboardingTour } from '@/components/OnboardingTour';
import {
  OverviewTab,
  RiskMapTab,
  HhiTab,
  FlagsTab,
  ScreenerTab,
  OwnersTab,
  StatsTab,
} from '@/components/tabs';
import { useStockData, useAnalytics, useStockStatsExtended, usePlan } from '@/lib/hooks';
import { BlurOverlay } from '@/components/ui';
import type { DashboardFilters, Stock } from '@/lib/types';

const TOUR_STORAGE_KEY = 'tourCompleted';

export function Dashboard(): React.ReactElement {
  const tDash = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const NAV_TABS = useMemo<[string, string][]>(
    () => [
      ['overview', tNav('overview')],
      ['scatter', tNav('scatter')],
      ['hhi', tNav('hhi')],
      ['flags', tNav('flags')],
      ['table', tNav('table')],
      ['owners', tNav('owners')],
    ],
    [tNav]
  );
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const completed = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!completed) setShowTour(true);
  }, []);

  const handleTourSkip = useCallback((): void => {
    if (typeof window !== 'undefined') localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setShowTour(false);
  }, []);

  const handleTourComplete = useCallback((): void => {
    if (typeof window !== 'undefined') localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setShowTour(false);
  }, []);

  const handleReplayTour = useCallback((): void => {
    if (typeof window !== 'undefined') localStorage.setItem(TOUR_STORAGE_KEY, 'false');
    setShowTour(true);
  }, []);
  const [filters, setFilters] = useState<DashboardFilters>({
    tier: undefined,
    searchText: undefined,
    hierarchyLevel: undefined,
    flag: undefined,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [expandedPortfolios, setExpandedPortfolios] = useState<Record<string, boolean>>({});

  const stockData = useStockData({
    tier: filters.tier,
    searchText: filters.searchText,
    hierarchyLevel: filters.hierarchyLevel,
    flag: filters.flag,
  });

  const { stats, loading: statsLoading } = useAnalytics({
    tier: filters.tier,
    hierarchyLevel: filters.hierarchyLevel,
    flag: filters.flag,
  });

  const {
    stats: tabStats,
    hhiHist,
    flagCounts,
    filteredOwners,
    ownerTypeData,
    topOwnersBarData,
  } = useStockStatsExtended(stockData.filtered, ownerSearch);

  const { isPremium, dataLimit } = usePlan();

  const handleSearch = useCallback(
    (query: string): void => {
      setFilters((f) => ({ ...f, searchText: query || undefined }));
      if (query) setActiveTab('table');
    },
    []
  );

  const handleTierFilter = useCallback(
    (tier: Stock['tier'] | null): void => {
      setFilters((f) => ({ ...f, tier: tier || undefined }));
    },
    []
  );

  const handleHhiFilter = useCallback((hl: string | null): void => {
    setFilters((f) => ({ ...f, hierarchyLevel: hl || undefined }));
  }, []);

  const handleFlagFilter = useCallback((flag: string | null): void => {
    setFilters((f) => ({ ...f, flag: flag || undefined }));
  }, []);

  const handleReset = useCallback((): void => {
    setFilters({
      tier: undefined,
      searchText: undefined,
      hierarchyLevel: undefined,
      flag: undefined,
    });
  }, []);

  const handleStockSelect = useCallback(
    (stock: Stock): void => {
      setSelectedStock((prev) => (prev?.code === stock.code ? null : stock));
    },
    []
  );

  const toggleExpand = useCallback((name: string): void => {
    setExpandedPortfolios((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const hasFilter = !!(
    filters.tier ||
    filters.searchText ||
    filters.hierarchyLevel ||
    filters.flag
  );

  const dynamicTitle = useMemo(() => {
    if (filters.tier)
      return tDash('title.tierRisk', {
        tier: filters.tier,
        count: stockData.filtered.length,
        total: stockData.RAW.length,
      });
    if (filters.hierarchyLevel)
      return tDash('title.hhi', {
        level: filters.hierarchyLevel,
        count: stockData.filtered.length,
      });
    if (filters.flag)
      return tDash('title.flag', {
        flag: filters.flag,
        count: stockData.filtered.length,
      });
    return tDash('title.default', { count: stockData.RAW.length });
  }, [
    stockData.filtered.length,
    stockData.RAW.length,
    filters.tier,
    filters.hierarchyLevel,
    filters.flag,
    tDash,
  ]);

  if (stockData.loading && stockData.RAW.length === 0) {
    return (
      <div className="app-root bg-base-900 min-h-screen text-ink-primary flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">{tDash('loadingTitle')}</h2>
          <p className="text-sm text-ink-secondary">{tDash('loadingSubtitle')}</p>
        </div>
      </div>
    );
  }

  if (stockData.error && stockData.RAW.length === 0) {
    return (
      <div className="app-root bg-base-900 min-h-screen text-ink-primary flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-3xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold mb-2 text-bear">{tDash('errorTitle')}</h2>
          <p className="text-sm text-ink-secondary">{stockData.error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="app-root bg-base-900 min-h-screen text-ink-primary pb-10">
        <MobileDrawer
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          drawerRef={drawerRef}
          NAV_TABS={NAV_TABS}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <AppHeader
          dynamicTitle={dynamicTitle}
          search={filters.searchText || ''}
          setSearch={handleSearch}
          hasFilter={hasFilter}
          clearFilters={handleReset}
          setDrawerOpen={setDrawerOpen}
          drawerOpen={drawerOpen}
          tierFilter={filters.tier || null}
          setTierFilter={handleTierFilter}
          hhiFilter={filters.hierarchyLevel || null}
          setHhiFilter={handleHhiFilter}
          flagFilter={filters.flag || null}
          setFlagFilter={handleFlagFilter}
          onReplayTour={handleReplayTour}
        />

        <KpiCards
          stats={stats}
          loading={stockData.loading || statsLoading}
          tierFilter={filters.tier || null}
          setTierFilter={handleTierFilter}
        />

        <TabBar
          NAV_TABS={NAV_TABS}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="content-area">
          {activeTab === 'overview' && (
            <OverviewTab
              stocks={stockData.filtered}
              stats={stats}
              loading={stockData.loading}
            />
          )}

          {activeTab === 'scatter' && (
            <BlurOverlay isBlurred={!isPremium} message={tDash('premium.riskMap')}>
              <RiskMapTab
                filtered={stockData.filtered}
                selectedStock={selectedStock}
                setSelectedStock={setSelectedStock}
                tierFilter={filters.tier || null}
                setTierFilter={handleTierFilter}
              />
            </BlurOverlay>
          )}

          {activeTab === 'hhi' && (
            <BlurOverlay isBlurred={!isPremium} message={tDash('premium.hhi')}>
              <HhiTab
                stats={tabStats}
                filtered={stockData.filtered}
                hhiHist={hhiHist}
                hhiFilter={filters.hierarchyLevel || null}
                setHhiFilter={handleHhiFilter}
              />
            </BlurOverlay>
          )}

          {activeTab === 'flags' && (
            <BlurOverlay isBlurred={!isPremium} message={tDash('premium.flags')}>
              <FlagsTab
                stats={tabStats}
                flagCounts={flagCounts}
                flagFilter={filters.flag || null}
                setFlagFilter={handleFlagFilter}
              />
            </BlurOverlay>
          )}

          {activeTab === 'table' && (
            <ScreenerTab
              stocks={stockData.filtered}
              loading={stockData.loading}
              onStockSelect={handleStockSelect}
              dataLimit={dataLimit}
              isPremium={isPremium}
            />
          )}

          {activeTab === 'owners' && (
            <OwnersTab
              filteredOwners={filteredOwners}
              ownerSearch={ownerSearch}
              setOwnerSearch={setOwnerSearch}
              ownerTypeData={ownerTypeData}
              topOwnersBarData={topOwnersBarData}
              expandedPortfolios={expandedPortfolios}
              toggleExpand={toggleExpand}
              dataLimit={dataLimit}
              isPremium={isPremium}
            />
          )}

          {activeTab === 'stats' && (
            <BlurOverlay isBlurred={!isPremium} message={tDash('premium.stats')}>
              <StatsTab
                stats={stats}
                stocks={stockData.filtered}
                loading={statsLoading}
              />
            </BlurOverlay>
          )}

          {!stockData.loading && stockData.filtered.length === 0 && activeTab !== 'owners' && (
            <div className="text-center px-5 py-16 text-ink-secondary animate-fade-in">
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-base mb-2">{tDash('emptyTitle')}</p>
              <p className="text-sm text-ink-muted">{tDash('emptyHint')}</p>
            </div>
          )}
        </div>
      </div>

      <OnboardingTour
        visible={showTour}
        onSkip={handleTourSkip}
        onComplete={handleTourComplete}
      />
    </>
  );
}
