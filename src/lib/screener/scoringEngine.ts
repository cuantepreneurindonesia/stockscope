// Stock scoring engine - converts stock metrics to 0-100 composite score

const WEIGHTS = {
  fundamental: 0.35,
  technical: 0.3,
  sentiment: 0.2,
  liquidity: 0.15,
};

interface LiquidityData {
  averageDailyValue?: number;
  freefloat?: number;
  foreignNetBuy?: number;
}

interface Tier {
  level: number;
  label: string;
  color: string;
  bg: string;
}

interface StockInput {
  fundamentalScore?: number;
  technicalScore?: number;
  sentimentScore?: number;
  liquidityData?: LiquidityData;
}

interface ScoreBreakdown {
  fundamental: number;
  technical: number;
  sentiment: number;
  liquidity: number;
}

interface ScoringResult {
  composite: number;
  tier: Tier;
  breakdown: ScoreBreakdown;
}

/**
 * Utility: calcLiquidityScore
 */
export function calcLiquidityScore(data: LiquidityData = {}): number {
  const { averageDailyValue = 0, freefloat = 0, foreignNetBuy = 0 } = data;
  let s = 40;

  if (averageDailyValue > 500_000_000_000) s += 30;
  else if (averageDailyValue > 100_000_000_000) s += 22;
  else if (averageDailyValue > 10_000_000_000) s += 12;
  else s -= 10;

  if (freefloat > 45) s += 20;
  else if (freefloat > 25) s += 12;
  else s -= 8;

  if (foreignNetBuy > 100_000_000) s += 10;
  else if (foreignNetBuy > 0) s += 5;
  else s -= 5;

  return Math.max(0, Math.min(100, s));
}

/**
 * Utility: getTier
 */
export function getTier(score: number): Tier {
  if (score >= 80)
    return {
      level: 1,
      label: "STRONG BUY",
      color: "#00C851",
      bg: "rgba(0,200,81,0.12)",
    };
  if (score >= 65)
    return {
      level: 2,
      label: "BUY",
      color: "#00AAFF",
      bg: "rgba(0,170,255,0.12)",
    };
  if (score >= 50)
    return {
      level: 3,
      label: "WATCH",
      color: "#FFAA00",
      bg: "rgba(255,170,0,0.12)",
    };
  if (score >= 35)
    return {
      level: 4,
      label: "NEUTRAL",
      color: "#888888",
      bg: "rgba(136,136,136,0.12)",
    };
  return {
    level: 5,
    label: "AVOID",
    color: "#FF4444",
    bg: "rgba(255,68,68,0.12)",
  };
}

/**
 * Utility: scoreStock
 */
export function scoreStock(stock: StockInput): ScoringResult {
  const {
    fundamentalScore = 50,
    technicalScore = 50,
    sentimentScore = 50,
    liquidityData,
  } = stock;

  const F = fundamentalScore;
  const T = technicalScore;
  const S = sentimentScore;
  const L = calcLiquidityScore(liquidityData || {});

  const composite = Math.round(
    F * WEIGHTS.fundamental +
      T * WEIGHTS.technical +
      S * WEIGHTS.sentiment +
      L * WEIGHTS.liquidity,
  );

  return {
    composite,
    tier: getTier(composite),
    breakdown: {
      fundamental: F,
      technical: T,
      sentiment: S,
      liquidity: L,
    },
  };
}

/**
 * Utility: batchScore
 */
export function batchScore<T extends StockInput>(
  stocks: T[],
): (T & { scoring: ScoringResult })[] {
  return stocks
    .map((s) => ({ ...s, scoring: scoreStock(s) }))
    .sort((a, b) => b.scoring.composite - a.scoring.composite);
}
