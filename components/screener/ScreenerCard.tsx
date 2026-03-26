'use client';

import { useState } from 'react';
import { FlagPill } from '@/components/ui';
import type { EnrichedStock } from '@/lib/types/unified';

interface ScreenerCardProps {
  stock: EnrichedStock;
}

export function ScreenerCard({ stock }: ScreenerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Map governance tier to RTI colors
  const getGovTierStyle = (tier: string) => {
    const tierColors: Record<string, { color: string; bg: string }> = {
      'Red': { color: '#E76F51', bg: 'rgba(231, 111, 81, 0.12)' },
      'Amber': { color: '#E9C46A', bg: 'rgba(233, 196, 106, 0.12)' },
      'Green': { color: '#2A9D8F', bg: 'rgba(42, 157, 143, 0.12)' }
    };
    return tierColors[tier] || { color: '#6b8aad', bg: 'rgba(107, 138, 173, 0.12)' };
  };

  const govTierStyle = getGovTierStyle(stock.tier);

  // Get score color
  const getScoreColor = (value: number | undefined) => {
    if (!value) return '#6b8aad';
    if (value >= 80) return '#2a9d8f';
    if (value >= 65) return '#457b9d';
    if (value >= 50) return '#e9c46a';
    return '#e76f51';
  };

  const scoreColor = getScoreColor(stock.scores?.composite);

  const formatPrice = (price: number | undefined) => {
    if (!price) return '—';
    return price.toLocaleString('id-ID');
  };

  return (
    <div
      style={{
        background: '#09131f',
        border: '1px solid #1e3a52',
        borderRadius: 8,
        padding: 16,
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        {/* Ticker and Issuer */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontFamily: "'DM Mono', monospace", 
            fontWeight: 700, 
            color: '#a8d8ea', 
            fontSize: '1.125rem',
            marginBottom: 4
          }}>
            {stock.code}
          </div>
          <div style={{ 
            fontSize: '0.875rem', 
            color: '#a8c8e8',
            lineHeight: 1.4
          }}>
            {stock.issuer}
          </div>
        </div>

        {/* Gov Tier Badge */}
        <div style={{ marginLeft: 12 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: govTierStyle.bg,
              color: govTierStyle.color,
              fontSize: '0.875rem',
              fontWeight: 700,
              border: `2px solid ${govTierStyle.color}66`
            }}
            title={stock.tier}
          >
            {stock.tier[0]}
          </span>
        </div>
      </div>

      {/* Price and Change Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottom: '1px solid #132030'
      }}>
        <div>
          <div style={{ 
            fontSize: '0.625rem', 
            fontFamily: "'DM Mono', monospace",
            color: '#6b8aad', 
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 4
          }}>
            Price
          </div>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: 600, 
            color: '#e8f4f8'
          }}>
            {formatPrice(stock.price)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: '0.625rem', 
            fontFamily: "'DM Mono', monospace",
            color: '#6b8aad', 
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 4
          }}>
            Change
          </div>
          <div style={{ 
            fontSize: '1.125rem', 
            fontWeight: 700,
            color: stock.change && stock.change >= 0 ? '#2a9d8f' : '#e76f51'
          }}>
            {stock.change ? (stock.change >= 0 ? '+' : '') + stock.change.toFixed(2) + '%' : '—'}
          </div>
        </div>
      </div>

      {/* AI Score and Tier Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: isExpanded ? 12 : 0 }}>
        {/* AI Score */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '0.625rem', 
            fontFamily: "'DM Mono', monospace",
            color: '#6b8aad', 
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 6
          }}>
            AI Score
          </div>
          <div style={{
            height: 24,
            background: 'rgba(69, 123, 157, 0.08)',
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid #1e3a52',
            position: 'relative'
          }}>
            <div
              style={{
                height: '100%',
                width: `${stock.scores?.composite || 0}%`,
                background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}dd)`,
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 0 8px ${scoreColor}44`
              }}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              right: 8,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.75rem',
              fontFamily: "'DM Mono', monospace",
              fontWeight: 700,
              color: scoreColor
            }}>
              {stock.scores?.composite || '—'}
            </div>
          </div>
        </div>

        {/* AI Tier */}
        <div>
          <div style={{ 
            fontSize: '0.625rem', 
            fontFamily: "'DM Mono', monospace",
            color: '#6b8aad', 
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 6
          }}>
            Tier
          </div>
          {stock.aiTier ? (
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 4,
                background: stock.aiTier.bg,
                color: stock.aiTier.color,
                border: `1px solid ${stock.aiTier.color}44`,
                whiteSpace: 'nowrap'
              }}
            >
              T{stock.aiTier.level}
            </span>
          ) : (
            <span style={{ color: '#6b8aad' }}>—</span>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{
          paddingTop: 12,
          borderTop: '1px solid #132030',
          animation: 'fadeIn 0.2s ease-in'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            {/* Sector */}
            {stock.sector && (
              <div>
                <div style={{ 
                  fontSize: '0.625rem', 
                  fontFamily: "'DM Mono', monospace",
                  color: '#6b8aad', 
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4
                }}>
                  Sector
                </div>
                <div style={{ fontSize: '0.875rem', color: '#e8f4f8' }}>
                  {stock.sector}
                </div>
              </div>
            )}

            {/* HHI */}
            {stock.hhi && (
              <div>
                <div style={{ 
                  fontSize: '0.625rem', 
                  fontFamily: "'DM Mono', monospace",
                  color: '#6b8aad', 
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4
                }}>
                  HHI
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  color: stock.hhi < 1500 ? '#2a9d8f' : stock.hhi <= 2500 ? '#e9c46a' : '#e76f51'
                }}>
                  {stock.hhi.toFixed(0)}
                </div>
              </div>
            )}

            {/* P/E */}
            {stock.pe && (
              <div>
                <div style={{ 
                  fontSize: '0.625rem', 
                  fontFamily: "'DM Mono', monospace",
                  color: '#6b8aad', 
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4
                }}>
                  P/E
                </div>
                <div style={{ fontSize: '0.875rem', color: '#e8f4f8' }}>
                  {stock.pe.toFixed(1)}
                </div>
              </div>
            )}

            {/* ROE */}
            {stock.roe && (
              <div>
                <div style={{ 
                  fontSize: '0.625rem', 
                  fontFamily: "'DM Mono', monospace",
                  color: '#6b8aad', 
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4
                }}>
                  ROE %
                </div>
                <div style={{ fontSize: '0.875rem', color: '#e8f4f8' }}>
                  {stock.roe.toFixed(1)}
                </div>
              </div>
            )}

            {/* Dividend Yield */}
            {stock.dividendYield && (
              <div>
                <div style={{ 
                  fontSize: '0.625rem', 
                  fontFamily: "'DM Mono', monospace",
                  color: '#6b8aad', 
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4
                }}>
                  Div Yield %
                </div>
                <div style={{ fontSize: '0.875rem', color: '#e8f4f8' }}>
                  {stock.dividendYield.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Flags */}
          {stock.flags && stock.flags.length > 0 && (
            <div>
              <div style={{ 
                fontSize: '0.625rem', 
                fontFamily: "'DM Mono', monospace",
                color: '#6b8aad', 
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 6
              }}>
                Flags
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {stock.flags.map(flag => (
                  <FlagPill key={flag} flag={flag} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expand/Collapse Indicator */}
      <div style={{
        marginTop: 8,
        textAlign: 'center',
        fontSize: '0.75rem',
        color: '#6b8aad',
        fontFamily: "'DM Mono', monospace"
      }}>
        {isExpanded ? '▲ Tap to collapse' : '▼ Tap for details'}
      </div>
    </div>
  );
}
