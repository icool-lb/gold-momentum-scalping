import { NextResponse } from "next/server";
import { analyzeMarket } from "@/lib/signalEngine";
import { getMockMarket } from "@/lib/mockMarket";
import { addJournal, getLatestMarket } from "@/lib/store";
import { sendTelegram } from "@/lib/telegram";

export async function GET() {
  const market = getLatestMarket() ?? getMockMarket();
  const signal = analyzeMarket(market);
  addJournal(signal);

  if (signal.side !== "NO_TRADE" && signal.score >= 75) {
    await sendTelegram(signal);
  }

  return NextResponse.json({ signal, source: getLatestMarket() ? "live/ingested" : "mock" });
}