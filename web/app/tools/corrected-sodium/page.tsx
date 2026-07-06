"use client";

import React, { useState, useMemo } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import { correctedSodium, parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/** * Hiperglisemide Düzeltilmiş Sodyum Gündüz Modu (Sakin Deniz)
 * Formül (Katz): Na_düzeltilmiş = Na + 1.6 * ((Glukoz - 100) / 100)
 */

export default function CorrectedSodiumPage() {
  const [na, setNa] = useState<string>("130");
  const [glucose, setGlucose] = useState<string>("400");

  const naNum = parseLocaleNumber(na);
  const glucoseNum = parseLocaleNumber(glucose);

  const result = useMemo(() => correctedSodium(naNum, glucoseNum), [naNum, glucoseNum]);
  const delta = useMemo(() => Math.round((result - naNum) * 10) / 10, [result, naNum]);

  const shareParams = { na: naNum, glu: glucoseNum };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🧂
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Düzeltilmiş Sodyum</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Hiperglisemi Düzeltmesi (Katz Formülü)</p>
          </div>
        </div>

        {/* INPUT KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ölçülen Sodyum (mEq/L)</span>
            <input
              type="text" inputMode="decimal" value={na} onChange={(e) => setNa(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-900 outline-none font-black text-xl transition-all"
            />
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Glukoz (mg/dL)</span>
            <input
              type="text" inputMode="decimal" value={glucose} onChange={(e) => setGlucose(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-900 outline-none font-black text-xl transition-all"
            />
          </div>
        </div>

        {/* SONUÇ PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black">Na</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">DÜZELTİLMİŞ SODYUM</span>
           <div className="text-7xl font-black text-white">{result}</div>
           <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">mEq / L</span>
           {glucoseNum > 100 && (
             <span className="text-[9px] font-bold text-blue-300/70 uppercase tracking-widest mt-3">Ölçülen değere göre fark: +{delta} mEq/L</span>
           )}
        </div>

        {/* YORUMLAMA PANELİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className={`text-center p-4 rounded-xl font-black italic uppercase tracking-tight ${
             result > 145 ? 'bg-rose-50 text-rose-700' :
             result < 135 ? 'bg-amber-50 text-amber-700' :
             'bg-emerald-50 text-emerald-700'
           }`}>
             {result > 145 ? "Düzeltilmiş Hipernatremi" : result < 135 ? "Düzeltilmiş Hiponatremi" : "Normal Sınırlar"}
           </div>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-slate-900/5 p-6 rounded-[2rem] border border-slate-200 space-y-4">
          <ToolShare params={shareParams} />
          <p className="text-[9px] text-blue-900/60 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic">
            ⚠️ Formül (Katz): Na + 1.6 × ((Glukoz - 100) / 100). Ciddi hiperglisemide (&gt;400 mg/dL) bazı kaynaklar 2.4 katsayısını önerir — sonuç, gerçek serbest su açığını değerlendirmede bir başlangıç noktasıdır.
          </p>
        </div>

      </div>
    </div>
  );
}
