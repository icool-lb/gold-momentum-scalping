import { Candle, MarketPayload } from "./types";

function makeCandles(start: number, trend: number, count: number): Candle[] {
  const candles: Candle[] = [];
  let price = start;
  for (let i = 0; i < count; i++) {
    const noise = (Math.random() - 0.45) * 1.2;
    const open = price;
    const close = price + trend + noise;
    const high = Math.max(open, close) + Math.random() * 0.9;
    const low = Math.min(open, close) - Math.random() * 0.9;
    price = close;
    candles.push({
      time: Date.now() - (count - i) * 60_000,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round(100 + Math.random() * 220 + (i > count - 5 ? 180 : 0))
    });
  }
  return candles;
}

export function getMockMarket(): MarketPayload {
  const base = 2350 + Math.random() * 20;
  const bias = Math.random() > 0.48 ? 0.22 : -0.22;
  return {
    symbol: "XAUUSD",
    m1: makeCandles(base, bias / 3, 80),
    m3: makeCandles(base, bias / 2, 80),
    m5: makeCandles(base, bias, 80),
    m15: makeCandles(base - 8, bias * 1.4, 80),
    h1: makeCandles(base - 20, bias * 2.1, 80),
    dxyBias: bias > 0 ? "WEAK" : "STRONG",
    newsRisk: Math.random() > 0.88 ? "HIGH" : Math.random() > 0.7 ? "MEDIUM" : "LOW"
  };
}