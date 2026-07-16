"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const DUR_OPTS = [["< 10 dakika", 0], ["10–59 dakika", 1], ["≥ 60 dakika", 2]] as const;
const CLN_OPTS = [["Diğer semptomlar", 0], ["Konuşma bozukluğu (motor güç normal)", 1], ["Tek taraflı motor zayıflık", 2]] as const;

export default function Abcd2Page() {
  const [age, setAge]       = React.useState(false);   // ≥60 → +1
  const [bp, setBp]         = React.useState(false);   // ≥140/90 → +1
  const [cln, setCln]       = React.useState(0);       // 0/1/2
  const [dur, setDur]       = React.useState(0);       // 0/1/2
  const [dm, setDm]         = React.useState(false);   // DM → +1

  const score = (age ? 1 : 0) + (bp ? 1 : 0) + cln + dur + (dm ? 1 : 0);

  const getRisk = () => {
    if (score <= 3) return { label: "DÜŞÜK RİSK", sub: "2 günlük inme riski ~%1", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score <= 5) return { label: "ORTA RİSK", sub: "2 günlük inme riski ~%4", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "YÜKSEK RİSK", sub: "2 günlük inme riski ~%8", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const r = getRisk();
  const params = { a: age?1:"", b: bp?1:"", c: cln, d: dur, dm: dm?1:"" };

  const CheckRow = ({ label, sub, checked, onChange }: { label: string; sub: string; checked: boolean; onChange: () => void }) => (
    <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
      ${checked ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center
          ${checked ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div>
          <span className={`text-sm font-bold block ${checked ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>{label}</span>
          {sub && <span className={`text-[9px] font-bold uppercase tracking-widest ${checked ? 'text-blue-200/60' : 'text-slate-400'}`}>{sub}</span>}
        </div>
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <span className={`text-[10px] font-black tracking-widest ${checked ? 'text-amber-400' : 'text-slate-400'}`}>+1</span>
    </label>
  );

  const SelectRow = ({ label, opts, value, onChange }: { label: string; opts: readonly (readonly [string, number])[]; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <span className="text-sm font-bold text-blue-900/80 flex-1">{label}</span>
      <select value={value} onChange={e => onChange(Number(e.target.value))}
        className="text-sm font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none text-blue-950">
        {opts.map(([l, v]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <span className="text-[10px] font-black text-amber-500 w-10 text-right">+{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="abcd2" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🧠</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">ABCD² Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">TİA Sonrası Kısa Dönem İnme Riski</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-2">
          <CheckRow label="Yaş ≥ 60" sub="A — Age" checked={age} onChange={() => setAge(v => !v)} />
          <CheckRow label="KB ≥ 140/90 mmHg" sub="B — Blood Pressure" checked={bp} onChange={() => setBp(v => !v)} />
          <SelectRow label="Klinik Özellik" opts={CLN_OPTS} value={cln} onChange={setCln} />
          <SelectRow label="Semptom Süresi" opts={DUR_OPTS} value={dur} onChange={setDur} />
          <CheckRow label="Diyabetes Mellitus" sub="D — Diabetes" checked={dm} onChange={() => setDm(v => !v)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">ABCD²</span>
            <div className="text-5xl font-black text-white">{score}</div>
            <span className="text-[10px] font-black text-blue-300 mt-1">/ 7</span>
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
              ABCD² skoru TİA'dan sonra 2 günlük inme riskini tahmin eder. Güncel kılavuzlar orta–yüksek riskte (&gt;3) acil değerlendirme ve dual antiplatelet tedavi önermektedir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
