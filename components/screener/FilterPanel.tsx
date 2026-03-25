'use client';

import { useTranslations } from 'next-intl';

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

  return (
    <div style={{ background: '#09131f', border: '1px solid #132030', borderRadius: 10, padding: 16, marginBottom: 24 }}>
      <div style={{ fontSize: 9, letterSpacing: 2, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 16, textTransform: 'uppercase' }}>
        {t('filters')}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
        {/* Search */}
        <div>
          <label style={{ display: 'block', fontSize: 9, letterSpacing: 1.5, color: '#457b9d', fontFamily: "'DM Mono', monospace", marginBottom: 8, textTransform: 'uppercase' }}>
            {t('searchStock')}
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
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

        {/* Sector Filter */}
        <div>
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
