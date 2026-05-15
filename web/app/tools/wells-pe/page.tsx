"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

/** * Wells (PE) Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

type Item = { key: string; label: string; pts: number; sub?: string };

const ITEMS: Item[] = [
  { key: "dvt", label: "Klinik DVT Bulguları", pts: 3, sub: "Bacakta şişlik, derin ven hassasiyeti" },
  { key: "altHigher", label: "Alternatif Tanı Olasılığı Düşük", pts: 3, sub: "PE olasılığı diğer tanılardan daha yüksek" },
  { key: "tachy", label: "Taşikardi (Nabız > 100)", pts: 1.5, sub: "Aktif kalp hızı yüksekliği" },
  { key: "immob", label: "İmmobilizasyon / Cerrahi", pts: 1.5, sub: "Son 4 hafta içinde cerrahi veya ≥3 gün yatak istirahati" },
  { key: "prevVTE", label: "Önceki DVT / PE Öyküsü", pts: 1.5, sub: "Geçmiş tromboembolizm hikayesi" },
  { key: "hemoptysis", label: "Hemoptizi", pts: 1, sub: "Öksürükle kan gelmesi" },
  { key: "malignancy", label: "Malignite", pts: 1, sub: "Aktif kanser veya son 6 ayda tedavi" },
];

function round(n: number, dp = 1) { return Math.round(n * Math.pow(10, dp)) / Math.pow(10, dp); }

export default function WellsPEPage() {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initial: Record<string, boolean> = {};
  ITEMS.forEach(i => { initial[i.key] = (search?.get(i.key) === "1"); });

  const [sel, setSel] = React.useState<Record<string, boolean>>(initial);
  function toggle(k: string) { setSel(s => ({ ...s, [k]: !s[k] })); }

  const score = round(ITEMS.reduce((sum, it) => sum + (sel[it.key] ? it.pts : 0), 0), 1);

  const getRisk = (val: number) => {
    if (val > 6) return { label: "YÜKSEK RİSK (>%60)", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
    if (val >= 2) return { label: "ORTA RİSK (~%16)", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "DÜŞÜK RİSK (~%1.3)", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  };

  const risk = getRisk(score);

  const params: Record<string, string | number> = {};
  ITEMS.forEach(i => { if (sel[i.key]) params[i.key] = 1; });

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BAŞLIK VE GÜNEŞ DETAYI */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">🫁</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Wells (PE)</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Pulmoner Emboli Klinik Olasılık Skoru</p>
          </div>
        </div>

        {/* PARAMETRELER: BEYAZ KARTLAR */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {ITEMS.map((it) => (
              <label 
                key={it.key} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                  ${sel[it.key] ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all
                    ${sel[it.key] ? 'bg-amber-400 border-amber-400 text-blue-900 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-white border-slate-200 text-transparent'}
                  `}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <span className={`text-sm font-bold block transition-colors ${sel[it.key] ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>
                      {it.label}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${sel[it.key] ? 'text-blue-200/60' : 'text-slate-400'}`}>
                      {it.sub}
                    </span>
                  </div>
                </div>
                <input type="checkbox" className="hidden" checked={!!sel[it.key]} onChange={() => toggle(it.key)} />
                <span className={`text-[10px] font-black tracking-widest ${sel[it.key] ? 'text-amber-400' : 'text-slate-400'}`}>
                  +{it.pts}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SKOR VE ANALİTİK YORUM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1 text-center">SKOR</span>
            <div className="text-5xl font-black text-white">{score}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${risk.border} ${risk.bg} transition-all duration-500`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block text-center md:text-left">RİSK KATEGORİSİ</span>
            <p className={`text-2xl font-black italic tracking-tight text-center md:text-left ${risk.color}`}>
              {risk.label}
            </p>
          </div>
        </div>

        {/* ALT PANEL: PAYLAŞIM VE İSTİHBARAT */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Wells PE skoru klinik olasılığı belirlemek içindir. Genelde düşük riskli grupta D-dimer ile dışlama, orta/yüksek riskli grupta ise doğrudan görüntüleme (BT Anjiyo) önerilir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}