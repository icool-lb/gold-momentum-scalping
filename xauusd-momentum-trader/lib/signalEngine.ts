import { MarketPayload, Signal } from "./types";
import { atr, avgVolume, ema, recentHigh, recentLow, rsi, vwap } from "./indicators";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function analyzeMarket(data: MarketPayload): Signal {
  const m5 = data.m5;
  const m15 = data.m15;
  const h1 = data.h1;
  const last = m5[m5.length - 1];
  const price = last?.close ?? 0;

  const h1Close = h1.map(c => c.close);
  const m15Close = m15.map(c => c.close);
  const m5Close = m5.map(c => c.close);

  const h1Ema20 = ema(h1Close, 20);
  const h1Ema50 = ema(h1Close, 50);
  const m15Ema20 = ema(m15Close, 20);
  const m15Ema50 = ema(m15Close, 50);
  const m5Ema20 = ema(m5Close, 20);
  const m5Ema50 = ema(m5Close, 50);
  const m5Rsi = rsi(m5Close, 14);
  const m5Vwap = vwap(m5);
  const m5Atr = atr(m5, 14);
  const volNow = last?.volume ?? 0;
  const volAvg = avgVolume(m5, 20);
  const hi = recentHigh(m15, 28);
  const lo = recentLow(m15, 28);

  const bullishTrend = h1Ema20 > h1Ema50 && m15Ema20 > m15Ema50 && price > m5Ema20;
  const bearishTrend = h1Ema20 < h1Ema50 && m15Ema20 < m15Ema50 && price < m5Ema20;

  const bullishBreak = price >= hi - Math.max(m5Atr * 0.25, 0.6);
  const bearishBreak = price <= lo + Math.max(m5Atr * 0.25, 0.6);

  const candleBody = Math.abs(last.close - last.open);
  const candleRange = Math.max(last.high - last.low, 0.01);
  const strongCandle = candleBody / candleRange > 0.58 && candleRange >= Math.max(m5Atr * 0.8, 1.1);
  const volumeStrong = volNow >= volAvg * 1.25;
  const aboveVwap = price > m5Vwap;
  const belowVwap = price < m5Vwap;

  let side: Signal["side"] = "NO_TRADE";
  if (bullishTrend && bullishBreak && aboveVwap) side = "BUY";
  if (bearishTrend && bearishBreak && belowVwap) side = "SELL";

  const breakdown: Record<string, number> = {};
  breakdown["الاتجاه العام"] =
    side === "BUY" ? (bullishTrend ? 20 : 7) :
    side === "SELL" ? (bearishTrend ? 20 : 7) : 5;

  breakdown["الدعم والمقاومة"] =
    side === "BUY" ? (bullishBreak ? 15 : 3) :
    side === "SELL" ? (bearishBreak ? 15 : 3) : 3;

  breakdown["الزخم"] = strongCandle ? 15 : candleRange >= m5Atr * 0.6 ? 8 : 2;
  breakdown["السيولة والحجم"] = volumeStrong ? 10 : volNow >= volAvg ? 6 : 2;
  breakdown["إعادة الاختبار"] = 5; // upgraded later with true retest logic
  breakdown["RSI / EMA / VWAP"] =
    side === "BUY" ? ((m5Rsi > 52 && m5Rsi < 78 && m5Ema20 > m5Ema50 && aboveVwap) ? 10 : 4) :
    side === "SELL" ? ((m5Rsi < 48 && m5Rsi > 22 && m5Ema20 < m5Ema50 && belowVwap) ? 10 : 4) : 3;

  breakdown["الأخبار الخطيرة"] =
    data.newsRisk === "HIGH" ? -20 : data.newsRisk === "MEDIUM" ? 3 : 10;

  breakdown["التوقيت"] = 4;
  breakdown["الهدف إلى الستوب"] = 5;

  if (data.dxyBias === "WEAK" && side === "BUY") breakdown["عامل الدولار"] = 5;
  else if (data.dxyBias === "STRONG" && side === "SELL") breakdown["عامل الدولار"] = 5;
  else if (data.dxyBias === "NEUTRAL") breakdown["عامل الدولار"] = 2;
  else breakdown["عامل الدولار"] = -3;

  let score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score < 60 || data.newsRisk === "HIGH") side = "NO_TRADE";

  const slDistance = 5;
  const entry = round2(price);
  const sl = side === "BUY" ? round2(entry - slDistance) : side === "SELL" ? round2(entry + slDistance) : entry;
  const tp1 = side === "BUY" ? round2(entry + 7) : side === "SELL" ? round2(entry - 7) : entry;
  const tp2 = side === "BUY" ? round2(entry + 10) : side === "SELL" ? round2(entry - 10) : entry;
  const tp3 = side === "BUY" ? round2(entry + 15) : side === "SELL" ? round2(entry - 15) : entry;

  const reasons: string[] = [];
  if (bullishTrend) reasons.push("اتجاه صاعد على 1H و15m");
  if (bearishTrend) reasons.push("اتجاه هابط على 1H و15m");
  if (bullishBreak) reasons.push("السعر قريب من كسر مقاومة مهمة");
  if (bearishBreak) reasons.push("السعر قريب من كسر دعم مهم");
  if (strongCandle) reasons.push("شمعة زخم قوية مقارنة بالـ ATR");
  if (volumeStrong) reasons.push("الحجم أعلى من متوسط آخر 20 شمعة");
  if (data.newsRisk === "HIGH") reasons.push("فلتر الأخبار يمنع التداول الآن");
  if (!reasons.length) reasons.push("لا توجد شروط كافية لصفقة Momentum");

  const decision =
    side === "NO_TRADE" ? "NO TRADE - لا توجد أفضلية كافية أو هناك خطر أخبار" :
    score >= 85 ? "صفقة قوية - دخول فقط مع احترام الستوب" :
    score >= 75 ? "صفقة جيدة - حجم متوسط" :
    "صفقة حذرة";

  return {
    id: `${Date.now()}`,
    symbol: data.symbol,
    side,
    score,
    entry,
    sl,
    tp1,
    tp2,
    tp3,
    risk: score >= 85 ? "MEDIUM" : "HIGH",
    decision,
    reasons,
    breakdown,
    createdAt: new Date().toISOString()
  };
}