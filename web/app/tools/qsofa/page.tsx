"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

/** * qSOFA Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

export default function QsOFA() {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  
  const [sbpLow, setSbpLow] = React.useState(search?.get("sbp") === "1"); 
  const [rrHigh, setRrHigh] = React.useState(search?.get("rr") === "1"); 
  const [gcsLow, setGcsLow] = React.useState(search?.get("gcs") === "1");

  const score = (sbpLow ? 1 : 0) + (rrHigh ? 1 : 0) + (gcsLow ? 1 : 0);

  let comment = "—";
  let statusColor = "text-slate-500";
  let statusBg = "bg-slate-100";

  if (score >= 2) {
    comment = "Yüksek Risk: Kötü prognoz ve sepsis açısından artmış risk; yoğun bakım ve yakın izlem değerlendirilmelidir.";
    statusColor = "text-rose-700";
    statusBg = "bg-rose-50";
  } else {
    comment = "Düşük Risk: Mevcut bulgular qSOFA kriterlerine göre düşük riskli; ancak klinik şüphe varsa takip edilmelidir.";
    statusColor = "text-emerald-700";
    statusBg = "bg-emerald-50";
  }

  const params = { sbp: sbpLow ? 1 : "", rr: rrHigh ? 1 : "", gcs: gcsLow ? 1 : "" };

  const ITEMS = [
    { id: "sbp", label: "Sistolik KB ≤ 100 mmHg", val: sbpLow, set: setSbpLow, sub: "Hipotansiyon varlığı" },
    { id: "rr", label: "Solunum Sayısı ≥ 22/dk", val: rrHigh, set: setRrHigh, sub: "Taşipneik solunum" },
    { id: "gcs", label: "Mental Durum Değişikliği", val: gcsLow, set: setGcsLow, sub: "GKS < 15 veya yeni dezoryantasyon" },
  ];

  return (
    // SAKİN DENİZ: bg-slate-50 | text-blue-950
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BAŞLIK VE GÜNEŞ DETAYI */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">🚨</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">qSOFA</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Hızlı Sepsis Değerlendirme Protokolü</p>
          </div>
        </div>

        {/* PARAMETRELER: BEYAZ KARTLAR */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-3">
            {ITEMS.map((it) => (
              <label 
                key={it.id} 
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer group
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
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">KLİNİK YÖNLENDİRME</span>
            <p className={`text-base font-black leading-relaxed italic ${statusColor}`}>
              {comment}
            </p>
          </div>
        </div>

        {/* ALT PANEL: PAYLAŞIM VE UYARI */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              qSOFA sepsis tanısı koydurmaz; hastanedeki mortalite riskini ve klinik bozulma olasılığını hızlıca belirlemek için kullanılır. Pozitif sonuç durumunda tam SOFA skorlaması ve sepsis protokolü düşünülmelidir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}