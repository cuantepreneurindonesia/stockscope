/**
 * Stock enrichment service
 * Merges governance data (MongoDB) with market/AI scoring data
 */
import { batchScore } from "@/lib/screener/scoringEngine";

import type { Stock } from "@/types";
import type { EnrichedStock } from "@/types/unified";

interface MarketData {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  fundamentalScore: number;
  technicalScore: number;
  sentimentScore: number;
  pe: number;
  pb: number;
  roe: number;
  dividendYield: number;
  eps: number;
  liquidityData: {
    averageDailyValue: number;
    freefloat: number;
    foreignNetBuy: number;
  };
}

// Market data map - keyed by stock code
// In production, this would come from an external price API
const MARKET_DATA: Record<string, MarketData> = {
  BBCA: {
    ticker: "BBCA",
    name: "Bank Central Asia Tbk",
    sector: "Finance",
    price: 9425,
    change: 1.2,
    volume: 42500000,
    marketCap: 1050000,
    fundamentalScore: 88,
    technicalScore: 72,
    sentimentScore: 80,
    pe: 28.5,
    pb: 4.2,
    roe: 15.8,
    dividendYield: 1.8,
    eps: 330.7,
    liquidityData: {
      averageDailyValue: 500_000_000_000,
      freefloat: 45,
      foreignNetBuy: 150000000,
    },
  },
  BBRI: {
    ticker: "BBRI",
    name: "Bank Rakyat Indonesia Tbk",
    sector: "Finance",
    price: 4590,
    change: -0.4,
    volume: 89000000,
    marketCap: 750000,
    fundamentalScore: 82,
    technicalScore: 68,
    sentimentScore: 75,
    pe: 12.1,
    pb: 2.1,
    roe: 17.2,
    dividendYield: 4.2,
    eps: 379.3,
    liquidityData: {
      averageDailyValue: 350_000_000_000,
      freefloat: 46.81,
      foreignNetBuy: 80000000,
    },
  },
  BMRI: {
    ticker: "BMRI",
    name: "Bank Mandiri Tbk",
    sector: "Finance",
    price: 6150,
    change: 0.8,
    volume: 45000000,
    marketCap: 600000,
    fundamentalScore: 80,
    technicalScore: 70,
    sentimentScore: 72,
    pe: 10.5,
    pb: 1.8,
    roe: 16.5,
    dividendYield: 5.1,
    eps: 585.7,
    liquidityData: {
      averageDailyValue: 280_000_000_000,
      freefloat: 40,
      foreignNetBuy: 50000000,
    },
  },
  TLKM: {
    ticker: "TLKM",
    name: "Telkom Indonesia Tbk",
    sector: "Infrastructure",
    price: 3370,
    change: 1.5,
    volume: 52000000,
    marketCap: 330000,
    fundamentalScore: 75,
    technicalScore: 65,
    sentimentScore: 70,
    pe: 15.2,
    pb: 2.3,
    roe: 15.1,
    dividendYield: 3.8,
    eps: 221.7,
    liquidityData: {
      averageDailyValue: 150_000_000_000,
      freefloat: 47.97,
      foreignNetBuy: 20000000,
    },
  },
  ASII: {
    ticker: "ASII",
    name: "Astra International Tbk",
    sector: "Miscellaneous Industry",
    price: 4810,
    change: -0.3,
    volume: 28000000,
    marketCap: 190000,
    fundamentalScore: 78,
    technicalScore: 62,
    sentimentScore: 68,
    pe: 9.8,
    pb: 1.5,
    roe: 15.3,
    dividendYield: 4.5,
    eps: 490.8,
    liquidityData: {
      averageDailyValue: 120_000_000_000,
      freefloat: 49.5,
      foreignNetBuy: 15000000,
    },
  },
};

/**
 * Generate realistic mock market data for stocks without explicit data
 * Uses stock code to seed pseudo-random but consistent values
 */
function generateMockMarketData(stock: Stock): MarketData {
  // Use stock code to generate consistent pseudo-random values
  const codeHash = stock.code
    .split("")
    .reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);

  // Generate deterministic values based on code
  const price = 2000 + (codeHash % 8000);
  const change = ((codeHash % 100) - 50) / 50;
  const volume = 5000000 + (codeHash % 50000000);
  const pe = 10 + (codeHash % 30);
  const roe = 8 + (codeHash % 20);
  const dividendYield = 1 + (codeHash % 6);
  const fundamentalScore = 50 + (codeHash % 40);
  const technicalScore = 45 + (codeHash % 50);
  const sentimentScore = 50 + (codeHash % 40);

  return {
    ticker: stock.code,
    name: stock.issuer,
    sector:
      stock.hierarchyLevel === "High"
        ? "Finance"
        : stock.hierarchyLevel === "Moderate"
          ? "Infrastructure"
          : "Miscellaneous Industry",
    price,
    change,
    volume,
    marketCap: (price * volume) / 1000000,
    fundamentalScore,
    technicalScore,
    sentimentScore,
    pe,
    pb: 1 + (codeHash % 4),
    roe,
    dividendYield,
    eps: price / pe,
    liquidityData: {
      averageDailyValue: price * volume,
      freefloat: 40 + (codeHash % 50),
      foreignNetBuy: volume * (change > 0 ? 0.3 : 0.1),
    },
  };
}

/**
 * Enrich a single stock with market data and AI scores
 */
export function enrichStock(stock: Stock): EnrichedStock {
  let marketData = MARKET_DATA[stock.code];

  // If no explicit market data, generate mock data for this stock
  if (!marketData) {
    marketData = generateMockMarketData(stock);
  }

  // Score the stock
  const scored = batchScore([marketData])[0];
  const aiTier = scored.scoring.tier;

  return {
    ...stock,
    price: marketData.price,
    change: marketData.change,
    volume: marketData.volume,
    marketCap: marketData.marketCap,
    pe: marketData.pe,
    pb: marketData.pb,
    roe: marketData.roe,
    dividendYield: marketData.dividendYield,
    sector: marketData.sector,
    scores: {
      composite: scored.scoring.composite,
      fundamental: scored.scoring.breakdown.fundamental,
      technical: scored.scoring.breakdown.technical,
      sentiment: scored.scoring.breakdown.sentiment,
      liquidity: scored.scoring.breakdown.liquidity,
    },
    aiTier: {
      level: aiTier.level,
      label: aiTier.label,
      color: aiTier.color,
      bg: aiTier.bg,
    },
  };
}

/**
 * Enrich multiple stocks
 */
export function enrichStocks(stocks: Stock[]): EnrichedStock[] {
  return stocks.map(enrichStock);
}
