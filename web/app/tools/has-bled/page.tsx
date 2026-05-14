"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

/** * HAS-BLED Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

type Item = { key: keyof State; label: string; pts: number; sub?: string };

type State = {
  htn: boolean; abnRenal: boolean; abnLiver: boolean; stroke: boolean;
  bleed: boolean; labileINR: boolean; elderly65: boolean; drugs: boolean; alcohol: boolean;
};

const ITEMS: Item[] = [
  { key: "htn",        label: "Hipertansiyon",         pts: 1, sub: "SBP > 160 mmHg" },
  { key: "abnRenal",   label: "Böbrek Fonksiyonu",     pts: 1, sub: "Diyaliz, Tx veya Cr > 2.26 mg/dL" },
  { key: "abnLiver",   label: "Karaciğer Fonksiyonu",  pts: 1, sub: "Siroz veya Bilirubin > 2x, AST/ALT > 3x" },
  { key: "stroke",     label: "Geçirilmiş İnme",       pts: 1, sub: "Serebrovasküler olay öyküsü" },
  { key: "bleed",      label: "Kanama Öyküsü",         pts: 1, sub: "Anemi veya kanama predispozisyonu" },
  { key: "labileINR",  label: "Labile INR",            pts: 1, sub: "TTR < %60 (Warfarin kullanıcıları)" },
  { key: "elderly65",  label: "Yaş > 65",              pts: 1, sub: "Geriatrik popülasyon risk puanı" },
  { key: "drugs",      label: "İlaç Kullanımı",        pts: 1, sub: "Antiplatelet, NSAİİ kullanımı" },
  { key: "alcohol",    label: "Alkol Kullanımı",       pts: 1, sub: "Haftada ≥ 8 ünite alkol tüketimi" },
];

function readBool(param: string | null) { return param === "1" || param === "true"; }

export default function HasBledPage() {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [state, setState] = React.useState<State>({
    htn: readBool(search?.get("htn") || null),
    abnRenal: readBool(search?.get("renal") || null),
    abnLiver: readBool(search?.get("liver") || null),
    stroke: readBool(search?.get("stroke") || null),
    bleed: readBool(search?.get("bleed") || null),
    labileINR: readBool(search?.get("inr") || null),
    elderly65: readBool(search?.get("elderly") || null),
    drugs: readBool(search?.get("drugs") || null),
    alcohol: readBool(search?.get("alcohol") || null),
  });

  const toggle = (k: keyof State) => setState((s) => ({ ...s, [k]: !s[k] }));
  const score = ITEMS.reduce((sum, it) => sum + (state[it.key] ? it.pts : 0), 0);

  let comment = "—";
  let statusColor = "text-slate-500";
  let statusBg = "bg-slate-100";

  if (score >= 3) {
    comment = "Yüksek Kanama Riski; Yakın izlem ve düzeltilebilir risk faktörlerinin optimizasyonu önerilir.";
    statusColor = "text-rose-700";
    statusBg = "bg-rose-50";
  } else if (score === 2) {
    comment = "Orta Risk; Dikkatli takip ve periyodik değerlendirme.";
    statusColor = "text-amber-700";
    statusBg = "bg-amber-50";
  } else {
    comment = "Düşük Kanama Riski.";
    statusColor = "text-emerald-700";
    statusBg = "bg-emerald-50";
  }

  const shareParams = {
    htn: state.htn ? 1 : "", renal: state.abnRenal ? 1 : "", liver: state.abnLiver ? 1 : "",
    stroke: state.stroke ? 1 : "", bleed: state.bleed ? 1 : "", inr: state.labileINR ? 1 : "",
    elderly: state.elderly65 ? 1 : "", drugs: state.drugs ? 1 : "", alcohol: state.alcohol ? 1 : "",
  };

  return (
    // SAKİN DENİZ: bg-slate-50 | text-blue-950
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BAŞLIK VE GÜNEŞ DETAYI */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">🩸</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">HAS-BLED</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Gastrointestinal ve İntraserebral Kanama Risk Analizi</p>
          </div>
        </div>

        {/* PARAMETRELER: BEYAZ KARTLAR & LACİVERT SEÇİMLER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {ITEMS.map((it) => (
              <label 
                key={it.key} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                  ${state[it.key] ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all
                    ${state[it.key] ? 'bg-amber-400 border-amber-400 text-blue-900 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-white border-slate-200 text-transparent'}
                  `}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <span className={`text-sm font-bold block transition-colors ${state[it.key] ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>
                      {it.label}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${state[it.key] ? 'text-blue-200/60' : 'text-slate-400'}`}>
                      {it.sub}
                    </span>
                  </div>
                </div>
                <input type="checkbox" className="hidden" checked={state[it.key]} onChange={() => toggle(it.key)} />
                <span className={`text-[10px] font-black tracking-widest ${state[it.key] ? 'text-amber-400' : 'text-slate-400'}`}>
                  +1 PUAN
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SKOR VE ANALİTİK YORUM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">TOPLAM</span>
            <div className="text-5xl font-black text-white">{score}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed border-blue-900/10 ${statusBg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">KLİNİK DEĞERLENDİRME</span>
            <p className={`text-base font-black leading-relaxed italic ${statusColor}`}>
              {comment}
            </p>
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
              HAS-BLED skoru, antikoagülan tedaviyi durdurmak için değil, düzeltilebilir risk faktörlerini belirlemek ve hastanın izlem sıklığını kararlaştırmak için kullanılmalıdır.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}