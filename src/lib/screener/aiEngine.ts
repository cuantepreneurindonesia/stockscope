import Anthropic from "@anthropic-ai/sdk";

interface FundamentalAnalysis {
  score: number;
  rating: string;
  thesis: string;
  strengths: string[];
  risks: string[];
  peAssessment: string;
  growthTrend: string;
  catalysts: string[];
  sectorNote: string;
  raw?: string;
}

interface SentimentAnalysis {
  score: number;
  sentiment: string;
  keyThemes: string[];
  highlight: string;
  trend: string;
  raw?: string;
}

interface ReportNarrative {
  headline: string;
  executiveSummary: string;
  investmentThesis: string;
  businessOverview: string;
  financialAnalysis: string;
  valuationAnalysis: string;
  keyRisks: string;
  conclusion: string;
  rating: string;
  targetPrice: number;
  valuationMethod: string;
  raw?: string;
}

interface MarketAnalysis {
  outlook: string;
  jciTarget12m: number;
  topSectors: string[];
  avoidSectors: string[];
  commentary: string;
  keyWatchPoints: string[];
  raw?: string;
}

interface NewsItem {
  title: string;
}

interface Financials {
  revenue?: number[];
  netIncome?: number[];
  roe?: number[];
  pe?: number[];
  pb?: number[];
}

interface StockData {
  ticker: string;
  name: string;
  sector: string;
  financials?: Financials;
}

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set in environment variables");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function callClaude<T>(prompt: string, maxTokens = 1200): Promise<T> {
  const client = getClient();
  const resp = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.content.map((b) => ("text" in b ? b.text : "")).join("");

  try {
    return JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim());
  } catch {
    return { raw: text } as T;
  }
}

export async function analyzeFundamentals(
  ticker: string,
  name: string,
  sector: string,
  financials: Financials,
): Promise<FundamentalAnalysis> {
  const prompt = `You are a CSA analyst for IDX Indonesia. Analyze ${name} (${ticker}), Sector: ${sector}.
5Y Revenue: ${JSON.stringify(financials.revenue)}, Net Income: ${JSON.stringify(financials.netIncome)}, ROE: ${JSON.stringify(financials.roe)}, PE: ${JSON.stringify(financials.pe)}, PBV: ${JSON.stringify(financials.pb)}.
Return ONLY valid JSON: {"score":<0-100>,"rating":"<Strong Buy|Buy|Hold|Sell>","thesis":"<2-3 sentences>","strengths":["s1","s2","s3"],"risks":["r1","r2"],"peAssessment":"<Undervalued|Fair Value|Overvalued>","growthTrend":"<Accelerating|Stable|Decelerating>","catalysts":["c1","c2"],"sectorNote":"<Indonesia context>"}`;

  return callClaude<FundamentalAnalysis>(prompt);
}

export async function analyzeSentiment(
  ticker: string,
  newsItems?: NewsItem[],
): Promise<SentimentAnalysis> {
  const news = (newsItems || [])
    .slice(0, 6)
    .map((n, i) => `[${i + 1}] ${n.title}`)
    .join("\n");

  const prompt = `Analyze IDX market sentiment for ${ticker}. News:\n${news}\nReturn ONLY valid JSON: {"score":<0-100>,"sentiment":"<Very Positive|Positive|Neutral|Negative|Very Negative>","keyThemes":["t1","t2"],"highlight":"<key news>","trend":"<Improving|Stable|Deteriorating>"}`;

  return callClaude<SentimentAnalysis>(prompt, 600);
}

export async function generateReportNarrative(
  stockData: StockData,
): Promise<ReportNarrative> {
  const { ticker, name, sector, financials } = stockData;

  const prompt = `You are a senior equity analyst at KB Valbury Sekuritas Indonesia. Write research report for ${name} (${ticker}), Sector: ${sector}.
Revenue 5Y: ${JSON.stringify(financials?.revenue || [])}. NetIncome 5Y: ${JSON.stringify(financials?.netIncome || [])}. ROE: ${JSON.stringify(financials?.roe || [])}.
Return ONLY valid JSON: {"headline":"<punchy headline>","executiveSummary":"<200w>","investmentThesis":"<150w>","businessOverview":"<120w>","financialAnalysis":"<180w with specific numbers>","valuationAnalysis":"<120w>","keyRisks":"<100w>","conclusion":"<80w>","rating":"<Strong Buy|Buy|Hold|Sell>","targetPrice":<IDR number>,"valuationMethod":"<method>"}`;

  return callClaude<ReportNarrative>(prompt, 2500);
}

export async function analyzeMarket(
  marketData: Record<string, unknown>,
): Promise<MarketAnalysis> {
  const prompt = `IDX market strategist. Data: ${JSON.stringify(marketData)}. Return ONLY valid JSON: {"outlook":"<Bullish|Cautiously Bullish|Neutral|Cautiously Bearish|Bearish>","jciTarget12m":<number>,"topSectors":["s1","s2"],"avoidSectors":["s1"],"commentary":"<150w>","keyWatchPoints":["w1","w2","w3"]}`;

  return callClaude<MarketAnalysis>(prompt, 800);
}
