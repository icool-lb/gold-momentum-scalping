# XAUUSD Gold Momentum Trader

Professional MVP for gold momentum trading signals.

## What it does

- Gives BUY / SELL / NO TRADE
- Targets +10$ to +15$
- Uses approx. 5$ stop
- Scores every setup out of 100
- Creates a trade journal entry
- Sends Telegram alerts
- Accepts live candles from a local MT5 bridge

## Important

This is a decision-support tool, not guaranteed profit. Use demo or small test size first.

## Run locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Deploy to Vercel

1. Upload this folder to GitHub.
2. Import the repo in Vercel.
3. Add environment variables from `.env.example`.
4. Deploy.

## MT5 Bridge

The bridge is in:

```text
mt5_bridge/mt5_bridge.py
```

Install on Windows:

```bash
pip install MetaTrader5 requests
```

Then edit:

```python
VERCEL_INGEST_URL = "https://your-app.vercel.app/api/ingest"
INGEST_SECRET = "same secret as Vercel"
```

Run:

```bash
python mt5_bridge.py
```

## Telegram

Create a bot from BotFather and put:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

Then alerts will be sent when the score is 75+.

## Strategy

- 1H trend context
- 15m confirmation
- 5m decision
- 1m/3m timing
- VWAP / EMA / RSI / ATR
- Breakout/retest logic
- Momentum score
- News risk placeholder
- Trade journal