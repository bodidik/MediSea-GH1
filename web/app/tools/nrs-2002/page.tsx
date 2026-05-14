"use client";

import React, { useState } from "react";
import ToolShare from "../components/ToolShare";

/** * MediSea Donanması - Nütrisyon Üssü
 * NRS-2002 Beslenme Riski Taraması
 */

export default function NRS2002Page() {
  const [initialRisk, setInitialRisk] = useState({ bmi: false, weightLoss: false, intake: false, severeIll: false });
  const [finalScore, setFinalScore] = useState({ nutrition: 0, severity: 0, age: 0 });

  const total = finalScore.nutrition + finalScore.severity + finalScore.age;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🍏</div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">NRS-2002</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Nutritional Risk Screening</p>
          </div>
        </div>

        {/* BÖLÜM 1: ÖN TARAMA */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-black text-blue-900 uppercase tracking-widest border-b pb-2">Aşama 1: Ön Tarama</h2>
          <div className="grid gap-2">
            {[
              { id: 'bmi', label: 'VKİ < 20.5 kg/m² mi?' },
              { id: 'weightLoss', label: 'Son 3 ayda kilo kaybı var mı?' },
              { id: 'intake', label: 'Geçen hafta alımında azalma var mı?' },
              { id: 'severeIll', label: 'Hasta ağır derecede hasta mı? (YBÜ vb.)' }
            ].map(q => (
              <button 
                key={q.id}
                onClick={() => setInitialRisk(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                className={`p-4 rounded-xl border text-left text-sm font-bold transition-all ${initialRisk[q.id] ? 'bg-blue-900 text-white' : 'bg-slate-50 text-slate-600'}`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* BÖLÜM 2: ANA TARAMA (Sadece biri 'Evet' ise anlamlıdır) */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-xs font-black text-blue-900 uppercase tracking-widest border-b pb-2">Aşama 2: Ana Tarama</h2>
          
          {/* Nütrisyonel Durum */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase">Beslenme Durumunda Bozulma</span>
            <select 
              onChange={(e) => setFinalScore(p => ({ ...p, nutrition: Number(e.target.value) }))}
              className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-sm outline-none ring-2 ring-slate-100 focus:ring-amber-400"
            >
              <option value="0">Normal (0 Puan)</option>
              <option value="1">Hafif: >%5 kilo kaybı veya < %50-75 alım (1 Puan)</option>
              <option value="2">Orta: >%5 kilo kaybı (2 ay) veya < %25-50 alım (2 Puan)</option>
              <option value="3">Ağır: >%5 kilo kaybı (1 ay) veya < %0-25 alım (3 Puan)</option>
            </select>
          </div>

          {/* Hastalık Şiddeti */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase">Hastalık Şiddeti</span>
            <select 
              onChange={(e) => setFinalScore(p => ({ ...p, severity: Number(e.target.value) }))}
              className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-sm outline-none ring-2 ring-slate-100 focus:ring-amber-400"
            >
              <option value="0">Normal (0 Puan)</option>
              <option value="1">Hafif: Kalça kırığı, kronik komplikasyonlar (1 Puan)</option>
              <option value="2">Orta: Major cerrahi, inme, ağır pnömoni (2 Puan)</option>
              <option value="3">Ağır: Kafa travması, KİT, YBÜ hastaları (3 Puan)</option>
            </select>
          </div>

          {/* Yaş Ayarı */}
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
             <span className="text-sm font-bold text-amber-900 uppercase italic">Yaş ≥ 70</span>
             <input 
              type="checkbox" 
              onChange={(e) => setFinalScore(p => ({ ...p, age: e.target.checked ? 1 : 0 }))}
              className="w-6 h-6"
             />
          </div>
        </div>

        {/* SONUÇ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-950 rounded-[2rem] p-6 text-center border-t-4 border-amber-400 shadow-xl">
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block mb-1">SKOR</span>
            <div className="text-5xl font-black text-white">{total}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex items-center justify-center border-2 border-dashed ${total >= 3 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            <p className="text-xl font-black uppercase italic text-center">
              {total >= 3 ? "NÜTRİSYONEL RİSK VAR" : "RİSK DÜŞÜK - HAFTALIK TAKİP"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <ToolShare params={{ n: finalScore.nutrition, s: finalScore.severity, a: finalScore.age }} />
          <p className="text-[9px] text-blue-900 font-bold uppercase opacity-60 italic text-center leading-relaxed">
            Skor ≥ 3 ise beslenme planı başlatılmalıdır. Risk saptanmazsa haftalık tarama tekrarlanır.
          </p>
        </div>
      </div>
    </div>
  );
}