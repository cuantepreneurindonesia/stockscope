/**
 * Unified enriched stock type combining governance and AI scoring data
 */
import type { Stock } from "./index";

export interface EnrichedStock extends Stock {
  // Price & market data (may be undefined if not available)
  price: number | undefined;
  change: number | undefined;
  volume: number | undefined;
  marketCap: number | undefined;
  pe: number | undefined;
  pb: number | undefined;
  roe: number | undefined;
  dividendYield: number | undefined;

  // Sector (from market data)
  sector: string | undefined;

  // AI scores (may be undefined if scoring engine hasn't run)
  scores:
    | {
        composite: number;
        fundamental: number;
        technical: number;
        sentiment: number;
        liquidity: number;
      }
    | undefined;

  // AI rating tier (distinct from governance tier Red/Amber/Green)
  aiTier:
    | {
        level: number; // 1–5
        label: string; // STRONG BUY, BUY, WATCH, NEUTRAL, AVOID
        color: string;
        bg: string;
      }
    | undefined;
}
