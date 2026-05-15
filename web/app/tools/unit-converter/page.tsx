"use client";

import React, { useState, useEffect } from "react";
import { mgdlToMmol, mmolToMgdl, factor } from "@/app/tools/lib/calc-utils";

/** * Birim Çeviri Paneli - Gündüz Modu (Sakin Deniz)
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

type ConversionKind = keyof typeof factor.mmolFromMgdl;

const UNITS: { key: ConversionKind; label: string; icon: string }[] = [
  { key: "glucose", label: "Glikoz", icon: "🍬" },
  { key: "ureaNitrogen", label: "BUN (Üre Azotu)", icon: "🧪" },
  { key: "creatinine", label: "Kreatinin", icon: "🧬" },
  { key: "calcium", label: "Kalsiyum", icon: "🥛" },
];

export default function UnitConverterPage() {
  const [selectedUnit, setSelectedUnit] = useState<ConversionKind>("glucose");
  const [mgdlValue, setMgdlValue] = useState<string>("100");
  const [mmolValue, setMmolValue] = useState<string>("");

  // mg/dL değişince mmol/L hesapla
  useEffect(() => {
    const val = parseFloat(mgdlValue);
    if (!isNaN(val)) {
      setMmolValue(mgdlToMmol(val, selectedUnit).toString());
    } else {
      setMmolValue("");
    }
  }, [mgdlValue, selectedUnit]);

  // Manuel mmol/L girişi için ters çeviri
  const handleMmolChange = (val: string) => {
    setMmolValue(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setMgdlValue(mmolToMgdl(parsed, selectedUnit).toString());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🔄
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Birim Çevirici</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Laboratuvar Birim Dönüştürme Paneli</p>
          </div>
        </div>

        {/* BİRİM SEÇİMİ (NAVİGASYON) */}
        <div className="flex flex-wrap gap-3">
          {UNITS.map((u) => (
            <button
              key={u.key}
              onClick={() => setSelectedUnit(u.key)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2
                ${selectedUnit === u.key 
                  ? 'bg-blue-900 border-blue-900 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-white border-slate-200 text-slate-400 hover:border-blue-900/30'}
              `}
            >
              <span className="mr-2">{u.icon}</span> {u.label}
            </button>
          ))}
        </div>

        {/* ÇEVİRİ PANELİ */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* mg/dL Tarafı */}
            <div className="space-y-4 text-center md:text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">GELENEKSEL BİRİM</span>
              <div className="relative">
                <input 
                  type="number" 
                  value={mgdlValue}
                  onChange={(e) => setMgdlValue(e.target.value)}
                  className="w-full bg-slate-50 border-b-4 border-blue-900/10 text-5xl font-black text-blue-900 p-4 focus:border-amber-400 outline-none transition-all text-center md:text-left rounded-t-2xl"
                />
                <span className="absolute right-4 bottom-4 text-xs font-black text-blue-900/30 uppercase">mg / dL</span>
              </div>
            </div>

            {/* OK İkonu */}
            <div className="hidden md:flex items-center justify-center">
               <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-blue-900 shadow-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
               </div>
            </div>

            {/* mmol/L Tarafı */}
            <div className="space-y-4 text-center md:text-left">
              <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] block text-center md:text-right">SI BİRİMİ</span>
              <div className="relative">
                <input 
                  type="number" 
                  value={mmolValue}
                  onChange={(e) => handleMmolChange(e.target.value)}
                  className="w-full bg-blue-900 border-b-4 border-amber-400 text-5xl font-black text-white p-4 focus:border-white outline-none transition-all text-center md:text-right rounded-t-2xl shadow-xl"
                />
                <span className="absolute left-4 bottom-4 text-xs font-black text-blue-200/50 uppercase">mmol / L</span>
              </div>
            </div>

          </div>

          {/* Arka Plan Filigranı */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[15rem] font-black pointer-events-none select-none italic">
            SI
          </div>
        </div>

        {/* ALT BİLGİ VE UYARI */}
        <div className="bg-blue-900/5 p-6 rounded-[2rem] border border-blue-900/10 space-y-4">
           <div className="flex items-center gap-3">
             <span className="text-amber-500 animate-pulse">⚠️</span>
             <p className="text-[10px] text-blue-900 font-bold uppercase tracking-widest italic leading-relaxed">
               Birim çevrimleri klinik laboratuvar standartlarına (BUN katsayısı: 0.357, Glikoz katsayısı: 0.0555 vb.) göre hesaplanmaktadır.
             </p>
           </div>
        </div>

      </div>
    </div>
  );
}