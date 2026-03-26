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

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: '#060d18',
    border: '1px solid #1e3a52',
    color: '#e8f4f8',
    borderRadius: 6,
    fontSize: '0.875rem',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: '0 0 0 0 rgba(69, 123, 157, 0)'
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#457b9d';
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(69, 123, 157, 0.2)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#1e3a52';
    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(69, 123, 157, 0)';
  };

  return (
    <div style={{ background: '#09131f', border: '1px solid #132030', borderRadius: 10, padding: 16, marginBottom: 24 }}>
      <div style={{ fontSize: 9, letterSpacing: 2, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 16, textTransform: 'uppercase' }}>
        {t('filters')}
      </div>
      
      {/* Basic Filters - Always Visible */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Search */}
        <div>
          <label style={{ display: 'block', fontSize: 9, letterSpacing: 1.5, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 8, textTransform: 'uppercase' }}>
            {t('searchStock')}
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#457b9d' }}>
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder')}
              style={{
                ...inputStyle,
                paddingLeft: 38
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6b8aad',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#e76f51'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aad'}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Sector Filter */}
        <div>
          <label style={{ display: 'block', fontSize: 9, letterSpacing: 1.5, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 8, textTransform: 'uppercase' }}>
            {t('sector')}
          </label>
          <select
            value={selectedSector}
            onChange={(e) => onSectorChange(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector} style={{ background: '#09131f', color: '#e8f4f8' }}>
                {sector === 'All' ? t('allSectors') : sector}
              </option>
            ))}
          </select>
        </div>

        {/* AI Score Tier Filter */}
        <div>
          <label style={{ display: 'block', fontSize: 9, letterSpacing: 1.5, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 8, textTransform: 'uppercase' }}>
            {t('aiTier')}
          </label>
          <select
            value={selectedAiTier}
            onChange={(e) => onAiTierChange(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tierAll')}</option>
            <option value="1" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tier1')}</option>
            <option value="2" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tier2')}</option>
            <option value="3" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tier3')}</option>
            <option value="4" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tier4')}</option>
            <option value="5" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tier5')}</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      <Accordion title={t('advancedFilters') || 'Advanced Filters'} badge={advancedFilterCount}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
          {/* Score Range */}
          <div>
            <label style={{ display: 'block', fontSize: 9, letterSpacing: 1.5, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 8, textTransform: 'uppercase' }}>
              {t('scoreRange')}
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                value={minScore}
                onChange={(e) => onMinScoreChange(e.target.value)}
                placeholder={t('min')}
                min="0"
                max="100"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <span style={{ display: 'flex', alignItems: 'center', color: '#6b8aad' }}>-</span>
              <input
                type="number"
                value={maxScore}
                onChange={(e) => onMaxScoreChange(e.target.value)}
                placeholder={t('max')}
                min="0"
                max="100"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>
        </div>

        {/* Governance Tier Buttons */}
        <div>
          <p style={{ fontSize: 9, letterSpacing: 1.5, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 12, textTransform: 'uppercase' }}>
            {t('govTier')}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['Red', 'Amber', 'Green'] as const).map(tier => (
              <button
                key={tier}
                onClick={() => onGovTierChange(selectedGovTier === tier ? '' : tier)}
                style={{
                  background: selectedGovTier === tier ? '#457b9d' : '#2d3748',
                  border: selectedGovTier === tier ? '1px solid #64b5f6' : '1px solid #4b5563',
                  color: selectedGovTier === tier ? '#ffffff' : (tier === 'Red' ? '#E76F51' : tier === 'Amber' ? '#E9C46A' : '#2A9D8F'),
                  borderRadius: 6,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  minHeight: 36
                }}
                onMouseEnter={(e) => {
                  if (selectedGovTier !== tier) {
                    e.currentTarget.style.borderColor = '#64b5f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedGovTier !== tier) {
                    e.currentTarget.style.borderColor = '#4b5563';
                  }
                }}
              >
                {t('riskSuffix', { tier })}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters Button */}
        {advancedFilterCount > 0 && (
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                onMinScoreChange('');
                onMaxScoreChange('');
                onGovTierChange('');
              }}
              style={{
                background: 'none',
                border: '1px solid #1e3a52',
                color: '#6b8aad',
                padding: '8px 16px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#e76f51';
                e.currentTarget.style.color = '#e76f51';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e3a52';
                e.currentTarget.style.color = '#6b8aad';
              }}
            >
              Clear advanced filters
            </button>
          </div>
        )}
      </Accordion>

      {/* Score Legend - Moved to Accordion */}
      <Accordion title={t('legend') || 'AI Score Legend'} defaultOpen={false}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: 'rgba(42, 157, 143, 0.1)', color: '#2a9d8f', border: '1px solid rgba(42, 157, 143, 0.3)' }}>
            {t('legendStrongBuy')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: 'rgba(69, 123, 157, 0.1)', color: '#a8d8ea', border: '1px solid rgba(69, 123, 157, 0.3)' }}>
            {t('legendBuy')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: 'rgba(233, 196, 106, 0.1)', color: '#e9c46a', border: '1px solid rgba(233, 196, 106, 0.3)' }}>
            {t('legendWatch')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: 'rgba(107, 138, 173, 0.1)', color: '#6b8aad', border: '1px solid rgba(107, 138, 173, 0.3)' }}>
            {t('legendNeutral')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: 'rgba(231, 111, 81, 0.1)', color: '#e76f51', border: '1px solid rgba(231, 111, 81, 0.3)' }}>
            {t('legendAvoid')}
          </span>
        </div>
        
        {/* Methodology Explanation */}
        <div style={{ marginTop: 16, padding: 12, background: '#060d18', borderRadius: 6, border: '1px solid #1e3a52' }}>
          <p style={{ fontSize: '0.75rem', color: '#a8c8e8', lineHeight: 1.6 }}>
            <strong style={{ color: '#457b9d' }}>Composite Score:</strong> Fundamental (35%) · Technical (30%) · Sentiment (20%) · Liquidity (15%)
          </p>
        </div>
      </Accordion>
    </div>
  );
}
          <label style={{ display: 'block', fontSize: 9, letterSpacing: 1.5, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 8, textTransform: 'uppercase' }}>
            {t('sector')}
          </label>
          <select
            value={selectedSector}
            onChange={(e) => onSectorChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#060d18',
              border: '1px solid #1e3a52',
              color: '#e8f4f8',
              borderRadius: 6,
              fontSize: '0.875rem',
              fontFamily: 'DM Sans, sans-serif',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: '0 0 0 0 rgba(69, 123, 157, 0)',
              cursor: 'pointer'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#457b9d';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(69, 123, 157, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1e3a52';
              e.currentTarget.style.boxShadow = '0 0 0 0 rgba(69, 123, 157, 0)';
            }}
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector} style={{ background: '#09131f', color: '#e8f4f8' }}>
                {sector === 'All' ? t('allSectors') : sector}
              </option>
            ))}
          </select>
        </div>

        {/* AI Score Tier Filter */}
        <div>
          <label style={{ display: 'block', fontSize: 9, letterSpacing: 1.5, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 8, textTransform: 'uppercase' }}>
            {t('aiTier')}
          </label>
          <select
            value={selectedAiTier}
            onChange={(e) => onAiTierChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#060d18',
              border: '1px solid #1e3a52',
              color: '#e8f4f8',
              borderRadius: 6,
              fontSize: '0.875rem',
              fontFamily: 'DM Sans, sans-serif',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: '0 0 0 0 rgba(69, 123, 157, 0)',
              cursor: 'pointer'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#457b9d';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(69, 123, 157, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1e3a52';
              e.currentTarget.style.boxShadow = '0 0 0 0 rgba(69, 123, 157, 0)';
            }}
          >
            <option value="" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tierAll')}</option>
            <option value="1" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tier1')}</option>
            <option value="2" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tier2')}</option>
            <option value="3" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tier3')}</option>
            <option value="4" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tier4')}</option>
            <option value="5" style={{ background: '#09131f', color: '#e8f4f8' }}>{t('tier5')}</option>
          </select>
        </div>

        {/* Score Range */}
        <div>
          <label style={{ display: 'block', fontSize: 9, letterSpacing: 1.5, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 8, textTransform: 'uppercase' }}>
            {t('scoreRange')}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              value={minScore}
              onChange={(e) => onMinScoreChange(e.target.value)}
              placeholder={t('min')}
              min="0"
              max="100"
              style={{
                flex: 1,
                padding: '10px 12px',
                background: '#060d18',
                border: '1px solid #1e3a52',
                color: '#e8f4f8',
                borderRadius: 6,
                fontSize: '0.875rem',
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: '0 0 0 0 rgba(69, 123, 157, 0)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#457b9d';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(69, 123, 157, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1e3a52';
                e.currentTarget.style.boxShadow = '0 0 0 0 rgba(69, 123, 157, 0)';
              }}
            />
            <span style={{ display: 'flex', alignItems: 'center', color: '#6b8aad' }}>-</span>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => onMaxScoreChange(e.target.value)}
              placeholder={t('max')}
              min="0"
              max="100"
              style={{
                flex: 1,
                padding: '10px 12px',
                background: '#060d18',
                border: '1px solid #1e3a52',
                color: '#e8f4f8',
                borderRadius: 6,
                fontSize: '0.875rem',
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: '0 0 0 0 rgba(69, 123, 157, 0)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#457b9d';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(69, 123, 157, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1e3a52';
                e.currentTarget.style.boxShadow = '0 0 0 0 rgba(69, 123, 157, 0)';
              }}
            />
          </div>
        </div>
      </div>

      {/* Governance Tier Buttons */}
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #132030' }}>
        <p style={{ fontSize: 9, letterSpacing: 1.5, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 12, textTransform: 'uppercase' }}>{t('govTier')}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['Red', 'Amber', 'Green'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => onGovTierChange(selectedGovTier === tier ? '' : tier)}
              style={{
                background: selectedGovTier === tier ? '#64b5f6' : '#2d3748',
                border: '1px solid #4b5563',
                color: selectedGovTier === tier ? '#ffffff' : (tier === 'Red' ? '#E76F51' : tier === 'Amber' ? '#E9C46A' : '#2A9D8F'),
                borderRadius: 6,
                padding: '6px 16px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {t('riskSuffix', { tier })}
            </button>
          ))}
        </div>
      </div>

      {/* Score Legend */}
      <div>
        <p style={{ fontSize: 9, letterSpacing: 1.5, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 12, textTransform: 'uppercase' }}>{t('legend')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: 'rgba(42, 157, 143, 0.1)', color: '#2a9d8f', border: '1px solid rgba(42, 157, 143, 0.3)' }}>
            {t('legendStrongBuy')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: 'rgba(69, 123, 157, 0.1)', color: '#a8d8ea', border: '1px solid rgba(69, 123, 157, 0.3)' }}>
            {t('legendBuy')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: 'rgba(233, 196, 106, 0.1)', color: '#e9c46a', border: '1px solid rgba(233, 196, 106, 0.3)' }}>
            {t('legendWatch')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: 'rgba(107, 138, 173, 0.1)', color: '#6b8aad', border: '1px solid rgba(107, 138, 173, 0.3)' }}>
            {t('legendNeutral')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: 'rgba(231, 111, 81, 0.1)', color: '#e76f51', border: '1px solid rgba(231, 111, 81, 0.3)' }}>
            {t('legendAvoid')}
          </span>
        </div>
      </div>
    </div>
  );
}
