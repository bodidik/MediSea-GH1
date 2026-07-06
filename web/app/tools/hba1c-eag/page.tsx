"use client";

import React, { useState, useMemo } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import { hba1cToEagMgdl, mgdlToMmol, parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/** * HbA1c -> Tahmini Ortalama Glukoz (eAG) Gündüz Modu (Sakin Deniz)
 * Formül (ADA/NGSP): eAG (mg/dL) = 28.7 * A1c - 46.7
 */

export default function Hba1cEagPage() {
  const [a1c, setA1c] = useState<string>("7.0");

  const a1cNum = parseLocaleNumber(a1c);

  const eagMgdl = useMemo(() => hba1cToEagMgdl(a1cNum), [a1cNum]);
  const eagMmol = useMemo(() => mgdlToMmol(eagMgdl), [eagMgdl]);

  const interpretation =
    a1cNum >= 6.5
      ? { label: "Diyabet Sınırında/Üzerinde", color: "text-rose-700", bg: "bg-rose-50" }
      : a1cNum >= 5.7
      ? { label: "Prediyabet Aralığı", color: "text-amber-700", bg: "bg-amber-50" }
      : { label: "Normal Aralık", color: "text-emerald-700", bg: "bg-emerald-50" };

  const shareParams = { a1c: a1cNum };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            📈
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">HbA1c → Ortalama Glukoz</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Tahmini Ortalama Glukoz (eAG) — ADA/NGSP</p>
          </div>
        </div>

        {/* INPUT KARTI */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">HbA1c (%)</span>
          <input
            type="text" inputMode="decimal" value={a1c} onChange={(e) => setA1c(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-900 outline-none font-black text-xl transition-all"
          />
        </div>

        {/* SONUÇ PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">eAG</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">TAHMİNİ ORTALAMA GLUKOZ</span>
           <div className="text-7xl font-black text-white">{eagMgdl}</div>
           <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">mg / dL</span>
           <span className="text-[11px] font-bold text-blue-300/80 uppercase tracking-widest mt-3">{eagMmol} mmol / L</span>
        </div>

        {/* YORUMLAMA PANELİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className={`text-center p-4 rounded-xl font-black italic uppercase tracking-tight ${interpretation.bg} ${interpretation.color}`}>
             {interpretation.label}
           </div>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-slate-900/5 p-6 rounded-[2rem] border border-slate-200 space-y-4">
          <ToolShare params={shareParams} />
          <p className="text-[9px] text-blue-900/60 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic">
            ⚠️ Formül (ADA/NGSP): eAG (mg/dL) = 28.7 × A1c - 46.7. Hemoglobinopati, anemi, hemodiyaliz gibi eritrosit ömrünü etkileyen durumlarda HbA1c ve eAG uyumsuz olabilir.
          </p>
        </div>

      </div>
    </div>
  );
}
