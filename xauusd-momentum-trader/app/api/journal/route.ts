import { NextResponse } from "next/server";
import { getJournal } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ journal: getJournal() });
}