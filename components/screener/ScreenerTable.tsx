'use client';

import { useState, useEffect } from 'react';
import { FlagPill } from '@/components/ui';
import type { EnrichedStock } from '@/lib/types/unified';
import { ColumnVisibilityMenu, type ColumnConfig } from './ColumnVisibilityMenu';

interface ScreenerTableProps {
  stocks: EnrichedStock[];
  onSort: (field: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const STORAGE_KEY = 'screener-column-visibility';

// Default column configuration
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'code', label: 'Ticker', visible: true, core: true },
  { id: 'issuer', label: 'Issuer', visible: true, core: true },
  { id: 'sector', label: 'Sector', visible: false },
  { id: 'price', label: 'Price', visible: true, core: true },
  { id: 'change', label: 'Change %', visible: true, core: true },
  { id: 'composite', label: 'AI Score', visible: true, core: true },
  { id: 'aiTier', label: 'AI Tier', visible: true, core: true },
  { id: 'govTier', label: 'Gov Tier', visible: true, core: true },
  { id: 'hhi', label: 'HHI', visible: false },
  { id: 'flags', label: 'Flags', visible: false },
  { id: 'pe', label: 'P/E', visible: false },
  { id: 'roe', label: 'ROE %', visible: false },
  { id: 'dividendYield', label: 'Div Yield %', visible: false }
];

const SortIcon = ({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: 'asc' | 'desc' }) => {
  if (sortBy !== field) {
    return <span style={{ color: '#6b8aad', marginLeft: 6, fontSize: '0.875rem', opacity: 0.4 }}>⇅</span>;
  }
  return (
    <span style={{ 
      marginLeft: 6, 
      fontSize: '1rem',
      color: '#457b9d',
      fontWeight: 'bold'
    }}>
      {sortOrder === 'asc' ? '↑' : '↓'}
    </span>
  );
};

export function ScreenerTable({ stocks, onSort, sortBy, sortOrder }: ScreenerTableProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  // Load column visibility from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new columns
        const merged = DEFAULT_COLUMNS.map(def => {
          const saved = parsed.find((p: ColumnConfig) => p.id === def.id);
          return saved ? { ...def, visible: saved.visible } : def;
        });
        setColumns(merged);
      } catch (e) {
        console.error('Failed to parse column visibility settings:', e);
      }
    }
  }, []);

  // Save column visibility to localStorage
  const handleColumnsChange = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newColumns.map(c => ({ id: c.id, visible: c.visible }))));
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return '—';
    return price.toLocaleString('id-ID');
  };

  // Map governance tier to RTI colors
  const getGovTierStyle = (tier: string) => {
    const tierColors: Record<string, { color: string; bg: string }> = {
      'Red': { color: '#E76F51', bg: 'rgba(231, 111, 81, 0.12)' },
      'Amber': { color: '#E9C46A', bg: 'rgba(233, 196, 106, 0.12)' },
      'Green': { color: '#2A9D8F', bg: 'rgba(42, 157, 143, 0.12)' }
    };
    return tierColors[tier] || { color: '#6b8aad', bg: 'rgba(107, 138, 173, 0.12)' };
  };

  // Get HHI color
  const getHhiColor = (hhi: number | undefined) => {
    if (!hhi) return '#6b8aad';
    if (hhi < 1500) return '#2a9d8f';
    if (hhi <= 2500) return '#e9c46a';
    return '#e76f51';
  };

  // Score bar component
  const ScoreBar = ({ value }: { value: number | undefined }) => {
    if (!value) return <span>—</span>;

    let color = '#e76f51';
    if (value >= 80) color = '#2a9d8f';
    else if (value >= 65) color = '#457b9d';
    else if (value >= 50) color = '#e9c46a';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div 
          style={{ 
            flex: 1, 
            height: 20, 
            background: 'rgba(69, 123, 157, 0.08)', 
            borderRadius: 3, 
            overflow: 'hidden', 
            border: '1px solid #1e3a52',
            position: 'relative'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${value}%`,
              background: `linear-gradient(90deg, ${color}, ${color}dd)`,
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `0 0 8px ${color}44`
            }}
          />
        </div>
        <span style={{ 
          fontSize: 11, 
          fontFamily: "'DM Mono', monospace", 
          color: color, 
          minWidth: 30, 
          textAlign: 'right', 
          fontWeight: 700,
          textShadow: `0 0 8px ${color}44`
        }}>
          {value}
        </span>
      </div>
    );
  };

  const isColumnVisible = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    return column?.visible ?? true;
  };

  const visibleColumnCount = columns.filter(c => c.visible).length;

  return (
    <div>
      {/* Column visibility controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: 12,
        padding: '0 16px'
      }}>
        <ColumnVisibilityMenu columns={columns} onChange={handleColumnsChange} />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#060d18', borderBottom: '1px solid #132030' }}>
              {isColumnVisible('code') && (
                <th 
                  style={{ 
                    padding: 12, 
                    textAlign: 'left', 
                    fontSize: 9, 
                    fontFamily: "'DM Mono', monospace", 
                    color: sortBy === 'code' ? '#a8d8ea' : '#457b9d',
                    background: sortBy === 'code' ? 'rgba(69, 123, 157, 0.08)' : 'transparent',
                    textTransform: 'uppercase', 
                    letterSpacing: 1, 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }} 
                  onClick={() => onSort('code')}
                  onMouseEnter={(e) => {
                    if (sortBy !== 'code') e.currentTarget.style.color = '#a8c8e8';
                  }}
                  onMouseLeave={(e) => {
                    if (sortBy !== 'code') e.currentTarget.style.color = '#457b9d';
                  }}
                >
                  Ticker <SortIcon field="code" sortBy={sortBy} sortOrder={sortOrder} />
                </th>
              )}
              {isColumnVisible('issuer') && (
                <th style={{ padding: 12, textAlign: 'left', fontSize: 9, fontFamily: "'DM Mono', monospace", color: '#457b9d', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Issuer
                </th>
              )}
              {isColumnVisible('sector') && (
                <th style={{ padding: 12, textAlign: 'left', fontSize: 9, fontFamily: "'DM Mono', monospace", color: '#457b9d', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Sector
                </th>
              )}
              {isColumnVisible('price') && (
                <th 
                  style={{ 
                    padding: 12, 
                    textAlign: 'right', 
                    fontSize: 9, 
                    fontFamily: "'DM Mono', monospace", 
                    color: sortBy === 'price' ? '#a8d8ea' : '#457b9d',
                    background: sortBy === 'price' ? 'rgba(69, 123, 157, 0.08)' : 'transparent',
                    textTransform: 'uppercase', 
                    letterSpacing: 1, 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }} 
                  onClick={() => onSort('price')}
                  onMouseEnter={(e) => {
                    if (sortBy !== 'price') e.currentTarget.style.color = '#a8c8e8';
                  }}
                  onMouseLeave={(e) => {
                    if (sortBy !== 'price') e.currentTarget.style.color = '#457b9d';
                  }}
                >
                  Price <SortIcon field="price" sortBy={sortBy} sortOrder={sortOrder} />
                </th>
              )}
              {isColumnVisible('change') && (
                <th 
                  style={{ 
                    padding: 12, 
                    textAlign: 'right', 
                    fontSize: 9, 
                    fontFamily: "'DM Mono', monospace", 
                    color: sortBy === 'change' ? '#a8d8ea' : '#457b9d',
                    background: sortBy === 'change' ? 'rgba(69, 123, 157, 0.08)' : 'transparent',
                    textTransform: 'uppercase', 
                    letterSpacing: 1, 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }} 
                  onClick={() => onSort('change')}
                  onMouseEnter={(e) => {
                    if (sortBy !== 'change') e.currentTarget.style.color = '#a8c8e8';
                  }}
                  onMouseLeave={(e) => {
                    if (sortBy !== 'change') e.currentTarget.style.color = '#457b9d';
                  }}
                >
                  Change % <SortIcon field="change" sortBy={sortBy} sortOrder={sortOrder} />
                </th>
              )}
              {isColumnVisible('composite') && (
                <th 
                  style={{ 
                    padding: 12, 
                    textAlign: 'left', 
                    fontSize: 9, 
                    fontFamily: "'DM Mono', monospace", 
                    color: sortBy === 'composite' ? '#a8d8ea' : '#457b9d',
                    background: sortBy === 'composite' ? 'rgba(69, 123, 157, 0.08)' : 'transparent',
                    textTransform: 'uppercase', 
                    letterSpacing: 1, 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }} 
                  onClick={() => onSort('composite')}
                  onMouseEnter={(e) => {
                    if (sortBy !== 'composite') e.currentTarget.style.color = '#a8c8e8';
                  }}
                  onMouseLeave={(e) => {
                    if (sortBy !== 'composite') e.currentTarget.style.color = '#457b9d';
                  }}
                >
                  AI Score <SortIcon field="composite" sortBy={sortBy} sortOrder={sortOrder} />
                </th>
              )}
              {isColumnVisible('aiTier') && (
                <th style={{ padding: 12, textAlign: 'center', fontSize: 9, fontFamily: "'DM Mono', monospace", color: '#457b9d', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  AI Tier
                </th>
              )}
              {isColumnVisible('govTier') && (
                <th style={{ padding: 12, textAlign: 'center', fontSize: 9, fontFamily: "'DM Mono', monospace", color: '#457b9d', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Gov Tier
                </th>
              )}
              {isColumnVisible('hhi') && (
                <th 
                  style={{ 
                    padding: 12, 
                    textAlign: 'right', 
                    fontSize: 9, 
                    fontFamily: "'DM Mono', monospace", 
                    color: sortBy === 'hhi' ? '#a8d8ea' : '#457b9d',
                    background: sortBy === 'hhi' ? 'rgba(69, 123, 157, 0.08)' : 'transparent',
                    textTransform: 'uppercase', 
                    letterSpacing: 1, 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }} 
                  onClick={() => onSort('hhi')}
                  onMouseEnter={(e) => {
                    if (sortBy !== 'hhi') e.currentTarget.style.color = '#a8c8e8';
                  }}
                  onMouseLeave={(e) => {
                    if (sortBy !== 'hhi') e.currentTarget.style.color = '#457b9d';
                  }}
                >
                  HHI <SortIcon field="hhi" sortBy={sortBy} sortOrder={sortOrder} />
                </th>
              )}
              {isColumnVisible('flags') && (
                <th style={{ padding: 12, textAlign: 'left', fontSize: 9, fontFamily: "'DM Mono', monospace", color: '#457b9d', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Flags
                </th>
              )}
              {isColumnVisible('pe') && (
                <th 
                  style={{ 
                    padding: 12, 
                    textAlign: 'right', 
                    fontSize: 9, 
                    fontFamily: "'DM Mono', monospace", 
                    color: sortBy === 'pe' ? '#a8d8ea' : '#457b9d',
                    background: sortBy === 'pe' ? 'rgba(69, 123, 157, 0.08)' : 'transparent',
                    textTransform: 'uppercase', 
                    letterSpacing: 1, 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }} 
                  onClick={() => onSort('pe')}
                  onMouseEnter={(e) => {
                    if (sortBy !== 'pe') e.currentTarget.style.color = '#a8c8e8';
                  }}
                  onMouseLeave={(e) => {
                    if (sortBy !== 'pe') e.currentTarget.style.color = '#457b9d';
                  }}
                >
                  P/E <SortIcon field="pe" sortBy={sortBy} sortOrder={sortOrder} />
                </th>
              )}
              {isColumnVisible('roe') && (
                <th 
                  style={{ 
                    padding: 12, 
                    textAlign: 'right', 
                    fontSize: 9, 
                    fontFamily: "'DM Mono', monospace", 
                    color: sortBy === 'roe' ? '#a8d8ea' : '#457b9d',
                    background: sortBy === 'roe' ? 'rgba(69, 123, 157, 0.08)' : 'transparent',
                    textTransform: 'uppercase', 
                    letterSpacing: 1, 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }} 
                  onClick={() => onSort('roe')}
                  onMouseEnter={(e) => {
                    if (sortBy !== 'roe') e.currentTarget.style.color = '#a8c8e8';
                  }}
                  onMouseLeave={(e) => {
                    if (sortBy !== 'roe') e.currentTarget.style.color = '#457b9d';
                  }}
                >
                  ROE % <SortIcon field="roe" sortBy={sortBy} sortOrder={sortOrder} />
                </th>
              )}
              {isColumnVisible('dividendYield') && (
                <th 
                  style={{ 
                    padding: 12, 
                    textAlign: 'right', 
                    fontSize: 9, 
                    fontFamily: "'DM Mono', monospace", 
                    color: sortBy === 'dividendYield' ? '#a8d8ea' : '#457b9d',
                    background: sortBy === 'dividendYield' ? 'rgba(69, 123, 157, 0.08)' : 'transparent',
                    textTransform: 'uppercase', 
                    letterSpacing: 1, 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }} 
                  onClick={() => onSort('dividendYield')}
                  onMouseEnter={(e) => {
                    if (sortBy !== 'dividendYield') e.currentTarget.style.color = '#a8c8e8';
                  }}
                  onMouseLeave={(e) => {
                    if (sortBy !== 'dividendYield') e.currentTarget.style.color = '#457b9d';
                  }}
                >
                  Div Yield % <SortIcon field="dividendYield" sortBy={sortBy} sortOrder={sortOrder} />
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnCount} style={{ padding: 32, textAlign: 'center', color: '#6b8aad', fontSize: '0.875rem' }}>
                  No stocks found matching your criteria
                </td>
              </tr>
            ) : (
              stocks.map((stock, idx) => {
                const govTierStyle = getGovTierStyle(stock.tier);
                return (
                  <tr
                    key={stock.code}
                    style={{
                      background: idx % 2 === 0 ? '#09131f' : '#060d18',
                      borderBottom: '1px solid #132030',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#0d1e30')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#09131f' : '#060d18')}
                  >
                    {isColumnVisible('code') && (
                      <td style={{ padding: 12, whiteSpace: 'nowrap', fontFamily: "'DM Mono', monospace", fontWeight: 700, color: '#a8d8ea', fontSize: '0.875rem' }}>
                        {stock.code}
                      </td>
                    )}
                    {isColumnVisible('issuer') && (
                      <td style={{ padding: 12, fontSize: '0.875rem', color: '#e8f4f8' }}>
                        {stock.issuer}
                      </td>
                    )}
                    {isColumnVisible('sector') && (
                      <td style={{ padding: 12, fontSize: '0.875rem', color: '#a8c8e8' }}>
                        {stock.sector || '—'}
                      </td>
                    )}
                    {isColumnVisible('price') && (
                      <td style={{ padding: 12, textAlign: 'right', fontSize: '0.875rem', color: '#e8f4f8', fontWeight: 500 }}>
                        {formatPrice(stock.price)}
                      </td>
                    )}
                    {isColumnVisible('change') && (
                      <td style={{ padding: 12, textAlign: 'right', fontSize: '0.875rem', fontWeight: 500, color: stock.change && stock.change >= 0 ? '#2a9d8f' : '#e76f51' }}>
                        {stock.change ? (stock.change >= 0 ? '+' : '') + stock.change.toFixed(2) + '%' : '—'}
                      </td>
                    )}
                    {isColumnVisible('composite') && (
                      <td style={{ padding: 12, fontSize: '0.875rem', minWidth: 150 }}>
                        <ScoreBar value={stock.scores?.composite} />
                      </td>
                    )}
                    {isColumnVisible('aiTier') && (
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        {stock.aiTier ? (
                          <span
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderRadius: 4,
                              background: stock.aiTier.bg,
                              color: stock.aiTier.color,
                              border: `1px solid ${stock.aiTier.color}33`,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            T{stock.aiTier.level}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                    {isColumnVisible('govTier') && (
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: govTierStyle.bg,
                            color: govTierStyle.color,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: `1px solid ${govTierStyle.color}66`
                          }}
                          title={stock.tier}
                        >
                          {stock.tier[0]}
                        </span>
                      </td>
                    )}
                    {isColumnVisible('hhi') && (
                      <td style={{ padding: 12, textAlign: 'right', fontSize: '0.875rem', color: getHhiColor(stock.hhi), fontWeight: 500 }}>
                        {stock.hhi ? stock.hhi.toFixed(0) : '—'}
                      </td>
                    )}
                    {isColumnVisible('flags') && (
                      <td style={{ padding: 12, fontSize: '0.875rem' }}>
                        {stock.flags && stock.flags.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {stock.flags.map(flag => (
                              <FlagPill key={flag} flag={flag} />
                            ))}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                    {isColumnVisible('pe') && (
                      <td style={{ padding: 12, textAlign: 'right', fontSize: '0.875rem', color: '#e8f4f8' }}>
                        {stock.pe ? stock.pe.toFixed(1) : '—'}
                      </td>
                    )}
                    {isColumnVisible('roe') && (
                      <td style={{ padding: 12, textAlign: 'right', fontSize: '0.875rem', color: '#e8f4f8' }}>
                        {stock.roe ? stock.roe.toFixed(1) : '—'}
                      </td>
                    )}
                    {isColumnVisible('dividendYield') && (
                      <td style={{ padding: 12, textAlign: 'right', fontSize: '0.875rem', color: '#e8f4f8' }}>
                        {stock.dividendYield ? stock.dividendYield.toFixed(2) : '—'}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
