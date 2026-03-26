'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Accordion } from './Accordion';

interface FilterPanelProps {
  sectors: string[];
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  selectedAiTier: string;
  onAiTierChange: (tier: string) => void;
  selectedGovTier: 'Red' | 'Amber' | 'Green' | '';
  onGovTierChange: (tier: 'Red' | 'Amber' | 'Green' | '') => void;
  minScore: string;
  onMinScoreChange: (score: string) => void;
  maxScore: string;
  onMaxScoreChange: (score: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FilterPanel({
  sectors,
  selectedSector,
  onSectorChange,
  selectedAiTier,
  onAiTierChange,
  selectedGovTier,
  onGovTierChange,
  minScore,
  onMinScoreChange,
  maxScore,
  onMaxScoreChange,
  searchQuery,
  onSearchChange
}: FilterPanelProps) {
  const t = useTranslations('filterPanel');
  
  // Count active advanced filters
  const advancedFilterCount = [minScore, maxScore, selectedGovTier].filter(Boolean).length;

  return (
    <div className="bg-surface-container-low rounded-xl p-6 mb-6">
      {/* Terminal Header */}
      <h2 className="font-headline text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">tune</span>
        {t('filters')}
      </h2>
      
      {/* Basic Filters - Always Visible */}
      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 font-headline">
            {t('searchStock')}
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-surface-container-highest border-b border-outline-variant/20 
                         focus:border-primary focus:ring-0 text-on-surface text-sm pl-10 py-3 
                         font-body transition-all placeholder:text-on-surface-variant/40
                         rounded-t-lg"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant 
                           hover:text-error transition-colors"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Sector Filter */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 font-headline">
            {t('sector')}
          </label>
          <select
            value={selectedSector}
            onChange={(e) => onSectorChange(e.target.value)}
            className="w-full bg-surface-container-highest border-none text-on-surface text-sm 
                       rounded-lg py-2.5 px-4 font-body focus:ring-1 focus:ring-primary/50 
                       cursor-pointer transition-all"
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector === 'All' ? t('allSectors') : sector}
              </option>
            ))}
          </select>
        </div>

        {/* AI Score Tier Filter */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 font-headline">
            {t('aiTier')}
          </label>
          <select
            value={selectedAiTier}
            onChange={(e) => onAiTierChange(e.target.value)}
            className="w-full bg-surface-container-highest border-none text-on-surface text-sm 
                       rounded-lg py-2.5 px-4 font-body focus:ring-1 focus:ring-primary/50 
                       cursor-pointer transition-all"
          >
            <option value="">{t('tierAll')}</option>
            <option value="1">{t('tier1')}</option>
            <option value="2">{t('tier2')}</option>
            <option value="3">{t('tier3')}</option>
            <option value="4">{t('tier4')}</option>
            <option value="5">{t('tier5')}</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Accordion */}
      <div className="mt-6">
        <Accordion
          title={t('advancedFilters')}
          badge={advancedFilterCount}
          defaultOpen={false}
        >
          <div className="space-y-6 pt-4">
            {/* Score Range */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-4 font-headline">
                {t('scoreRange')}
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  value={minScore}
                  onChange={(e) => onMinScoreChange(e.target.value)}
                  placeholder="Min"
                  className="w-full bg-surface-container-highest border-none text-on-surface text-xs 
                             rounded py-2 px-3 text-center font-label placeholder:text-on-surface-variant/30
                             focus:ring-1 focus:ring-primary/50"
                />
                <span className="text-on-surface-variant">—</span>
                <input
                  type="number"
                  value={maxScore}
                  onChange={(e) => onMaxScoreChange(e.target.value)}
                  placeholder="Max"
                  className="w-full bg-surface-container-highest border-none text-on-surface text-xs 
                             rounded py-2 px-3 text-center font-label placeholder:text-on-surface-variant/30
                             focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Governance Tier Segmented Control */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-4 font-headline">
                {t('govTier')}
              </label>
              <div className="grid grid-cols-3 gap-1 bg-surface-container-highest p-1 rounded-lg">
                {(['Green', 'Amber', 'Red'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => onGovTierChange(selectedGovTier === tier ? '' : tier)}
                    className={`text-[10px] font-bold py-2 rounded-md transition-all uppercase tracking-wider
                      ${selectedGovTier === tier 
                        ? tier === 'Green' ? 'bg-primary text-on-primary' 
                          : tier === 'Amber' ? 'bg-tertiary text-on-tertiary'
                          : 'bg-error text-on-error'
                        : tier === 'Green' ? 'text-primary hover:bg-white/5'
                          : tier === 'Amber' ? 'text-tertiary hover:bg-white/5'
                          : 'text-error hover:bg-white/5'
                      }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            {advancedFilterCount > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    onMinScoreChange('');
                    onMaxScoreChange('');
                    onGovTierChange('');
                  }}
                  className="border border-outline-variant/20 text-on-surface-variant px-4 py-2 
                             rounded-lg text-xs font-headline uppercase tracking-wider transition-all
                             hover:border-error hover:text-error"
                >
                  {t('clearAdvancedFilters')}
                </button>
              </div>
            )}
          </div>
        </Accordion>
      </div>

      {/* AI Score Legend Accordion */}
      <div className="mt-6">
        <Accordion title={t('legend') || 'AI Score Legend'} defaultOpen={false}>
          <div className="flex flex-wrap gap-2 pt-4">
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full 
                             bg-primary/10 text-primary border border-primary/20 font-label">
              {t('legendStrongBuy')}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full 
                             bg-secondary/10 text-secondary border border-secondary/20 font-label">
              {t('legendBuy')}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full 
                             bg-tertiary/10 text-tertiary border border-tertiary/20 font-label">
              {t('legendWatch')}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full 
                             bg-on-surface-variant/10 text-on-surface-variant border border-on-surface-variant/20 font-label">
              {t('legendNeutral')}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full 
                             bg-error/10 text-error border border-error/20 font-label">
              {t('legendAvoid')}
            </span>
          </div>
          
          {/* Methodology Explanation */}
          <div className="mt-4 p-3 bg-surface-container-highest rounded-lg border border-outline-variant/10">
            <p className="text-xs text-on-surface-variant leading-relaxed font-body">
              <strong className="text-primary">Composite Score:</strong> Fundamental (35%) · Technical (30%) · Sentiment (20%) · Liquidity (15%)
            </p>
          </div>
        </Accordion>
      </div>
    </div>
  );
}
