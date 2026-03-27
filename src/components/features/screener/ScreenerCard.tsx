"use client";

import type { EnrichedStock } from "@/types/unified";

interface ScreenerCardProps {
  stock: EnrichedStock;
  onClick: () => void;
}

export function ScreenerCard({ stock, onClick }: ScreenerCardProps) {
  const isPositive = (stock.change ?? 0) >= 0;

  // Tier badge colors
  const getTierColor = (tier: string) => {
    const tierLower = tier?.toLowerCase() || "";
    const colors: Record<string, string> = {
      green: "bg-primary/10 text-primary border-primary/20",
      amber: "bg-tertiary/10 text-tertiary border-tertiary/20",
      red: "bg-error/10 text-error border-error/20",
      "strong buy": "bg-primary/10 text-primary border-primary/20",
      buy: "bg-primary/10 text-primary border-primary/20",
      watch: "bg-tertiary/10 text-tertiary border-tertiary/20",
      neutral:
        "bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/20",
      avoid: "bg-error/10 text-error border-error/20",
    };
    return (
      colors[tierLower] ||
      "bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/20"
    );
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return "—";
    return price.toLocaleString("id-ID");
  };

  const formatPercent = (num: number | null | undefined): string => {
    if (num == null) return "—";
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(2)}%`;
  };

  const score = stock.scores?.composite ?? 0;
  const scoreColor =
    score >= 70 ? "bg-primary" : score >= 40 ? "bg-tertiary" : "bg-error";
  const scoreGlow =
    score >= 70
      ? "shadow-[0_0_8px_rgba(78,222,163,0.4)]"
      : score >= 40
        ? "shadow-[0_0_8px_rgba(255,185,95,0.4)]"
        : "shadow-[0_0_8px_rgba(255,180,171,0.3)]";

  return (
    <div
      className={`
        bg-surface-container 
        rounded-lg 
        p-4 
        cursor-pointer 
        transition-all 
        duration-200 
        hover:bg-surface-container-high
        border-l-4
        ${isPositive ? "border-primary" : "border-error"}
      `}
      onClick={onClick}
    >
      {/* Header: Ticker + Gov Tier */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="font-label text-lg font-bold text-on-surface mb-1">
            {stock.code}
          </div>
          <div className="font-body text-xs text-on-surface-variant line-clamp-2">
            {stock.issuer}
          </div>
        </div>

        {/* Governance Tier Badge */}
        <span
          className={`
          ${getTierColor(stock.tier)} 
          px-2 py-1 
          rounded-full 
          text-[10px] 
          font-label 
          font-bold 
          uppercase 
          tracking-wider 
          border 
          ml-2
          flex-shrink-0
        `}
        >
          {stock.tier}
        </span>
      </div>

      {/* Price + Change */}
      <div className="flex justify-between items-end mb-4 pb-4 border-b border-outline-variant/10">
        <div>
          <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Price
          </div>
          <div className="font-label text-xl font-semibold text-on-surface tabular-nums">
            {formatPrice(stock.price)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Change
          </div>
          <div
            className={`
            font-label 
            text-lg 
            font-bold 
            tabular-nums
            ${isPositive ? "text-primary" : "text-error"}
          `}
          >
            {formatPercent(stock.change)}
          </div>
        </div>
      </div>

      {/* AI Score Bar */}
      <div className="mb-3">
        <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
          AI Score
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full ${scoreColor} ${scoreGlow} transition-all duration-500`}
              style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
            />
          </div>
          <span className="font-label text-xs tabular-nums text-on-surface-variant min-w-[2rem] text-right">
            {score.toFixed(0)}
          </span>
        </div>
      </div>

      {/* AI Tier Badge */}
      {stock.aiTier && (
        <div className="mb-3">
          <span
            className={`
            ${getTierColor(stock.aiTier.label)}
            px-3 py-1.5
            rounded-full
            text-xs
            font-label
            font-semibold
            uppercase
            tracking-wider
            border
            inline-block
          `}
          >
            {stock.aiTier.label}
          </span>
        </div>
      )}
    </div>
  );
}
