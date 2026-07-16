"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const CPS_OPTS = [
  ["Tahmini sağkalım > 12 hafta", 0],
  ["Tahmini sağkalım 11–12 hafta", 2],
  ["Tahmini sağkalım 9–10 hafta", 2.5],
  ["Tahmini sağkalım 7–8 hafta", 2.5],
  ["Tahmini sağkalım 5–6 hafta", 4.5],
  ["Tahmini sağkalım 3–4 hafta", 6],
  ["Tahmini sağkalım 1–2 hafta", 8.5],
] as const;

const KPS_OPTS = [["KPS ≥ 30", 0], ["KPS 10–20", 2.5]] as const;
const WBC_OPTS = [["Normal (≤8.500/mm³)", 0], ["Yüksek (8.500–11.000)", 0.5], ["Çok Yüksek (> 11.000)", 1.5]] as const;
const LYM_OPTS = [["Normal (%20–40)", 0], ["Düşük (%12–19.9)", 1], ["Çok Düşük (< %12)", 2.5]] as const;

export default function PapScorePage() {
  const [cps,     setCps]     = React.useState(0);
  const [kps,     setKps]     = React.useState(0);
  const [anorexia,setAnorexia]= React.useState(false);
  const [dyspnea, setDyspnea] = React.useState(false);
  const [wbc,     setWbc]     = React.useState(0);
  const [lym,     setLym]     = React.useState(0);

  const score = cps + kps + (anorexia ? 1.5 : 0) + (dyspnea ? 1 : 0) + wbc + lym;
  const rounded = Math.round(score * 10) / 10;

  const getGroup = () => {
    if (rounded <= 5.5)  return { group: "A", label: "30 GÜNLÜK SAĞKALIM > %70", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (rounded <= 11)   return { group: "B", label: "30 GÜNLÜK SAĞKALIM ~%30–70", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return               { group: "C", label: "30 GÜNLÜK SAĞKALIM < %30", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const r = getGroup();
  const params = { cps, kps, an: anorexia?1:"", dy: dyspnea?1:"", wbc, lym };

  const RadioGroup = ({ label, opts, value, onChange }: { label: string; opts: readonly (readonly [string, number])[]; value: number; onChange: (v: number) => void }) => (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
      <span className="text-sm font-bold text-blue-900/80 block">{label}</span>
      <div className="grid gap-1.5">
        {opts.map(([l, v]) => (
          <label key={v + l} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all
            ${value === v ? 'bg-blue-900 border-blue-900' : 'bg-white border-slate-100 hover:border-blue-900/30'}`}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
              ${value === v ? 'border-amber-400 bg-amber-400' : 'border-slate-300'}`}>
              {value === v && <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />}
            </div>
            <input type="radio" className="hidden" checked={value === v} onChange={() => onChange(v)} />
            <span className={`text-[12px] font-bold flex-1 ${value === v ? 'text-white' : 'text-blue-900/70'}`}>{l}</span>
            <span className={`text-[10px] font-black ${value === v ? 'text-amber-400' : 'text-slate-400'}`}>+{v}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const CheckRow = ({ label, sub, pts, checked, onChange }: { label: string; sub: string; pts: number; checked: boolean; onChange: () => void }) => (
    <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
      ${checked ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center
          ${checked ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div>
          <span className={`text-sm font-bold block ${checked ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>{label}</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${checked ? 'text-blue-200/60' : 'text-slate-400'}`}>{sub}</span>
        </div>
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <span className={`text-[10px] font-black shrink-0 ${checked ? 'text-amber-400' : 'text-slate-400'}`}>+{pts}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="pap-score" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🕊️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">PaP Score</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Palyatif Prognostik Skor — 30 Günlük Sağkalım</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <RadioGroup label="Klinisyen Sağkalım Tahmini (CPS)" opts={CPS_OPTS} value={cps} onChange={setCps} />
          <RadioGroup label="Karnofsky Performans Skoru" opts={KPS_OPTS} value={kps} onChange={setKps} />
          <CheckRow label="Anoreksi" sub="İştahsızlık mevcut" pts={1.5} checked={anorexia} onChange={() => setAnorexia(v => !v)} />
          <CheckRow label="İstirahat Dispnesi" sub="Dinlenirken nefes darlığı" pts={1} checked={dyspnea} onChange={() => setDyspnea(v => !v)} />
          <RadioGroup label="Lökosit Sayısı" opts={WBC_OPTS} value={wbc} onChange={setWbc} />
          <RadioGroup label="Lenfosit Yüzdesi" opts={LYM_OPTS} value={lym} onChange={setLym} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">GRUP</span>
            <div className="text-5xl font-black text-white">{r.group}</div>
            <span className="text-[10px] font-black text-amber-300 mt-1">{rounded} puan</span>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${r.border} ${r.bg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">30 GÜNLÜK PROGNOZ</span>
            <p className={`text-xl font-black italic tracking-tight ${r.color}`}>{r.label}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              PaP skoru ileri evre kanserde 30 günlük sağkalımı tahmin eder. Klinisyen sağkalım tahmini (CPS) en güçlü bağımsız prediktördür. Grup C hastalar için yoğun palyatif bakım ve hospis yönlendirmesi değerlendirilmelidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
