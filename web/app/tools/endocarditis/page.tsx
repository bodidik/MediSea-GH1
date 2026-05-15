"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

/** * Enfektif Endokardit (Duke Kriterleri) Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

type Criterion = { key: string; label: string; weight: number; group: "major" | "minor" };

const CRITERIA: Criterion[] = [
  // Major Kriterler
  { key: "blood_culture", label: "Tipik mikrobiyoloji ile kan kültürü pozitifliği", weight: 3, group: "major" },
  { key: "echo_find", label: "Eko: Vejetasyon, abses veya yeni valvüler regürjitasyon", weight: 3, group: "major" },

  // Minor Kriterler
  { key: "predispose", label: "Predispozisyon (kalp hastalığı veya IV ilaç kullanımı)", weight: 1, group: "minor" },
  { key: "fever", label: "Ateş ≥ 38.0°C", weight: 1, group: "minor" },
  { key: "vascular", label: "Vasküler bulgular (emboli, Janeway, konjonktival kanama)", weight: 1, group: "minor" },
  { key: "immunologic", label: "İmmünolojik bulgular (GN, Osler, RF, Roth lekeleri)", weight: 1, group: "minor" },
  { key: "micro_minor", label: "Majör kriter dışı mikrobiyolojik kanıtlar", weight: 1, group: "minor" },
];

export default function EndocarditisToolPage() {
  const [sel, setSel] = React.useState<Record<string, boolean>>({});

  function toggle(k: string) {
    setSel((s) => ({ ...s, [k]: !s[k] }));
  }

  const majorCount = CRITERIA.filter((c) => c.group === "major" && sel[c.key]).length;
  const minorCount = CRITERIA.filter((c) => c.group === "minor" && sel[c.key]).length;
  const score = CRITERIA.reduce((sum, c) => sum + (sel[c.key] ? c.weight : 0), 0);

  // Tanı Yorumlama Algoritması - Gündüz Modu Renkleri
  let interp = "—";
  let interpColor = "text-slate-500";
  let interpBg = "bg-slate-100";

  if (majorCount >= 2 || (majorCount === 1 && minorCount >= 3) || minorCount === 5) {
    interp = "KESİN ENDOKARDİT (Definite IE)";
    interpColor = "text-rose-700";
    interpBg = "bg-rose-50";
  } else if ((majorCount === 1 && minorCount >= 1) || minorCount >= 3) {
    interp = "OLASI ENDOKARDİT (Possible IE)";
    interpColor = "text-amber-700";
    interpBg = "bg-amber-50";
  } else {
    interp = "ZAYIF BULGULAR (Rejected/Unlikely)";
    interpColor = "text-emerald-700";
    interpBg = "bg-emerald-50";
  }

  const shareParams = Object.keys(sel).reduce((acc, k) => {
    if (sel[k]) acc[k] = "1";
    return acc;
  }, {} as Record<string, string>);

  return (
    // SAKİN DENİZ: bg-slate-50 | text-blue-950
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BAŞLIK VE GÜNEŞ DETAYI */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">⚔️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">DUKE KRİTERLERİ</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Enfektif Endokardit Tanı Rehberi</p>
          </div>
        </div>

        {/* MAJÖR KRİTERLER: MAVİ VURGU */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.3em] ml-2 opacity-70">MAJÖR KRİTERLER</h2>
          <div className="grid gap-2">
            {CRITERIA.filter(c => c.group === "major").map((c) => (
              <label 
                key={c.key} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                  ${sel[c.key] ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-white border-slate-200 hover:border-blue-900/30'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all
                    ${sel[c.key] ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-slate-50 border-slate-200 text-transparent'}
                  `}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <span className={`text-sm font-bold transition-colors ${sel[c.key] ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>
                    {c.label}
                  </span>
                </div>
                <input type="checkbox" className="hidden" checked={!!sel[c.key]} onChange={() => toggle(c.key)} />
              </label>
            ))}
          </div>
        </div>

        {/* MİNÖR KRİTERLER: SAKİN LACİVERT */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">MİNÖR KRİTERLER</h2>
          <div className="grid gap-2">
            {CRITERIA.filter(c => c.group === "minor").map((c) => (
              <label 
                key={c.key} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                  ${sel[c.key] ? 'bg-blue-800 border-blue-800 text-white shadow-md' : 'bg-white border-slate-200 hover:border-blue-900/30'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all
                    ${sel[c.key] ? 'bg-slate-200 border-slate-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-transparent'}
                  `}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <span className={`text-sm font-medium transition-colors ${sel[c.key] ? 'text-slate-100' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    {c.label}
                  </span>
                </div>
                <input type="checkbox" className="hidden" checked={!!sel[c.key]} onChange={() => toggle(c.key)} />
              </label>
            ))}
          </div>
        </div>

        {/* ANALİZ SONUCU: AKADEMİK PANEL */}
        <div className={`rounded-[2rem] border border-blue-900/10 p-8 shadow-sm relative overflow-hidden bg-white`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-8xl">🩺</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest block mb-2">OTOMATİK TANI ANALİZİ</span>
              <p className={`text-xl font-black italic tracking-tight px-4 py-2 rounded-xl ${interpColor} ${interpBg}`}>
                {interp}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-900 rounded-[2rem] px-5 py-4 text-center min-w-[90px] shadow-lg border-t-4 border-amber-400">
                <span className="block text-[10px] font-black text-blue-200 uppercase mb-1">MAJÖR</span>
                <span className="text-3xl font-black text-white">{majorCount}</span>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-[2rem] px-5 py-4 text-center min-w-[90px]">
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">MİNÖR</span>
                <span className="text-3xl font-black text-blue-900">{minorCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ALT PANEL: PAYLAŞIM VE İSTİHBARAT */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={shareParams} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Bu araç Duke Kriterleri baz alınarak hazırlanmış bir eğitim şablonudur. Kesin tanı için klinik, laboratuvar ve görüntüleme bulguları hekim tarafından bütüncül değerlendirilmelidir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}