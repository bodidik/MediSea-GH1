"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/** * MELD-Na (2016) Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function round(n: number, dp = 0) { return Math.round(n * Math.pow(10, dp)) / Math.pow(10, dp); }

export default function MeldNaPage() {
  const s = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  // Metin (string) state: kullanıcı alanı silip yeniden yazabilsin diye —
  // sayıya çevirme sadece hesaplama anında yapılır.
  const [cr, setCr] = React.useState<string>(s?.get("cr") || "1");
  const [tb, setTb] = React.useState<string>(s?.get("tb") || "1");
  const [inr, setInr] = React.useState<string>(s?.get("inr") || "1");
  const [na, setNa] = React.useState<string>(s?.get("na") || "135");

  const [onDialysis, setOnDialysis] = React.useState<boolean>(s?.get("dial") === "1");
  const [capCreat4, setCapCreat4] = React.useState<boolean>(s?.get("cap") === "1");

  const crNum = parseLocaleNumber(cr);
  const tbNum = parseLocaleNumber(tb);
  const inrNum = parseLocaleNumber(inr);
  const naNum = parseLocaleNumber(na);

  const naAdj = clamp(naNum, 125, 137);
  let crUsed = onDialysis ? 4.0 : crNum;
  if (capCreat4) crUsed = Math.min(crUsed, 4.0);

  const crAdj = Math.max(1, crUsed);
  const tbAdj = Math.max(1, tbNum);
  const inrAdj = Math.max(1, inrNum);

  const meld = 0.957 * Math.log(crAdj) + 0.378 * Math.log(tbAdj) + 1.12 * Math.log(inrAdj) + 0.643;
  const meldNa = meld + 1.59 * (135 - naAdj);
  const score = round(meldNa, 0);

  const params = { cr: crNum, tb: tbNum, inr: inrNum, na: naNum, dial: onDialysis ? 1 : "", cap: capCreat4 ? 1 : "" };

  return (
    // SAKİN DENİZ: bg-slate-50 | text-blue-950
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="meld-na" />

        {/* BAŞLIK VE GÜNEŞ DETAYI */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">🫁</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">MELD-Na</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Son Evre Karaciğer Hastalığı Analizi</p>
          </div>
        </div>

        {/* PARAMETRELER: BEYAZ KARTLAR */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest pl-1">Kreatinin (mg/dL)</span>
                <input
                  type="text" inputMode="decimal" value={cr}
                  onChange={e => setCr(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none transition-all font-bold text-lg"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest pl-1">Total Bilirubin (mg/dL)</span>
                <input
                  type="text" inputMode="decimal" value={tb}
                  onChange={e => setTb(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none transition-all font-bold text-lg"
                />
              </label>
            </div>
            <div className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest pl-1">INR</span>
                <input
                  type="text" inputMode="decimal" value={inr}
                  onChange={e => setInr(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none transition-all font-bold text-lg"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest pl-1">Sodyum (mEq/L)</span>
                <input
                  type="text" inputMode="decimal" value={na}
                  onChange={e => setNa(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none transition-all font-bold text-lg"
                />
              </label>
            </div>
          </div>

          {/* OPSİYONLAR: GÜN IŞIĞI CHECKBOX */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" checked={onDialysis} 
                onChange={() => setOnDialysis(v => !v)} 
                className="w-5 h-5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
              />
              <span className="text-xs font-bold text-slate-600 group-hover:text-blue-900 transition-colors">Diyalizde (Cr=4 kabul)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" checked={capCreat4} 
                onChange={() => setCapCreat4(v => !v)} 
                className="w-5 h-5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
              />
              <span className="text-xs font-bold text-slate-600 group-hover:text-blue-900 transition-colors">Kreatinin tavanı: 4.0 mg/dL</span>
            </label>
          </div>
        </div>

        {/* SONUÇ PANELİ: LACİVERT & ALTIN */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-8xl font-black italic">⚕️</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">HESAPLANAN MELD-Na SKORU</span>
           <div className="text-7xl font-black text-white drop-shadow-lg">{score}</div>
           <div className="mt-4 text-xs font-bold text-amber-400 uppercase tracking-widest italic max-w-xs">
             Skor yükseldikçe 90 günlük mortalite riski artış gösterir.
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
              Bu hesaplama eğitim ve referans amaçlıdır. Laboratuvar birimlerinizi, yerel protokolleri ve UNOS kriterlerini mutlaka doğrulayın.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}