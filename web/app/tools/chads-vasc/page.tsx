"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

type Item = { key: keyof State; label: string; pts: number };

type State = {
  cHF: boolean; htn: boolean; age75: boolean; dm: boolean;
  strokeTIA: boolean; vascular: boolean; age65to74: boolean; female: boolean;
};

const ITEMS: Item[] = [
  { key: "cHF", label: "Kalp yetmezliği (CHF)", pts: 1 },
  { key: "htn", label: "Hipertansiyon", pts: 1 },
  { key: "age75", label: "Yaş ≥ 75", pts: 2 },
  { key: "dm", label: "Diyabet", pts: 1 },
  { key: "strokeTIA", label: "İnme/TIA/TE öyküsü", pts: 2 },
  { key: "vascular", label: "Vasküler hastalık (MI, PAD)", pts: 1 },
  { key: "age65to74", label: "Yaş 65–74", pts: 1 },
  { key: "female", label: "Kadın cinsiyet", pts: 1 },
];

function readBool(param: string | null) { return param === "1" || param === "true"; }

export default function ChadsVascPage() {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [state, setState] = React.useState<State>({
    cHF: readBool(search?.get("chf") || null),
    htn: readBool(search?.get("htn") || null),
    age75: readBool(search?.get("age75") || null),
    dm: readBool(search?.get("dm") || null),
    strokeTIA: readBool(search?.get("stroke") || null),
    vascular: readBool(search?.get("vasc") || null),
    age65to74: readBool(search?.get("age6574") || null),
    female: readBool(search?.get("female") || null),
  });

  const toggle = (k: keyof State) => setState((s) => ({ ...s, [k]: !s[k] }));
  const score = ITEMS.reduce((sum, it) => sum + (state[it.key] ? it.pts : 0), 0);

  let comment = "—";
  let statusColor = "text-slate-500";
  let statusBg = "bg-slate-100";

  if (score === 0 && !state.female) {
    comment = "Düşük risk (erkek 0). Antikoagülasyon önerilmez.";
    statusColor = "text-emerald-700";
    statusBg = "bg-emerald-50";
  } else if (score === 1 && state.female) {
    comment = "Düşük risk (kadın 1). Sadece cinsiyet puanı; klinik takip.";
    statusColor = "text-blue-700";
    statusBg = "bg-blue-50";
  } else if (score >= 2 || (score === 1 && !state.female)) {
    comment = "Orta-Yüksek risk; Oral Antikoagülan (OAK) önerilir.";
    statusColor = "text-rose-700";
    statusBg = "bg-rose-50";
  }

  return (
    // SAKİN DENİZ: bg-slate-50 (Açık Mavi/Gri) | text-blue-950 (Lacivert)
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BAŞLIK VE GÜNEŞ DETAYI */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">❤️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic">CHA₂DS₂-VASc</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Atriyal Fibrilasyon İnme Risk Analizi</p>
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
                    ${state[it.key] ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}
                  `}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <span className={`text-sm font-bold ${state[it.key] ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>
                    {it.label}
                  </span>
                </div>
                <input type="checkbox" className="hidden" checked={state[it.key]} onChange={() => toggle(it.key)} />
                <span className={`text-[10px] font-black tracking-widest ${state[it.key] ? 'text-amber-400' : 'text-slate-400'}`}>
                  +{it.pts} PUAN
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SKOR VE AKADEMİK YORUM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">TOPLAM</span>
            <div className="text-5xl font-black text-white">{score}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed border-blue-900/10 ${statusBg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">KLİNİK YÖNLENDİRME</span>
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
              Bu araç akademik referans amaçlıdır. Tedavi kararı verilirken güncel ESC/ACC kılavuzları ve hastanın bireysel kanama riski (HAS-BLED) birlikte değerlendirilmelidir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}