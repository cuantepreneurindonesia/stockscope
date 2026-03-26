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

const inputClass = `
  w-full px-3 py-2.5 bg-base-900 border border-base-500 text-ink-primary rounded-lg
  text-sm outline-none transition-all duration-150 placeholder:text-ink-muted
  focus:border-accent focus:ring-2 focus:ring-accent-dim
`;

const labelClass = 'block text-[9px] tracking-[1.5px] text-ink-muted font-mono mb-2 uppercase font-semibold';

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
    <div className="bg-base-800 border border-base-600 rounded-xl p-4 mb-6">
      <div className="text-[9px] tracking-[2px] text-accent font-mono mb-4 uppercase font-semibold">
        {t('filters')}
      </div>

      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {/* Search */}
        <div>
          <label className={labelClass}>{t('searchStock')}</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={inputClass}
          />
        </div>

        {/* Sector Filter */}
        <div>
          <label className={labelClass}>{t('sector')}</label>
          <select
            value={selectedSector}
            onChange={(e) => onSectorChange(e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector} className="bg-base-800 text-ink-primary">
                {sector === 'All' ? t('allSectors') : sector}
              </option>
            ))}
          </select>
        </div>

        {/* AI Score Tier Filter */}
        <div>
          <label className={labelClass}>{t('aiTier')}</label>
          <select
            value={selectedAiTier}
            onChange={(e) => onAiTierChange(e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="" className="bg-base-800 text-ink-primary">{t('tierAll')}</option>
            <option value="1" className="bg-base-800 text-ink-primary">{t('tier1')}</option>
            <option value="2" className="bg-base-800 text-ink-primary">{t('tier2')}</option>
            <option value="3" className="bg-base-800 text-ink-primary">{t('tier3')}</option>
            <option value="4" className="bg-base-800 text-ink-primary">{t('tier4')}</option>
            <option value="5" className="bg-base-800 text-ink-primary">{t('tier5')}</option>
          </select>
        </div>

        {/* Score Range */}
        <div>
          <label className={labelClass}>{t('scoreRange')}</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={minScore}
              onChange={(e) => onMinScoreChange(e.target.value)}
              placeholder={t('min')}
              min="0"
              max="100"
              className={inputClass}
            />
            <span className="text-ink-muted text-sm flex-shrink-0">—</span>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => onMaxScoreChange(e.target.value)}
              placeholder={t('max')}
              min="0"
              max="100"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Governance Tier Buttons */}
      <div className="mb-4 pb-4 border-b border-base-600">
        <p className={labelClass}>{t('govTier')}</p>
        <div className="flex gap-2 flex-wrap">
          {(['Red', 'Amber', 'Green'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => onGovTierChange(selectedGovTier === tier ? '' : tier)}
              className={`
                px-4 py-1.5 rounded-lg border text-xs font-medium cursor-pointer
                whitespace-nowrap transition-all duration-150
                ${selectedGovTier === tier
                  ? 'bg-accent text-base-900 border-accent font-semibold'
                  : tier === 'Red'
                  ? 'bg-tier-red/10 border-tier-red/30 text-tier-red hover:border-tier-red/60'
                  : tier === 'Amber'
                  ? 'bg-tier-amber/10 border-tier-amber/30 text-tier-amber hover:border-tier-amber/60'
                  : 'bg-tier-green/10 border-tier-green/30 text-tier-green hover:border-tier-green/60'
                }
              `}
            >
              {t('riskSuffix', { tier })}
            </button>
          ))}
        </div>
      </div>

      {/* Score Legend */}
      <div>
        <p className={labelClass}>{t('legend')}</p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1.5 text-[11px] font-semibold rounded-md bg-tier-green/10 text-tier-green border border-tier-green/30">
            {t('legendStrongBuy')}
          </span>
          <span className="inline-flex items-center px-3 py-1.5 text-[11px] font-semibold rounded-md bg-accent/10 text-accent border border-accent/30">
            {t('legendBuy')}
          </span>
          <span className="inline-flex items-center px-3 py-1.5 text-[11px] font-semibold rounded-md bg-tier-amber/10 text-tier-amber border border-tier-amber/30">
            {t('legendWatch')}
          </span>
          <span className="inline-flex items-center px-3 py-1.5 text-[11px] font-semibold rounded-md bg-ink-muted/10 text-ink-secondary border border-ink-muted/20">
            {t('legendNeutral')}
          </span>
          <span className="inline-flex items-center px-3 py-1.5 text-[11px] font-semibold rounded-md bg-tier-red/10 text-tier-red border border-tier-red/30">
            {t('legendAvoid')}
          </span>
        </div>
      </div>
    </div>
  );
}
