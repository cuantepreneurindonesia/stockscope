'use client';

import React, { useEffect } from 'react';
import type { EnrichedStock } from '@/lib/types/unified';
import { MicroBar } from './MicroBar';

interface StockDetailPanelProps {
  stock: EnrichedStock | null;
  onClose: () => void;
  isOpen: boolean;
}

export function StockDetailPanel({ stock, onClose, isOpen }: StockDetailPanelProps) {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!stock || !isOpen) return null;

  return (
    <>
      {/* Mobile: Overlay */}
      <div 
        className="md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Desktop: Fixed Right Panel */}
      <aside className="hidden md:flex flex-col fixed right-0 top-[88px] w-[400px] h-[calc(100vh-88px)]
                        bg-surface border-l border-outline-variant
                        overflow-y-auto z-50 animate-in slide-in-from-right duration-300">
        <PanelContent stock={stock} onClose={onClose} />
      </aside>

      {/* Mobile: Bottom Sheet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 max-h-[85vh]
                      bg-surface rounded-t-2xl overflow-y-auto z-50
                      animate-in slide-in-from-bottom duration-300 flex flex-col">
        <PanelContent stock={stock} onClose={onClose} />
      </div>
    </>
  );
}

function PanelContent({ stock, onClose }: { stock: EnrichedStock, onClose: () => void }) {
  // Format price helper
  const formatPrice = (price?: number) => {
    if (price === undefined) return '-';
    return price.toLocaleString('id-ID');
  };

  // Format percent helper
  const formatPercent = (val?: number) => {
    if (val === undefined) return '-';
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  const isPositive = (stock.change || 0) >= 0;

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="sticky top-0 p-6 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 z-10 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-label text-4xl font-medium tracking-tight text-on-surface">
              {stock.code}
            </h2>
            <p className="font-body text-sm text-on-surface-variant max-w-[280px] truncate mt-1">
              {stock.issuer}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-full hover:bg-white/5"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-label uppercase tracking-widest border
              ${stock.tier === 'Green' ? 'bg-primary/10 text-primary border-primary/20' : ''}
              ${stock.tier === 'Amber' ? 'bg-tertiary/10 text-tertiary border-tertiary/20' : ''}
              ${stock.tier === 'Red' ? 'bg-error/10 text-error border-error/20' : ''}
            `}>
              {stock.tier} Tier
            </span>
            {stock.aiTier && (
              <span className="px-2 py-0.5 rounded text-[10px] font-label uppercase tracking-widest border"
                style={{ 
                  backgroundColor: `${stock.aiTier.bg}20`, 
                  color: stock.aiTier.color,
                  borderColor: `${stock.aiTier.color}30`
                }}
              >
                {stock.aiTier.label}
              </span>
            )}
          </div>
          
          <div className="text-right">
            <div className="font-label text-xl text-on-surface">
              {formatPrice(stock.price || stock.lastPrice)}
            </div>
            <div className={`font-label text-sm ${isPositive ? 'text-primary' : 'text-error'}`}>
              {formatPercent(stock.change)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
        
        {/* Metrics Section */}
        <div className="flex flex-col gap-2">
          <h3 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 mb-2">Metrics</h3>
          <MicroBar 
            label="HHI (Herfindahl Index)"
            value={stock.hhi}
            max={10000}
            thresholds={{ type: 'lower-is-better', green: 1500, amber: 2500 }}
            statusLabels={{ green: 'Low concentration', amber: 'Moderate concentration', red: 'High concentration' }}
          />
          <MicroBar 
            label="Free Float"
            value={stock.floatPercentage}
            max={100}
            unit="%"
            thresholds={{ type: 'higher-is-better', green: 60, amber: 40 }}
            statusLabels={{ green: 'Good liquidity', amber: 'Moderate liquidity', red: 'Low liquidity' }}
          />
          <MicroBar 
            label="C1 (Top Holder)"
            value={stock.c1}
            max={100}
            unit="%"
            thresholds={{ type: 'lower-is-better', green: 30, amber: 50 }}
            statusLabels={{ green: 'Diversified', amber: 'Concentrated', red: 'Highly concentrated' }}
          />
          <MicroBar 
            label="C3 (Top 3 Holders)"
            value={stock.c3}
            max={100}
            unit="%"
            thresholds={{ type: 'lower-is-better', green: 50, amber: 75 }}
            statusLabels={{ green: 'Diversified', amber: 'Concentrated', red: 'Highly concentrated' }}
          />
        </div>

        {/* Top Holder Section */}
        {(stock.topHolder || stock.ownerType) && (
          <div>
            <h3 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 mb-3">Top Holder</h3>
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 flex justify-between items-center">
              <div>
                <p className="font-body text-xs text-on-surface-variant mb-1">{stock.ownerType || 'Unknown Type'}</p>
                <p className="font-body text-sm text-on-surface truncate max-w-[200px]">{stock.topHolder || 'Unknown Name'}</p>
              </div>
              <div className="font-label text-xl tracking-tight text-on-surface text-right">
                {stock.c1.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Governance Flags Section */}
        {stock.flags && stock.flags.length > 0 && (
          <div>
            <h3 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 mb-3">Governance Flags</h3>
            <div className="flex flex-col gap-2">
              {stock.flags.map(flag => (
                <div key={flag} className="flex items-center gap-3 bg-error/5 border border-error/10 p-3 rounded-lg">
                  <span className="text-sm">🚩</span>
                  <span className="font-body text-sm text-on-surface">{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
