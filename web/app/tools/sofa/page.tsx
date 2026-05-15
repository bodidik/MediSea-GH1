"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

/** * SOFA (Sequential Organ Failure Assessment) Gündüz Modu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

export default function SOFAPage() {
  const s = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  // --- STATE YÖNETİMİ ---
  const [pf, setPf] = React.useState<number>(parseFloat(s?.get("pf") || "400"));
  const [respSupport, setRespSupport] = React.useState<boolean>(s?.get("vent") === "1");
  const [plt, setPlt] = React.useState<number>(parseFloat(s?.get("plt") || "200"));
  const [bili, setBili] = React.useState<number>(parseFloat(s?.get("bili") || "1"));
  const [map, setMap] = React.useState<number>(parseFloat(s?.get("map") || "75"));
  const [pressor, setPressor] = React.useState<string>(s?.get("press") || "none");
  const [dose, setDose] = React.useState<number>(parseFloat(s?.get("dose") || "0"));
  const [gcs, setGcs] = React.useState<number>(parseFloat(s?.get("gcs") || "15"));
  const [cr, setCr] = React.useState<number>(parseFloat(s?.get("cr") || "1.0"));
  const [urine, setUrine] = React.useState<number>(parseFloat(s?.get("ur") || "1000"));

  // --- SKORLAMA MANTIKLARI (SENTEZ) ---
  const scoreResp = () => {
    if (pf >= 400) return 0;
    if (pf >= 300) return 1;
    if (pf >= 200) return 2;
    if (pf >= 100) return respSupport ? 3 : 2;
    return respSupport ? 4 : 3;
  };

  const scoreCoag = () => {
    if (plt >= 150) return 0;
    if (plt >= 100) return 1;
    if (plt >= 50) return 2;
    if (plt >= 20) return 3;
    return 4;
  };

  const scoreLiver = () => {
    if (bili < 1.2) return 0;
    if (bili < 2.0) return 1;
    if (bili < 6.0) return 2;
    if (bili < 12.0) return 3;
    return 4;
  };

  const scoreCardio = () => {
    if (pressor === "none") return map < 70 ? 1 : 0;
    if (pressor === "dobu") return 2;
    if (pressor === "dopa") {
      if (dose <= 5) return 2;
      if (dose <= 15) return 3;
      return 4;
    }
    if (pressor === "epi" || pressor === "norepi") {
      if (dose <= 0.1) return 3;
      return 4;
    }
    return 0;
  };

  const scoreCNS = () => {
    const g = clamp(gcs, 3, 15);
    if (g === 15) return 0;
    if (g >= 13) return 1;
    if (g >= 10) return 2;
    if (g >= 6) return 3;
    return 4;
  };

  const scoreRenal = () => {
    if (cr < 1.2 && urine >= 500) return 0;
    if (cr < 2.0 && urine >= 500) return 1;
    if (cr < 3.5 && urine >= 500) return 2;
    if (cr < 5.0 || (urine < 500 && urine >= 200)) return 3;
    return 4;
  };

  const scores = { resp: scoreResp(), coag: scoreCoag(), liv: scoreLiver(), car: scoreCardio(), cns: scoreCNS(), ren: scoreRenal() };
  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const params = { pf, vent: respSupport ? 1 : "", plt, bili, map, press: pressor, dose, gcs, cr, ur: urine };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🩺</div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">SOFA SKORU</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sıralı Organ Yetmezliği Değerlendirmesi</p>
          </div>
        </div>

        {/* ANALİZ PANELİ (SKOR KARTLARI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Solunum */}
          <section className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
               <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">1. SOLUNUM (P/F)</h2>
               <span className="bg-blue-900 text-white text-[10px] px-3 py-1 rounded-full font-black">+{scores.resp}</span>
            </div>
            <div className="space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">PaO₂ / FiO₂ Oranı</span>
                <input type="number" value={pf} onChange={e=>setPf(parseFloat(e.target.value||"0"))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-900 outline-none" />
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={respSupport} onChange={()=>setRespSupport(!respSupport)} className="w-4 h-4 rounded border-slate-300 text-blue-900" />
                <span className="text-[10px] font-bold text-slate-600 uppercase">Mekanik Ventilasyon / CPAP</span>
              </label>
            </div>
          </section>

          {/* Kardiyovasküler */}
          <section className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
               <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">2. KARDİYOVASKÜLER</h2>
               <span className="bg-blue-900 text-white text-[10px] px-3 py-1 rounded-full font-black">+{scores.car}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">MAP (mmHg)</span>
                <input type="number" value={map} onChange={e=>setMap(parseFloat(e.target.value||"0"))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-900 outline-none" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Vazopresör</span>
                <select value={pressor} onChange={e=>setPressor(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-900 outline-none">
                  <option value="none">Yok</option>
                  <option value="dobu">Dobutamin</option>
                  <option value="dopa">Dopamin</option>
                  <option value="epi">Epinefrin</option>
                  <option value="norepi">Norepinefrin</option>
                </select>
              </label>
              {pressor !== "none" && (
                <label className="flex flex-col gap-1 col-span-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Doz (µg/kg/dk)</span>
                  <input type="number" step="0.01" value={dose} onChange={e=>setDose(parseFloat(e.target.value||"0"))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold border-amber-400 outline-none" />
                </label>
              )}
            </div>
          </section>

          {/* Renal */}
          <section className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
               <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">3. RENAL</h2>
               <span className="bg-blue-900 text-white text-[10px] px-3 py-1 rounded-full font-black">+{scores.ren}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Kreatinin (mg/dL)</span>
                <input type="number" step="0.1" value={cr} onChange={e=>setCr(parseFloat(e.target.value||"0"))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-900 outline-none" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">İdrar (mL/gün)</span>
                <input type="number" value={urine} onChange={e=>setUrine(parseFloat(e.target.value||"0"))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-900 outline-none" />
              </label>
            </div>
          </section>

          {/* SSS, Koagülasyon, Karaciğer - Hızlı Inputlar */}
          <section className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
               <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">4. DİĞER SİSTEMLER</h2>
               <span className="bg-amber-400 text-blue-900 text-[10px] px-3 py-1 rounded-full font-black">TOPLU VERİ</span>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold text-slate-500 uppercase">GKS (3-15):</span>
                <input type="number" value={gcs} onChange={e=>setGcs(parseFloat(e.target.value||"0"))} className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold" />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Trombosit (10³/µL):</span>
                <input type="number" value={plt} onChange={e=>setPlt(parseFloat(e.target.value||"0"))} className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold" />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Bilirubin (mg/dL):</span>
                <input type="number" step="0.1" value={bili} onChange={e=>setBili(parseFloat(e.target.value||"0"))} className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold" />
              </label>
            </div>
          </section>
        </div>

        {/* NİHAİ SKOR PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-8xl font-black italic">SOFA</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2 text-center">TOPLAM ORGAN YETMEZLİĞİ SKORU</span>
           <div className="text-7xl font-black text-white drop-shadow-lg">{total}</div>
           <p className="mt-4 text-[10px] font-bold text-amber-400 uppercase tracking-widest text-center italic">
             Skor arttıkça hastane içi mortalite riski artar. (0-2: %10, >11: %95)
           </p>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Bu araç eğitim amaçlıdır. SOFA skoru hastanın klinik seyrini izlemek içindir. Tek başına tedavi kararı verdirmez; laboratuvar ve klinik bulgularla bir bütün olarak değerlendirilmelidir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}