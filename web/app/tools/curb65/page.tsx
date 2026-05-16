"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

/** * CURB-65 Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

export default function Curb65Page() {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [confusion, setConfusion] = React.useState(search?.get("c") === "1");
  const [ureaHigh, setUreaHigh] = React.useState(search?.get("u") === "1");
  const [rrHigh, setRrHigh] = React.useState(search?.get("r") === "1");
  const [bpLow, setBpLow] = React.useState(search?.get("b") === "1");
  const [age65, setAge65] = React.useState(search?.get("a") === "1");

  const score = (confusion ? 1 : 0) + (ureaHigh ? 1 : 0) + (rrHigh ? 1 : 0) + (bpLow ? 1 : 0) + (age65 ? 1 : 0);

  let comment = "—";
  let statusColor = "text-slate-500";
  let statusBg = "bg-slate-100";

  if (score <= 1) {
    comment = "Düşük Risk: Ayaktan tedavi düşünülebilir.";
    statusColor = "text-emerald-700";
    statusBg = "bg-emerald-50";
  } else if (score === 2) {
    comment = "Orta Risk: Kısa süreli yatış veya yakın takip değerlendirilmelidir.";
    statusColor = "text-amber-700";
    statusBg = "bg-amber-50";
  } else {
    comment = "Yüksek Risk: Hastaneye yatış ve ileri değerlendirme (YBÜ?) önerilir.";
    statusColor = "text-rose-700";
    statusBg = "bg-rose-50";
  }

  const params = {
    c: confusion ? 1 : "", u: ureaHigh ? 1 : "", r: rrHigh ? 1 : "", b: bpLow ? 1 : "", a: age65 ? 1 : ""
  };

  const ITEMS = [
    { label: "Konfüzyon (Yeni gelişen)", val: confusion, set: setConfusion, sub: "AMTS <8 veya yeni dezoryantasyon" },
    { label: "Üre > 7 mmol/L", val: ureaHigh, set: setUreaHigh, sub: "> 19 mg/dL (BUN)" },
    { label: "Solunum Hızı (RR) ≥ 30/dk", val: rrHigh, set: setRrHigh, sub: "Taşipneik solunum" },
    { label: "Kan Basıncı (SBP < 90 / DBP ≤ 60)", val: bpLow, set: setBpLow, sub: "Hipotansiyon varlığı" },
    { label: "Yaş ≥ 65", val: age65, set: setAge65, sub: "Geriatrik popülasyon puanı" },
  ];

  return (
    // SAKİN DENİZ: bg-slate-50 | text-blue-950
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
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic">CURB-65</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Pnömoni Ciddiyet Analizi</p>
          </div>
        </div>

        {/* PARAMETRELER: BEYAZ KARTLAR & LACİVERT SEÇİMLER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {ITEMS.map((it, idx) => (
              <label 
                key={idx} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                  ${it.val ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all
                    ${it.val ? 'bg-amber-400 border-amber-400 text-blue-900 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-white border-slate-200 text-transparent'}
                  `}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <span className={`text-sm font-bold block transition-colors ${it.val ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>
                      {it.label}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${it.val ? 'text-blue-200/60' : 'text-slate-400'}`}>
                      {it.sub}
                    </span>
                  </div>
                </div>
                <input type="checkbox" className="hidden" checked={it.val} onChange={() => it.set(v => !v)} />
                <span className={`text-[10px] font-black tracking-widest ${it.val ? 'text-amber-400' : 'text-slate-400'}`}>
                  +1 PUAN
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SKOR VE ANALİTİK YORUM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">SKOR</span>
            <div className="text-5xl font-black text-white">{score}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed border-blue-900/10 ${statusBg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">KLİNİK KARAR DESTEK</span>
            <p className={`text-base font-black leading-relaxed italic ${statusColor}`}>
              {comment}
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
              Bu araç akademik referans amaçlıdır. Tedavi kararı verilirken klinik tablo, ek hastalıklar ve yerel pnömoni rehberleri esas alınmalıdır.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}