"use client";

import React, { useState } from "react";
import ToolShare from "../components/ToolShare";

/** * MediSea Donanması - Nütrisyon Üssü
 * Enerji ve Protein Gereksinimi Hesaplayıcısı (ESPEN Bazlı)
 */

export default function NutritionNeedsPage() {
  const [weight, setWeight] = useState<number>(0);
  const [stressFactor, setStressFactor] = useState<number>(25); // kcal/kg default
  const [proteinFactor, setProteinFactor] = useState<number>(1.2); // g/kg default

  const energyResult = weight * stressFactor;
  const proteinResult = weight * proteinFactor;

  const stressLevels = [
    { label: "Normal / Stabil (Bazal)", kcal: 25, pro: 1.0 },
    { label: "Akut Hastalık / Post-Op", kcal: 30, pro: 1.2 },
    { label: "Ağır Sepsis / Travma / Yanık", kcal: 35, pro: 1.5 },
    { label: "Geriatrik / Malnütrisyonlu", kcal: 30, pro: 1.2 },
    { label: "Obezite (VKİ > 30) - Hipokalorik", kcal: 20, pro: 2.0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">⚖️</div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Nütrisyonel Reçete</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Enerji ve Protein Gereksinimi</p>
          </div>
        </div>

        {/* GİRDİ PANELİ */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
          
          {/* Ağırlık Girişi */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vücut Ağırlığı (kg)</span>
            <input 
              type="number" 
              placeholder="Örn: 70"
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full p-6 rounded-2xl bg-slate-50 border-none font-black text-2xl outline-none ring-2 ring-slate-100 focus:ring-amber-400 transition-all"
            />
            <p className="text-[9px] text-slate-400 font-bold italic uppercase leading-none">* Ödemli hastada 'kuru ağırlık', obez hastada 'ideal ağırlık' baz alınmalıdır.</p>
          </div>

          {/* Klinik Durum Seçimi */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klinik Durum (Şablonlar)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stressLevels.map((lvl) => (
                <button
                  key={lvl.label}
                  onClick={() => { setStressFactor(lvl.kcal); setProteinFactor(lvl.pro); }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${stressFactor === lvl.kcal ? 'border-blue-900 bg-blue-50 text-blue-900' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                >
                  <div className="text-[10px] font-black uppercase mb-1">{lvl.label}</div>
                  <div className="text-xs font-bold opacity-70">{lvl.kcal} kcal/kg | {lvl.pro} g/kg</div>
                </button>
              ))}
            </div>
          </div>

          {/* Manuel Ayar Sürgüleri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase">Enerji (kcal/kg)</span>
                <span className="text-sm font-black text-blue-900">{stressFactor}</span>
              </div>
              <input type="range" min="15" max="40" value={stressFactor} onChange={(e)=>setStressFactor(Number(e.target.value))} className="w-full accent-blue-900" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase">Protein (g/kg)</span>
                <span className="text-sm font-black text-blue-900">{proteinFactor}</span>
              </div>
              <input type="range" min="0.8" max="2.5" step="0.1" value={proteinFactor} onChange={(e)=>setProteinFactor(Number(e.target.value))} className="w-full accent-amber-500" />
            </div>
          </div>
        </div>

        {/* SONUÇ PANELİ - MEDISEA ZIRHI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-950 rounded-[2.5rem] p-8 text-center border-t-4 border-amber-400 shadow-2xl space-y-2">
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em]">Günlük Enerji Hedefi</span>
            <div className="text-5xl font-black text-white italic">{energyResult.toFixed(0)} <span className="text-xl not-italic text-blue-300">kcal</span></div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 text-center border-2 border-blue-900 shadow-xl space-y-2">
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.3em]">Günlük Protein Hedefi</span>
            <div className="text-5xl font-black text-blue-900 italic">{proteinResult.toFixed(1)} <span className="text-xl not-italic text-blue-400">g</span></div>
          </div>
        </div>

        {/* REÇETE NOTLARI */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <ToolShare params={{ w: weight, kcal: stressFactor, pro: proteinFactor }} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-blue-900 uppercase">Klinik İnciler 💡</h4>
              <ul className="text-[9px] text-slate-500 font-bold space-y-1 uppercase leading-tight">
                <li>• Refeeding sendromu riski varsa 10-15 kcal/kg ile başla.</li>
                <li>• Böbrek yetmezliği (Diyaliz dışı) ise proteini kısıtla (0.6-0.8 g/kg).</li>
                <li>• Kritik hastalarda protein hedefi enerji hedefinden daha önceliklidir.</li>
              </ul>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-500 text-lg">⚠️</span>
              <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.1em] leading-relaxed italic">
                Bu hesaplama ESPEN genel önerilerini yansıtır. Hastanın klinik gidişatına, organ fonksiyonlarına ve laboratuvar parametrelerine göre bireyselleştirilmelidir.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}