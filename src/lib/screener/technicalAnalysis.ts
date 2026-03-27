/**
 * TECHNICAL ANALYSIS SERVICE
 * Calculates RSI, MACD, Bollinger Bands, Moving Averages
 * Pattern detection and technical scoring
 */

interface PriceData {
  close: number;
  volume: number;
}

interface Signal {
  indicator: string;
  signal: string;
  value?: string;
  positive: boolean | null;
}

interface VolumeAnalysis {
  averageVolume: number;
  currentVolume: number;
  volumeRatio: number;
  isBreakout: boolean;
  isAboveAverage: boolean;
  signal: string;
}

interface SupportResistance {
  support: string;
  resistance: string;
  current: number;
  positionInRange: string;
  nearSupport: boolean;
  nearResistance: boolean;
}

interface TechnicalScore {
  score: number;
  currentRSI: string;
  macdHistogram: string;
  ma20: string;
  ma50: string;
  bollingerUpper: string;
  bollingerLower: string;
  volumeAnalysis: VolumeAnalysis;
  supportResistance: SupportResistance;
  signals: Signal[];
  summary: string;
}

// ─── Moving Average ────────────────────────────────────────────────────────────
export function sma(prices: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return result;
}

/**
 * Utility: ema
 */
export function ema(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    result.push(prices[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

// ─── RSI ───────────────────────────────────────────────────────────────────────
export function rsi(prices: number[], period = 14): number[] {
  const changes = prices.slice(1).map((p, i) => p - prices[i]);
  const gains = changes.map((c) => Math.max(c, 0));
  const losses = changes.map((c) => Math.max(-c, 0));

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

  const rsiValues: number[] = [];
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiValues.push(100 - 100 / (1 + rs));
  }
  return rsiValues;
}

// ─── MACD ──────────────────────────────────────────────────────────────────────
export function macd(prices: number[], fast = 12, slow = 26, signal = 9) {
  const emaFast = ema(prices, fast);
  const emaSlow = ema(prices, slow);
  const macdLine = emaFast.slice(slow - fast).map((v, i) => v - emaSlow[i]);
  const signalLine = ema(macdLine, signal);
  const histogram = macdLine.slice(signal - 1).map((v, i) => v - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

// ─── Bollinger Bands ───────────────────────────────────────────────────────────
export function bollingerBands(prices: number[], period = 20, stdDev = 2) {
  const middle = sma(prices, period);
  const bands = middle.map((avg, i) => {
    const slice = prices.slice(i, i + period);
    const variance =
      slice.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / period;
    const std = Math.sqrt(variance);
    return {
      upper: avg + stdDev * std,
      middle: avg,
      lower: avg - stdDev * std,
    };
  });
  return bands;
}

// ─── Volume Analysis ───────────────────────────────────────────────────────────
export function volumeAnalysis(volumes: number[], period = 20): VolumeAnalysis {
  const avgVol = volumes.slice(-period).reduce((a, b) => a + b) / period;
  const currentVol = volumes[volumes.length - 1];
  const ratio = currentVol / avgVol;
  return {
    averageVolume: avgVol,
    currentVolume: currentVol,
    volumeRatio: ratio,
    isBreakout: ratio > 2.0,
    isAboveAverage: ratio > 1.2,
    signal:
      ratio > 2.0
        ? "Volume Breakout"
        : ratio > 1.2
          ? "Above Average"
          : "Normal",
  };
}

// ─── Support & Resistance ──────────────────────────────────────────────────────
export function findSupportResistance(
  prices: number[],
  lookback = 20,
): SupportResistance {
  const recent = prices.slice(-lookback);
  const support = Math.min(...recent);
  const resistance = Math.max(...recent);
  const current = prices[prices.length - 1];
  const range = resistance - support;

  return {
    support: support.toFixed(0),
    resistance: resistance.toFixed(0),
    current,
    positionInRange: (((current - support) / range) * 100).toFixed(1) + "%",
    nearSupport: current <= support * 1.05,
    nearResistance: current >= resistance * 0.95,
  };
}

// ─── Composite Technical Score ─────────────────────────────────────────────────
export function calculateTechnicalScore(
  priceData: PriceData[],
): TechnicalScore {
  const closes = priceData.map((d) => d.close);
  const volumes = priceData.map((d) => d.volume);

  if (closes.length < 50) {
    return {
      score: 50,
      currentRSI: "50.0",
      macdHistogram: "0.0000",
      ma20: "0",
      ma50: "0",
      bollingerUpper: "0",
      bollingerLower: "0",
      volumeAnalysis: {
        averageVolume: 0,
        currentVolume: 0,
        volumeRatio: 0,
        isBreakout: false,
        isAboveAverage: false,
        signal: "Insufficient Data",
      },
      supportResistance: {
        support: "0",
        resistance: "0",
        current: 0,
        positionInRange: "0%",
        nearSupport: false,
        nearResistance: false,
      },
      signals: [],
      summary: "Insufficient Data",
    };
  }

  const currentPrice = closes[closes.length - 1];
  const rsiValues = rsi(closes);
  const currentRSI = rsiValues[rsiValues.length - 1];
  const macdData = macd(closes);
  const currentHistogram = macdData.histogram[macdData.histogram.length - 1];
  const prevHistogram = macdData.histogram[macdData.histogram.length - 2];
  const bbands = bollingerBands(closes);
  const currentBB = bbands[bbands.length - 1];
  const ma20 = sma(closes, 20);
  const ma50 = sma(closes, 50);
  const ma200 = closes.length >= 200 ? sma(closes, 200) : null;
  const volAnalysis = volumeAnalysis(volumes);
  const sr = findSupportResistance(closes);

  let score = 50;
  const signals: Signal[] = [];

  // RSI scoring (0-20 points)
  if (currentRSI < 30) {
    score += 20;
    signals.push({
      indicator: "RSI",
      signal: "Oversold - Buy Signal",
      value: currentRSI.toFixed(1),
      positive: true,
    });
  } else if (currentRSI < 50) {
    score += 10;
    signals.push({
      indicator: "RSI",
      signal: "Neutral-Bearish Zone",
      value: currentRSI.toFixed(1),
      positive: true,
    });
  } else if (currentRSI > 70) {
    score -= 15;
    signals.push({
      indicator: "RSI",
      signal: "Overbought - Caution",
      value: currentRSI.toFixed(1),
      positive: false,
    });
  } else {
    signals.push({
      indicator: "RSI",
      signal: "Neutral",
      value: currentRSI.toFixed(1),
      positive: null,
    });
  }

  // MACD scoring (0-15 points)
  if (currentHistogram > 0 && prevHistogram < 0) {
    score += 15;
    signals.push({
      indicator: "MACD",
      signal: "Bullish Crossover",
      positive: true,
    });
  } else if (currentHistogram > 0 && currentHistogram > prevHistogram) {
    score += 10;
    signals.push({
      indicator: "MACD",
      signal: "Bullish Momentum",
      positive: true,
    });
  } else if (currentHistogram < 0 && currentHistogram < prevHistogram) {
    score -= 10;
    signals.push({
      indicator: "MACD",
      signal: "Bearish Momentum",
      positive: false,
    });
  }

  // MA positioning (0-20 points)
  const ma20Current = ma20[ma20.length - 1];
  const ma50Current = ma50[ma50.length - 1];
  if (currentPrice > ma20Current) {
    score += 7;
    signals.push({
      indicator: "MA20",
      signal: "Price Above MA20",
      positive: true,
    });
  }
  if (currentPrice > ma50Current) {
    score += 8;
    signals.push({
      indicator: "MA50",
      signal: "Price Above MA50",
      positive: true,
    });
  }
  if (ma200) {
    const ma200Current = ma200[ma200.length - 1];
    if (currentPrice > ma200Current) {
      score += 5;
      signals.push({
        indicator: "MA200",
        signal: "Price Above MA200 (Uptrend)",
        positive: true,
      });
    } else {
      score -= 5;
      signals.push({
        indicator: "MA200",
        signal: "Price Below MA200 (Downtrend)",
        positive: false,
      });
    }
  }

  // Bollinger Band position (0-10 points)
  if (currentPrice <= currentBB.lower * 1.02) {
    score += 10;
    signals.push({
      indicator: "Bollinger",
      signal: "Near Lower Band - Potential Reversal",
      positive: true,
    });
  } else if (currentPrice >= currentBB.upper * 0.98) {
    score -= 5;
    signals.push({
      indicator: "Bollinger",
      signal: "Near Upper Band - Extended",
      positive: false,
    });
  }

  // Volume (0-10 points)
  if (volAnalysis.isBreakout) {
    score += 10;
    signals.push({
      indicator: "Volume",
      signal: "Volume Breakout",
      positive: true,
    });
  } else if (volAnalysis.isAboveAverage) {
    score += 5;
    signals.push({
      indicator: "Volume",
      signal: "Above Average Volume",
      positive: true,
    });
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score: Math.round(score),
    currentRSI: currentRSI.toFixed(1),
    macdHistogram: currentHistogram.toFixed(4),
    ma20: ma20Current.toFixed(0),
    ma50: ma50Current.toFixed(0),
    bollingerUpper: currentBB.upper.toFixed(0),
    bollingerLower: currentBB.lower.toFixed(0),
    volumeAnalysis: volAnalysis,
    supportResistance: sr,
    signals,
    summary:
      score >= 70
        ? "Bullish Setup"
        : score >= 50
          ? "Neutral Setup"
          : "Bearish Setup",
  };
}
