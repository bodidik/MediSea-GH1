// app/tools/egfr/page.tsx
"use client";

import React, { useState } from "react";
import { egfrCkdEpi2021, Sex } from "@/app/tools/lib/calc-utils";

export default function EgfrPage() {
  const [scr, setScr] = useState(1.0);
  const [age, setAge] = useState(45);
  const [sex, setSex] = useState<Sex>("male");

  const result = egfrCkdEpi2021(scr, age, sex);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* BAŞLIK: GÜNDÜZ MODU */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🧪
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic">eGFR (CKD-EPI 2021)</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Böbrek Fonksiyon Analizi (Race-Free)</p>
          </div>
        </div>

        {/* INPUT PANELİ */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Serum Kreatinin (mg/dL)</span>
            <input 
              type="number" step="0.1" value={scr} onChange={(e) => setScr(parseFloat(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Yaş</span>
            <input 
              type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Cinsiyet</span>
            <select 
              value={sex} onChange={(e) => setSex(e.target.value as Sex)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold appearance-none"
            >
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
            </select>
          </label>
        </div>

        {/* SONUÇ KUTUSU: LACİVERT & ALTIN */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-2xl border-t-8 border-amber-400 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-8xl font-black">2021</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">HESAPLANAN eGFR</span>
           <div className="text-7xl font-black text-white">{result}</div>
           <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">mL / dak / 1.73 m²</span>
        </div>

        {/* BİLİMSEL NOT PANELİ */}
        <div className="bg-blue-900/5 p-6 rounded-[2rem] border border-blue-900/10 space-y-3">
          <p className="text-[11px] text-blue-950 font-bold leading-relaxed">
            <span className="text-amber-600">ℹ️ Bilimsel Not:</span> Bu hesaplayıcı, 2021 yılında güncellenen **ırk faktörü içermeyen** CKD-EPI modelini kullanır. 2009 modeline kıyasla, farklı etnik gruplarda daha adil ve tutarlı sonuçlar verdiği kabul edilmektedir.
          </p>
        </div>

      </div>
    </div>
  );
}