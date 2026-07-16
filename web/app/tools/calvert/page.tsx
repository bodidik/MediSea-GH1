"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

export default function CalvertPage() {
  const [gfr, setGfr] = React.useState("90");
  const [auc, setAuc] = React.useState("5");

  const gfrNum = parseLocaleNumber(gfr);
  const aucNum = parseLocaleNumber(auc);
  const dose = Math.round(aucNum * (gfrNum + 25) * 10) / 10;

  const params = { gfr: gfrNum, auc: aucNum };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="calvert" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🎗️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Calvert Formülü</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Karboplatin AUC Bazlı Doz Hesaplama</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">GFR (mL/dak)</span>
            <input type="text" inputMode="decimal" value={gfr} onChange={e => setGfr(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Cockcroft-Gault veya ölçülmüş GFR — 125 mL/dak ile sınırlandırılır</span>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Hedef AUC (mg/mL·dak)</span>
            <input type="text" inputMode="decimal" value={auc} onChange={e => setAuc(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tipik: 4–6 (monoterapi/kombinasyona göre)</span>
          </label>
        </div>

        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">AUC</div>
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">TOPLAM DOZ</span>
          <div className="text-7xl font-black text-white drop-shadow-lg">{dose || "–"}</div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">mg (mutlak doz)</span>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Calvert formülü: Doz (mg) = AUC × (GFR + 25). Bazı protokollerde GFR 125 mL/dak ile sınırlandırılır (aşırı dozu önlemek için). Doz hesabı, kurumun kemoterapi protokolüne göre teyit edilmelidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
