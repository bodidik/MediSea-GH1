"use client";

import React, { useState, useMemo } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import { egfrCkdEpi2021, Sex } from "@/app/tools/lib/calc-utils";

/** * eGFR (CKD-EPI 2021) Gündüz Modu (Sakin Deniz)
 * Race-Free (Irk Faktörü İçermeyen) Modern Standart
 */

export default function EgfrPage() {
  const [scr, setScr] = useState<number>(1.0);
  const [age, setAge] = useState<number>(45);
  const [sex, setSex] = useState<Sex>("male");

  // lib içindeki o meşhur race-free formülü çağırıyoruz
  const result = useMemo(() => egfrCkdEpi2021(scr, age, sex), [scr, age, sex]);

  // Evreleme ve Klinik Yorumlama
  const interpretation = useMemo(() => {
    if (result >= 90) return { label: "G1: Normal veya Yüksek", color: "text-emerald-700", bg: "bg-emerald-50" };
    if (result >= 60) return { label: "G2: Hafif Azalmış", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (result >= 45) return { label: "G3a: Hafif-Orta Azalmış", color: "text-amber-700", bg: "bg-amber-50" };
    if (result >= 30) return { label: "G3b: Orta-İleri Azalmış", color: "text-orange-700", bg: "bg-orange-50" };
    if (result >= 15) return { label: "G4: İleri Derece Azalmış", color: "text-rose-700", bg: "bg-rose-50" };
    return { label: "G5: Böbrek Yetmezliği", color: "text-rose-900", bg: "bg-rose-100" };
  }, [result]);

  const shareParams = { scr, age, sex };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BAŞLIK VE GÜNEŞ DETAYI */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🧪
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">eGFR (CKD-EPI 2021)</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Irk Faktörü İçermeyen eGFR Analizi</p>
          </div>
        </div>

        {/* INPUT KARTLARI */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Serum Kreatinin (mg/dL)</span>
            <input 
              type="number" step="0.1" value={scr} onChange={(e) => setScr(parseFloat(e.target.value || "0"))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Yaş</span>
            <input 
              type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value || "0"))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Cinsiyet</span>
            <select 
              value={sex} onChange={(e) => setSex(e.target.value as Sex)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg appearance-none cursor-pointer"
            >
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
            </select>
          </label>
        </div>

        {/* SONUÇ PANELİ: LACİVERT & ALTIN */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">2021</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">HESAPLANAN eGFR</span>
           <div className="text-7xl font-black text-white drop-shadow-lg">{result}</div>
           <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">mL / dak / 1.73 m²</span>
        </div>

        {/* EVRELEME PANELİ */}
        <div className={`p-6 rounded-[2rem] border border-blue-900/5 shadow-sm text-center ${interpretation.bg}`}>
           <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest block mb-1 text-center">KDIGO EVRELEMESİ</span>
           <p className={`text-xl font-black italic tracking-tight ${interpretation.color}`}>
             {interpretation.label}
           </p>
        </div>

        {/* PAYLAŞIM VE AKADEMİK NOT */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={shareParams} />
          </div>
          <div className="flex items-start gap-3 opacity-70">
            <span className="text-amber-500 text-lg">ℹ️</span>
            <p className="text-[9px] text-blue-950 font-bold uppercase tracking-[0.12em] leading-relaxed italic">
              Bu hesaplayıcı, KDIGO tarafından önerilen ve ırk katsayısını dışlayan en güncel CKD-EPI 2021 formülünü kullanır. Klinik kararlarda albüminüri ve hastanın bireysel durumu mutlaka göz önünde bulundurulmalıdır.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}