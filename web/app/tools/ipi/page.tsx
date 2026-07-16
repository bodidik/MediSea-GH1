"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS = [
  { key: "age",     label: "Yaş > 60",                       sub: "" },
  { key: "ldh",     label: "Serum LDH Yüksek",                sub: "Normal üst sınırın üzerinde" },
  { key: "ecog",    label: "ECOG Performans Durumu ≥ 2",      sub: "Ayakta ancak iş göremiyor veya daha kötü" },
  { key: "stage",   label: "Ann Arbor Evre III veya IV",       sub: "İleri evre hastalık" },
  { key: "extranodal", label: "Ekstranodal Tutulum > 1 Bölge", sub: "Birden fazla ekstranodal alan" },
];

function risk(score: number) {
  if (score <= 1) return { label: "DÜŞÜK RİSK", sub: "5 yıllık genel sağkalım ~%73", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (score === 2) return { label: "DÜŞÜK-ORTA RİSK", sub: "5 yıllık genel sağkalım ~%51", color: "text-lime-700", bg: "bg-lime-50", border: "border-lime-200" };
  if (score === 3) return { label: "ORTA-YÜKSEK RİSK", sub: "5 yıllık genel sağkalım ~%43", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
  return { label: "YÜKSEK RİSK", sub: "5 yıllık genel sağkalım ~%26", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
}

export default function IpiPage() {
  const [sel, setSel] = React.useState<Record<string, boolean>>({});
  const score = ITEMS.reduce((s, it) => s + (sel[it.key] ? 1 : 0), 0);
  const r = risk(score);
  const params: Record<string, number> = {};
  ITEMS.forEach(it => { if (sel[it.key]) params[it.key] = 1; });

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="ipi" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🎗️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">IPI Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">International Prognostic Index — Non-Hodgkin Lenfoma</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {ITEMS.map(it => (
              <label key={it.key} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                ${sel[it.key] ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center
                    ${sel[it.key] ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <span className={`text-sm font-bold block ${sel[it.key] ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>{it.label}</span>
                    {it.sub && <span className={`text-[9px] font-bold uppercase tracking-widest ${sel[it.key] ? 'text-blue-200/60' : 'text-slate-400'}`}>{it.sub}</span>}
                  </div>
                </div>
                <input type="checkbox" className="hidden" checked={!!sel[it.key]} onChange={() => setSel(p => ({...p, [it.key]: !p[it.key]}))} />
                <span className={`text-[10px] font-black tracking-widest shrink-0 ${sel[it.key] ? 'text-amber-400' : 'text-slate-400'}`}>+1</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">IPI</span>
            <div className="text-5xl font-black text-white">{score}</div>
            <span className="text-[10px] font-black text-blue-300 mt-1">/ 5</span>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${r.border} ${r.bg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">PROGNOSTİK KATEGORİ</span>
            <p className={`text-2xl font-black italic tracking-tight ${r.color}`}>{r.label}</p>
            <p className={`text-sm font-bold mt-1 ${r.color} opacity-80`}>{r.sub}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              IPI, diffüz büyük B hücreli lenfoma başta olmak üzere agresif Non-Hodgkin lenfomalarda prognozu öngörmek için kullanılır. Genç hastalarda aa-IPI (age-adjusted) tercih edilebilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
