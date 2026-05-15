"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

/** * TIMI (UA/NSTEMI) Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

export default function TIMIUA() {
  const s = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [age65, setAge65] = React.useState(s?.get("age65") === "1");
  const [risk3, setRisk3] = React.useState(s?.get("risk3") === "1");
  const [cad, setCad] = React.useState(s?.get("cad") === "1");
  const [asa, setAsa] = React.useState(s?.get("asa") === "1");
  const [angina, setAngina] = React.useState(s?.get("angina") === "1");
  const [stdev, setStdev] = React.useState(s?.get("st") === "1");
  const [troponin, setTroponin] = React.useState(s?.get("troponin") === "1");

  const score = (age65 ? 1 : 0) + (risk3 ? 1 : 0) + (cad ? 1 : 0) + (asa ? 1 : 0) + (angina ? 1 : 0) + (stdev ? 1 : 0) + (troponin ? 1 : 0);

  const getRisk = (val: number) => {
    if (val >= 5) return { label: "YÜKSEK RİSK", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
    if (val >= 3) return { label: "ORTA RİSK", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "DÜŞÜK RİSK", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  };

  const risk = getRisk(score);

  const params = { 
    age65: age65 ? 1 : "", risk3: risk3 ? 1 : "", cad: cad ? 1 : "", 
    asa: asa ? 1 : "", angina: angina ? 1 : "", st: stdev ? 1 : "", troponin: troponin ? 1 : "" 
  };

  const ITEMS = [
    { id: "age65", label: "Yaş ≥ 65", sub: "Geriatrik popülasyon puanı", val: age65, set: setAge65 },
    { id: "risk3", label: "≥3 KV Risk Faktörü", sub: "FHx, HTN, DM, HLP, Sigara", val: risk3, set: setRisk3 },
    { id: "cad", label: "Bilinen CAD (%50+ Stenoz)", sub: "Koroner arter hastalığı öyküsü", val: cad, set: setCad },
    { id: "asa", label: "Son 7 Günde ASA Kullanımı", sub: "Aspirin maruziyeti", val: asa, set: setAsa },
    { id: "angina", label: "24 Saatte ≥2 Anjinal Epizod", sub: "Ciddi progresif anjina", val: angina, set: setAngina },
    { id: "st", label: "ST Segment Deviasyonu", sub: "≥ 0.5 mm EKG değişikliği", val: stdev, set: setStdev },
    { id: "troponin", label: "Pozitif Kardiyak Belirteç", sub: "Troponin veya CK-MB yüksekliği", val: troponin, set: setTroponin },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">🫀</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">TIMI Risk Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">UA / NSTEMI Risk Sınıflandırması</p>
          </div>
        </div>

        {/* PARAMETRELER: BEYAZ KARTLAR */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {ITEMS.map((it) => (
              <label 
                key={it.id} 
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
                <input type="checkbox" className="hidden" checked={it.val} onChange={() => it.set(!it.val)} />
                <span className={`text-[10px] font-black tracking-widest ${it.val ? 'text-amber-400' : 'text-slate-400'}`}>
                  +1
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SKOR VE ANALİTİK YORUM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400 text-center">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">SKOR</span>
            <div className="text-5xl font-black text-white">{score} <span className="text-xl opacity-40">/ 7</span></div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 ${risk.border} ${risk.bg} transition-all duration-500`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block text-center md:text-left">RİSK KATEGORİSİ</span>
            <p className={`text-3xl font-black italic tracking-tighter text-center md:text-left ${risk.color}`}>
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
              TIMI skoru, stabil olmayan anjina (UA) ve NSTEMI hastalarında erken dönemde invaziv strateji gerekliliğini ve mortalite riskini belirlemek için kullanılır. STEMI hastaları için ayrı skorlama sistemleri mevcuttur.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}