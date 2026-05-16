"use client";

import React, { useState, useMemo } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import { correctedCalciumMgdl } from "@/app/tools/lib/calc-utils";

/** * Düzeltilmiş Kalsiyum (Payne Formülü) Gündüz Modu
 * Formül: Measured Ca + 0.8 * (4.0 - Albumin)
 */

export default function CorrectedCalciumPage() {
  const [ca, setCa] = useState<number>(8.5);
  const [alb, setAlb] = useState<number>(4.0);

  // lib içindeki formülü kullanıyoruz
  const result = useMemo(() => correctedCalciumMgdl(ca, alb), [ca, alb]);

  const shareParams = { ca, alb };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🥛
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Düzeltilmiş Kalsiyum</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Albumin Bazlı Ca²⁺ Düzeltmesi (Payne)</p>
          </div>
        </div>

        {/* INPUT KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ölçülen Kalsiyum (mg/dL)</span>
            <input 
              type="number" step="0.1" value={ca} onChange={(e) => setCa(parseFloat(e.target.value || "0"))}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-900 outline-none font-black text-xl transition-all"
            />
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Albumin (g/dL)</span>
            <input 
              type="number" step="0.1" value={alb} onChange={(e) => setAlb(parseFloat(e.target.value || "0"))}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-900 outline-none font-black text-xl transition-all"
            />
          </div>
        </div>

        {/* SONUÇ PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black">Ca</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">HESAPLANAN DÜZELTİLMİŞ DEĞER</span>
           <div className="text-7xl font-black text-white">{result}</div>
           <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">mg / dL</span>
        </div>

        {/* YORUMLAMA PANELİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className={`text-center p-4 rounded-xl font-black italic uppercase tracking-tight ${
             result > 10.5 ? 'bg-rose-50 text-rose-700' : 
             result < 8.5 ? 'bg-amber-50 text-amber-700' : 
             'bg-emerald-50 text-emerald-700'
           }`}>
             {result > 10.5 ? "Hiperkalsemi" : result < 8.5 ? "Hipokalsemi" : "Normal Sınırlar"}
           </div>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-slate-900/5 p-6 rounded-[2rem] border border-slate-200 space-y-4">
          <ToolShare params={shareParams} />
          <p className="text-[9px] text-blue-900/60 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic">
            ⚠️ Formül: Ölçülen Ca + 0.8 * (4.0 - Albumin). Hiponatremi veya asidoz/alkaloz durumlarında iyonize kalsiyum bakılması önerilir.
          </p>
        </div>

      </div>
    </div>
  );
}