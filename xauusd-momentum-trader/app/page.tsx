"use client";

import { useEffect, useState } from "react";
import { Activity, ShieldAlert, Target, TrendingUp } from "lucide-react";

type Signal = {
  side: "BUY" | "SELL" | "NO_TRADE";
  score: number;
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number;
  risk: string;
  decision: string;
  reasons: string[];
  breakdown: Record<string, number>;
  createdAt: string;
};

export default function Page() {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [journal, setJournal] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("mock");

  async function analyze() {
    setLoading(true);
    const res = await fetch("/api/analyze", { cache: "no-store" });
    const data = await res.json();
    setSignal(data.signal);
    setSource(data.source);
    await loadJournal();
    setLoading(false);
  }

  async function loadJournal() {
    const res = await fetch("/api/journal", { cache: "no-store" });
    const data = await res.json();
    setJournal(data.journal ?? []);
  }

  useEffect(() => {
    analyze();
    const t = setInterval(analyze, 30000);
    return () => clearInterval(t);
  }, []);

  const sideClass = signal?.side === "BUY" ? "buy" : signal?.side === "SELL" ? "sell" : "warn";

  return (
    <main>
      <div className="row" style={{justifyContent:"space-between", marginBottom: 18}}>
        <div>
          <h1>XAUUSD Gold Momentum Trader</h1>
          <p>صفقات Momentum بهدف 10$ إلى 15$ وستوب قريب من 5$ — مع تقييم من 100 وسجل أداء.</p>
        </div>
        <button onClick={analyze} disabled={loading}>{loading ? "جاري التحليل..." : "تحليل الآن"}</button>
      </div>

      <div className="grid grid-3">
        <section className="card">
          <div className="row"><Activity size={20}/><span className="badge">مصدر البيانات: {source}</span></div>
          <h2 style={{marginTop: 14}}>قرار النظام</h2>
          <div className={`score ${sideClass}`}>{signal?.side ?? "--"}</div>
          <p>{signal?.decision}</p>
        </section>

        <section className="card">
          <div className="row"><TrendingUp size={20}/><span className="badge">Score</span></div>
          <h2 style={{marginTop: 14}}>قوة الصفقة</h2>
          <div className="score">{signal?.score ?? 0}/100</div>
          <p>فوق 75 صفقة جيدة، فوق 85 صفقة قوية، أقل من 60 ممنوع دخول.</p>
        </section>

        <section className="card">
          <div className="row"><ShieldAlert size={20}/><span className="badge">Risk</span></div>
          <h2 style={{marginTop: 14}}>إدارة الخطر</h2>
          <div className="kpi">SL ≈ 5$</div>
          <p>عند +5$ أغلق جزءًا من الصفقة وحرّك الستوب إلى الدخول.</p>
        </section>
      </div>

      <div className="grid grid-2" style={{marginTop: 16}}>
        <section className="card">
          <div className="row"><Target size={20}/><h2>مستويات الصفقة</h2></div>
          <table>
            <tbody>
              <tr><th>Entry</th><td>{signal?.entry}</td></tr>
              <tr><th>SL</th><td>{signal?.sl}</td></tr>
              <tr><th>TP1</th><td>{signal?.tp1}</td></tr>
              <tr><th>TP2</th><td>{signal?.tp2}</td></tr>
              <tr><th>TP3</th><td>{signal?.tp3}</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>أسباب القرار</h2>
          {(signal?.reasons ?? []).map((r, i) => <p key={i}>• {r}</p>)}
        </section>
      </div>

      <section className="card" style={{marginTop: 16}}>
        <h2>تفصيل النقاط من 100</h2>
        <table>
          <tbody>
            {Object.entries(signal?.breakdown ?? {}).map(([k, v]) => (
              <tr key={k}><th>{k}</th><td>{v}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card" style={{marginTop: 16}}>
        <h2>سجل الصفقات / الاختبار</h2>
        <table>
          <thead>
            <tr>
              <th>الوقت</th>
              <th>القرار</th>
              <th>Score</th>
              <th>Entry</th>
              <th>SL</th>
              <th>TP2</th>
            </tr>
          </thead>
          <tbody>
            {journal.map((j, i) => (
              <tr key={i}>
                <td className="small">{new Date(j.createdAt).toLocaleString("ar-LB")}</td>
                <td className={j.side === "BUY" ? "buy" : j.side === "SELL" ? "sell" : "warn"}>{j.side}</td>
                <td>{j.score}</td>
                <td>{j.entry}</td>
                <td>{j.sl}</td>
                <td>{j.tp2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}