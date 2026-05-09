import { Signal, MarketPayload } from "./types";

declare global {
  var latestMarket: MarketPayload | undefined;
  var journal: Signal[] | undefined;
}

export function setLatestMarket(data: MarketPayload) {
  global.latestMarket = data;
}

export function getLatestMarket() {
  return global.latestMarket;
}

export function addJournal(signal: Signal) {
  if (!global.journal) global.journal = [];
  global.journal.unshift(signal);
  global.journal = global.journal.slice(0, 200);
}

export function getJournal() {
  return global.journal ?? [];
}