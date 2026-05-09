import { Candle } from "./types";

export function sma(values: number[], period: number): number {
  if (values.length < period) return values[values.length - 1] ?? 0;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function ema(values: number[], period: number): number {
  if (!values.length) return 0;
  const k = 2 / (period + 1);
  let result = values[0];
  for (let i = 1; i < values.length; i++) {
    result = values[i] * k + result * (1 - k);
  }
  return result;
}

export function rsi(values: number[], period = 14): number {
  if (values.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  const start = values.length - period;
  for (let i = start; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

export function atr(candles: Candle[], period = 14): number {
  if (candles.length < period + 1) return 0;
  const trs: number[] = [];
  for (let i = candles.length - period; i < candles.length; i++) {
    const c = candles[i];
    const p = candles[i - 1];
    trs.push(Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close)));
  }
  return trs.reduce((a, b) => a + b, 0) / trs.length;
}

export function vwap(candles: Candle[]): number {
  let pv = 0;
  let vol = 0;
  for (const c of candles) {
    const typical = (c.high + c.low + c.close) / 3;
    pv += typical * Math.max(c.volume, 1);
    vol += Math.max(c.volume, 1);
  }
  return vol ? pv / vol : candles[candles.length - 1]?.close ?? 0;
}

export function recentHigh(candles: Candle[], lookback = 30): number {
  return Math.max(...candles.slice(-lookback).map(c => c.high));
}

export function recentLow(candles: Candle[], lookback = 30): number {
  return Math.min(...candles.slice(-lookback).map(c => c.low));
}

export function avgVolume(candles: Candle[], lookback = 20): number {
  const slice = candles.slice(-lookback);
  return slice.reduce((a, c) => a + c.volume, 0) / Math.max(slice.length, 1);
}