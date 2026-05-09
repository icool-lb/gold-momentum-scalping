"""
MT5 Bridge for XAUUSD Momentum Trader

Run this on the Windows computer where MetaTrader 5 is installed and logged in.

Install:
    pip install MetaTrader5 requests

Edit VERCEL_INGEST_URL and INGEST_SECRET, then run:
    python mt5_bridge.py
"""

import time
import requests
from datetime import datetime
import MetaTrader5 as mt5

SYMBOL = "XAUUSD"
VERCEL_INGEST_URL = "https://your-app.vercel.app/api/ingest"
INGEST_SECRET = "change-this-secret"

TIMEFRAMES = {
    "m1": mt5.TIMEFRAME_M1,
    "m3": mt5.TIMEFRAME_M3,
    "m5": mt5.TIMEFRAME_M5,
    "m15": mt5.TIMEFRAME_M15,
    "h1": mt5.TIMEFRAME_H1,
}

def candles(tf, count=120):
    rates = mt5.copy_rates_from_pos(SYMBOL, tf, 0, count)
    if rates is None:
        raise RuntimeError(f"No rates for {SYMBOL}")
    out = []
    for r in rates:
        out.append({
            "time": int(r["time"]) * 1000,
            "open": float(r["open"]),
            "high": float(r["high"]),
            "low": float(r["low"]),
            "close": float(r["close"]),
            "volume": float(r["tick_volume"]),
        })
    return out

def dxy_bias_placeholder():
    # Upgrade later by adding DXY feed.
    return "NEUTRAL"

def news_risk_placeholder():
    # Upgrade later with NewsAPI/Finnhub/OpenAI filter.
    return "LOW"

def main():
    if not mt5.initialize():
        raise RuntimeError("MT5 initialization failed. Open MT5 and log in first.")

    if not mt5.symbol_select(SYMBOL, True):
        raise RuntimeError(f"Could not select symbol {SYMBOL}")

    print("MT5 Bridge started:", datetime.now())

    while True:
        try:
            payload = {
                "symbol": SYMBOL,
                "m1": candles(TIMEFRAMES["m1"]),
                "m3": candles(TIMEFRAMES["m3"]),
                "m5": candles(TIMEFRAMES["m5"]),
                "m15": candles(TIMEFRAMES["m15"]),
                "h1": candles(TIMEFRAMES["h1"]),
                "dxyBias": dxy_bias_placeholder(),
                "newsRisk": news_risk_placeholder(),
            }

            res = requests.post(
                VERCEL_INGEST_URL,
                json=payload,
                headers={"x-ingest-secret": INGEST_SECRET},
                timeout=15,
            )
            print(datetime.now(), res.status_code, res.text[:120])
        except Exception as e:
            print("ERROR:", e)

        time.sleep(30)

if __name__ == "__main__":
    main()