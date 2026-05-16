"use client";

import React from "react";

/** * İnfüzyon Hesapları Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

function round(n: number, dp = 2) {
  return Math.round(n * Math.pow(10, dp)) / Math.pow(10, dp);
}

export default function InfusionPage() {
  // 1) mL/saat ↔ gtt/dk
  const [rateMlHr, setRateMlHr] = React.useState<number>(0);
  const [dropFactor, setDropFactor] = React.useState<number>(20); 
  const gttPerMin = React.useMemo(() => round((rateMlHr * dropFactor) / 60, 1), [rateMlHr, dropFactor]);

  // 2) Doz (mg/kg/dk) ↔ mL/saat
  const [weightKg, setWeightKg] = React.useState<number>(70);
  const [doseMgKgMin, setDoseMgKgMin] = React.useState<number>(0);
  const [concentrationMgMl, setConcentrationMgMl] = React.useState<number>(1); 

  const mlPerHrFromDose = React.useMemo(() => {
    const mgPerMin = doseMgKgMin * weightKg;
    const mgPerHr = mgPerMin * 60;
    if (!concentrationMgMl || concentrationMgMl <= 0) return 0;
    return round(mgPerHr / concentrationMgMl, 2);
  }, [doseMgKgMin, weightKg, concentrationMgMl]);

  return (
    // SAKİN DENİZ: bg-slate-50 | text-blue-950
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BAŞLIK VE GÜNEŞ DETAYI */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">💉</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">İNFÜZYON HESAPLARI</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Hız ve Dozaj Hesaplama Asistanı</p>
          </div>
        </div>

        {/* BÖLÜM 1: mL/saat ↔ gtt/dk */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-l-4 border-amber-400 pl-4">
             <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Hız Dönüşümü (mL/saat ↔ gtt/dk)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Hız (mL/saat)</span>
                <input 
                  type="number" 
                  value={rateMlHr} 
                  onChange={e => setRateMlHr(parseFloat(e.target.value || "0"))} 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none transition-all font-bold"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Set Faktörü (gtt/mL)</span>
                <input 
                  type="number" 
                  value={dropFactor} 
                  onChange={e => setDropFactor(parseFloat(e.target.value || "0"))} 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none transition-all font-bold"
                />
                <span className="text-[9px] text-blue-900/40 font-bold uppercase tracking-tighter">Standart Makro: 20 · Mikro: 60</span>
              </label>
            </div>

            <div className="bg-blue-900 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl border-b-4 border-amber-400">
               <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">HESAPLANAN AKIŞ</span>
               <div className="text-4xl font-black text-white">{gttPerMin}</div>
               <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-1">DAMLA / DAKİKA</span>
            </div>
          </div>
        </div>

        {/* BÖLÜM 2: Doz ↔ Hız */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-l-4 border-blue-900 pl-4">
             <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Dozaj Analizi (mg/kg/dk ↔ mL/saat)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Vücut Ağırlığı (kg)</span>
              <input 
                type="number" value={weightKg} onChange={e => setWeightKg(parseFloat(e.target.value || "0"))} 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Hedef Doz (mg/kg/dk)</span>
              <input 
                type="number" value={doseMgKgMin} onChange={e => setDoseMgKgMin(parseFloat(e.target.value || "0"))} 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Konsantrasyon (mg/mL)</span>
              <input 
                type="number" value={concentrationMgMl} onChange={e => setConcentrationMgMl(parseFloat(e.target.value || "0"))} 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold"
              />
            </label>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-blue-900/10 flex flex-col items-center justify-center">
             <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-1">POMPA AYARI</span>
             <div className="text-4xl font-black text-blue-900">{mlPerHrFromDose}</div>
             <span className="text-[10px] font-bold text-blue-900/60 uppercase tracking-widest mt-1">mL / SAAT</span>
          </div>
        </div>

        {/* ALT PANEL: UYARI VE GÜVENLİK */}
        <div className="bg-blue-900/5 p-6 rounded-[2rem] border border-blue-900/10 flex items-start gap-4">
          <span className="text-amber-500 text-xl animate-pulse">⚠️</span>
          <p className="text-[10px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic opacity-80">
            Bu hesaplama eğitim ve referans amaçlıdır. Klinik uygulamada ilaç protokollerindeki spesifik hedef dozlar, dilüsyon oranları ve pompa kalibrasyonları mutlaka çift kontrol edilmelidir.
          </p>
        </div>

      </div>
    </div>
  );
}