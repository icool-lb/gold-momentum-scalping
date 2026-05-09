export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type MarketPayload = {
  symbol: string;
  m1: Candle[];
  m3: Candle[];
  m5: Candle[];
  m15: Candle[];
  h1: Candle[];
  dxyBias?: "WEAK" | "STRONG" | "NEUTRAL";
  newsRisk?: "LOW" | "MEDIUM" | "HIGH";
};

export type Signal = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL" | "NO_TRADE";
  score: number;
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  decision: string;
  reasons: string[];
  breakdown: Record<string, number>;
  createdAt: string;
};