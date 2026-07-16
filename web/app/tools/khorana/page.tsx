"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

const CANCER_OPTS = [["Diğer", 0], ["Mide, Pankreas", 2], ["Akciğer, Lenfoma, Jinekolojik, Mesane, Testis", 1]] as const;

export default function KhoranaPage() {
  const [cancerSite, setCancerSite] = React.useState(0);
  const [platelet, setPlatelet] = React.useState("300");
  const [hgb, setHgb] = React.useState("12");
  const [esaUse, setEsaUse] = React.useState(false);
  const [wbc, setWbc] = React.useState("8");
  const [bmi, setBmi] = React.useState("24");

  const plt = parseLocaleNumber(platelet);
  const hgbNum = parseLocaleNumber(hgb);
  const wbcNum = parseLocaleNumber(wbc);
  const bmiNum = parseLocaleNumber(bmi);

  const score = cancerSite
    + (plt >= 350 ? 1 : 0)
    + ((hgbNum < 10 || esaUse) ? 1 : 0)
    + (wbcNum > 11 ? 1 : 0)
    + (bmiNum >= 35 ? 1 : 0);

  const getRisk = () => {
    if (score === 0) return { label: "DÜŞÜK RİSK", sub: "~%0.3–0.8 VTE riski (6 ay)", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score <= 2) return { label: "ORTA RİSK", sub: "~%1.8–2 VTE riski (6 ay)", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "YÜKSEK RİSK", sub: "~%6.7–7.1 VTE riski (6 ay)", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const r = getRisk();
  const params = { site: cancerSite, plt, hgb: hgbNum, esa: esaUse?1:"", wbc: wbcNum, bmi: bmiNum };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="khorana" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🎗️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Khorana Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Kemoterapi İlişkili VTE Riski</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-sm font-bold text-blue-900/80 block">Kanser Lokalizasyonu</span>
            <div className="grid gap-1.5">
              {CANCER_OPTS.map(([l, v]) => (
                <label key={v} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all
                  ${cancerSite === v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-slate-100 hover:border-blue-900/30'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                    ${cancerSite === v ? 'border-amber-400 bg-amber-400' : 'border-slate-300'}`}>
                    {cancerSite === v && <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />}
                  </div>
                  <input type="radio" className="hidden" checked={cancerSite === v} onChange={() => setCancerSite(v)} />
                  <span className={`text-[12px] font-bold flex-1 ${cancerSite === v ? 'text-white' : 'text-blue-900/70'}`}>{l}</span>
                  <span className={`text-[10px] font-black ${cancerSite === v ? 'text-amber-400' : 'text-slate-400'}`}>+{v}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trombosit (×10⁹/L)</span>
              <input type="text" inputMode="decimal" value={platelet} onChange={e => setPlatelet(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-sm outline-none focus:border-blue-900" />
            </label>
            <label className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hemoglobin (g/dL)</span>
              <input type="text" inputMode="decimal" value={hgb} onChange={e => setHgb(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-sm outline-none focus:border-blue-900" />
            </label>
            <label className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lökosit (×10⁹/L)</span>
              <input type="text" inputMode="decimal" value={wbc} onChange={e => setWbc(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-sm outline-none focus:border-blue-900" />
            </label>
            <label className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BMI (kg/m²)</span>
              <input type="text" inputMode="decimal" value={bmi} onChange={e => setBmi(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-sm outline-none focus:border-blue-900" />
            </label>
          </div>

          <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
            ${esaUse ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center
                ${esaUse ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <span className={`text-sm font-bold ${esaUse ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>Eritropoez Stimüle Edici Ajan (ESA) Kullanımı</span>
            </div>
            <input type="checkbox" className="hidden" checked={esaUse} onChange={() => setEsaUse(v => !v)} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">KHORANA</span>
            <div className="text-5xl font-black text-white">{score}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${r.border} ${r.bg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">RİSK</span>
            <p className={`text-2xl font-black italic tracking-tight ${r.color}`}>{r.label}</p>
            <p className={`text-sm font-bold mt-1 ${r.color} opacity-80`}>{r.sub}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Khorana skoru ayaktan kemoterapi alan hastalarda tromboprofilaksi kararını desteklemek için kullanılır. Skor ≥2 olan hastalarda ASCO/NCCN kılavuzları profilaktik antikoagülasyonu değerlendirmeyi önerir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
