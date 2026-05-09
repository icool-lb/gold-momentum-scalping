import { NextResponse } from "next/server";
import { setLatestMarket } from "@/lib/store";
import { MarketPayload } from "@/lib/types";

export async function POST(req: Request) {
  const secret = req.headers.get("x-ingest-secret");
  if (process.env.INGEST_SECRET && secret !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as MarketPayload;
  if (!body.symbol || !body.m5 || !body.m15 || !body.h1) {
    return NextResponse.json({ error: "Invalid market payload" }, { status: 400 });
  }

  setLatestMarket(body);
  return NextResponse.json({ ok: true, symbol: body.symbol, receivedAt: new Date().toISOString() });
}