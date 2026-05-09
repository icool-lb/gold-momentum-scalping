import { Signal } from "./types";

export async function sendTelegram(signal: Signal) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { ok: false, skipped: true };

  const text = [
    `🚨 XAUUSD MOMENTUM SIGNAL`,
    `Decision: ${signal.side}`,
    `Score: ${signal.score}/100`,
    `Entry: ${signal.entry}`,
    `SL: ${signal.sl}`,
    `TP1: ${signal.tp1}`,
    `TP2: ${signal.tp2}`,
    `TP3: ${signal.tp3}`,
    `Risk: ${signal.risk}`,
    ``,
    `Reason: ${signal.reasons.join(" | ")}`
  ].join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });

  return { ok: res.ok };
}