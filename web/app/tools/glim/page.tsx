"use client";

import React, { useState } from "react";
import ToolShare from "../components/ToolShare";

/** * MediSea Donanması - Nütrisyon Üssü
 * GLIM - Global Leadership Initiative on Malnutrition
 * Tanı Kriterleri Sentezi
 */

export default function GLIMPage() {
  const [phenotype, setPhenotype] = useState({ weight: 0, bmi: 0, muscle: 0 });
  const [etiology, setEtiology] = useState({ intake: 0, inflammation: 0 });

  // GLIM Tanı Şartı: En az 1 Fenotipik + En az 1 Etiyolojik kriter
  const hasPhenotype = phenotype.weight > 0 || phenotype.bmi > 0 || phenotype.muscle > 0;
  const hasEtiology = etiology.intake > 0 || etiology.inflammation > 0;
  const isDiagnosed = hasPhenotype && hasEtiology;

  // Şiddet Belirleme (Fenotipik kriterlerin en ağırı baz alınır)
  const severityScore = Math.max(phenotype.weight, phenotype.bmi, phenotype.muscle);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">📊</div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">GLIM Tanı Seti</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Malnütrisyon Tanı Kriterleri</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* FENOTİPİK KRİTERLER */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b pb-2 flex items-center justify-between">
              1. Fenotipik Kriterler <span>{hasPhenotype ? '✅' : '❌'}</span>
            </h2>
            
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kilo Kaybı</span>
                <select onChange={(e)=>setPhenotype({...phenotype, weight: Number(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 text-xs font-bold outline-none border-none ring-2 ring-slate-100 focus:ring-amber-400">
                  <option value="0">Yok / Anlamsız</option>
                  <option value="1">Evre 1 (Hafif-Orta): 6 ayda %5-10 veya >6 ayda %10-20</option>
                  <option value="2">Evre 2 (Şiddetli): 6 ayda >%10 veya >6 ayda >%20</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Düşük VKİ (kg/m²)</span>
                <select onChange={(e)=>setPhenotype({...phenotype, bmi: Number(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 text-xs font-bold outline-none border-none ring-2 ring-slate-100 focus:ring-amber-400">
                  <option value="0">Normal</option>
                  <option value="1">Evre 1: &lt;20 (70y altı) veya &lt;22 (70y üstü)</option>
                  <option value="2">Evre 2: &lt;18.5 (70y altı) veya &lt;20 (70y üstü)</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kas Kütlesinde Azalma</span>
                <select onChange={(e)=>setPhenotype({...phenotype, muscle: Number(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 text-xs font-bold outline-none border-none ring-2 ring-slate-100 focus:ring-amber-400">
                  <option value="0">Normal</option>
                  <option value="1">Evre 1: Hafif-Orta (Muayene/Görüntüleme)</option>
                  <option value="2">Evre 2: Şiddetli (Muayene/Görüntüleme)</option>
                </select>
              </label>
            </div>
          </div>

          {/* ETİYOLOJİK KRİTERLER */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b pb-2 flex items-center justify-between">
              2. Etiyolojik Kriterler <span>{hasEtiology ? '✅' : '❌'}</span>
            </h2>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gıda Alımı / Emilim Azalması</span>
                <select onChange={(e)=>setEtiology({...etiology, intake: Number(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 text-xs font-bold outline-none border-none ring-2 ring-slate-100 focus:ring-amber-400">
                  <option value="0">Yok</option>
                  <option value="1">Var: &gt;1 hafta &lt;%50 alım veya kronik GİS sorunları</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">İnflamasyon / Hastalık Yükü</span>
                <select onChange={(e)=>setEtiology({...etiology, inflammation: Number(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 text-xs font-bold outline-none border-none ring-2 ring-slate-100 focus:ring-amber-400">
                  <option value="0">Yok</option>
                  <option value="1">Var: Akut hastalık/travma veya kronik hastalıkla ilişkili inflamasyon</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* TANILAR VE ŞİDDET SONUCU */}
        <div className={`rounded-[2.5rem] p-8 border-4 transition-all duration-500 ${isDiagnosed ? 'bg-blue-900 border-amber-400 shadow-2xl' : 'bg-slate-200 border-slate-300'}`}>
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em]">GLIM TANISAL SONUÇ</span>
            <h2 className={`text-3xl font-black italic uppercase ${isDiagnosed ? 'text-white' : 'text-slate-400'}`}>
              {isDiagnosed ? "Malnütrisyon Tanısı Kondu" : "Tanı Kriterleri Karşılanmadı"}
            </h2>
            {isDiagnosed && (
              <div className="pt-4 mt-4 border-t border-white/10">
                <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest block mb-1">Şiddet Derecesi</span>
                <p className="text-xl font-black text-amber-400 uppercase italic">
                  {severityScore === 2 ? "EVRE 2 (ŞİDDETLİ MALNÜTRİSYON)" : "EVRE 1 (ORTA DERECE MALNÜTRİSYON)"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ALT NOTLAR */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <ToolShare params={{...phenotype, ...etiology}} />
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic text-center">
              GLIM tanısı için en az 1 fenotipik ve en az 1 etiyolojik kriterin varlığı şarttır. Tanı konulduktan sonra şiddet derecesi fenotipik kriterlere göre belirlenir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}