"use client";

import React, { useState, useMemo } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { bsaMosteller, parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/** * Vücut Yüzey Alanı (BSA) Gündüz Modu (Sakin Deniz)
 * Formül (Mosteller): BSA (m²) = sqrt((boy_cm * kilo_kg) / 3600)
 */

export default function BsaPage() {
  const [height, setHeight] = useState<string>("170");
  const [weight, setWeight] = useState<string>("70");

  const heightNum = parseLocaleNumber(height);
  const weightNum = parseLocaleNumber(weight);

  const result = useMemo(() => bsaMosteller(heightNum, weightNum), [heightNum, weightNum]);

  const shareParams = { h: heightNum, w: weightNum };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        <ToolTopNav toolSlug="bsa" />

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            📐
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Vücut Yüzey Alanı (BSA)</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Mosteller Formülü — Kemoterapi Dozlama Amaçlı</p>
          </div>
        </div>

        {/* INPUT KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Boy (cm)</span>
            <input
              type="text" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-900 outline-none font-black text-xl transition-all"
            />
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kilo (kg)</span>
            <input
              type="text" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-900 outline-none font-black text-xl transition-all"
            />
          </div>
        </div>

        {/* SONUÇ PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">BSA</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">VÜCUT YÜZEY ALANI</span>
           <div className="text-7xl font-black text-white">{result}</div>
           <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">m²</span>
        </div>

        {/* NOT PANELİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className="text-center p-4 rounded-xl font-bold text-slate-500 bg-slate-50 text-xs uppercase tracking-widest">
             Tipik yetişkin aralığı yaklaşık 1.6 – 1.9 m² (bireysel farklılık gösterir)
           </div>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-slate-900/5 p-6 rounded-[2rem] border border-slate-200 space-y-4">
          <ToolShare params={shareParams} />
          <p className="text-[9px] text-blue-900/60 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic">
            ⚠️ Formül (Mosteller): √((boy_cm × kilo_kg) / 3600). Kemoterapi ve bazı ilaç dozlamalarında kullanılır; ekstrem kilo/boy değerlerinde (morbid obezite, kaşeksi) klinik protokolünüzü kontrol edin.
          </p>
        </div>

      </div>
    </div>
  );
}
