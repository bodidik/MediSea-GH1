"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const PPS_OPTS = [["≥ 60", 0], ["30–50", 2.5], ["10–20", 4]] as const;
const INTAKE_OPTS = [["Normal veya hafif azalmış", 0], ["Orta derecede azalmış", 1], ["Ağır derecede azalmış (yudum/ağız bakımı)", 2.5]] as const;

export default function PpiPage() {
  const [pps,     setPps]     = React.useState(0);
  const [intake,  setIntake]  = React.useState(0);
  const [edema,   setEdema]   = React.useState(false);
  const [dyspnea, setDyspnea] = React.useState(false);
  const [delirium,setDelirium]= React.useState(false);

  const score = pps + intake + (edema ? 1 : 0) + (dyspnea ? 3.5 : 0) + (delirium ? 6 : 0);
  const rounded = Math.round(score * 10) / 10;

  const getInterp = () => {
    if (rounded > 6)  return { label: "< 3 HAFTA (Yüksek olasılık)",  sub: "Özgüllük ~%80 — terminal dönem", color: "text-rose-700",   bg: "bg-rose-50",   border: "border-rose-200" };
    if (rounded > 4)  return { label: "< 6 HAFTA (Orta olasılık)",    sub: "Özgüllük ~%80",                 color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" };
    return              { label: "≥ 6 HAFTA",                          sub: "Daha uzun hayatta kalma olası", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  };
  const r = getInterp();
  const params = { pps, intake, edema: edema?1:"", dyspnea: dyspnea?1:"", delirium: delirium?1:"" };

  const SelectRow = ({ label, opts, value, onChange }: { label: string; opts: readonly (readonly [string, number])[]; value: number; onChange: (v: number) => void }) => (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
      <span className="text-sm font-bold text-blue-900/80 block">{label}</span>
      <div className="grid gap-1.5">
        {opts.map(([l, v]) => (
          <label key={v} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all
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
        <ToolTopNav toolSlug="ppi" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🕊️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">PPI — Palyatif Prognostik İndeks</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Terminal Kanserde Hayatta Kalma Tahmini</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <SelectRow label="PPS Skoru" opts={PPS_OPTS} value={pps} onChange={setPps} />
          <SelectRow label="Oral Alım" opts={INTAKE_OPTS} value={intake} onChange={setIntake} />
          <CheckRow label="Ödem" sub="Tümör ilişkili, tedaviye dirençli" pts={1} checked={edema} onChange={() => setEdema(v => !v)} />
          <CheckRow label="İstirahat Dispnesi" sub="Dinlenirken nefes darlığı" pts={3.5} checked={dyspnea} onChange={() => setDyspnea(v => !v)} />
          <CheckRow label="Deliryum" sub="Deliryum veya bilinç bulanıklığı" pts={6} checked={delirium} onChange={() => setDelirium(v => !v)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">PPI</span>
            <div className="text-5xl font-black text-white">{rounded}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${r.border} ${r.bg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">TAHMİNİ HAYATTA KALMA</span>
            <p className={`text-xl font-black italic tracking-tight ${r.color}`}>{r.label}</p>
            <p className={`text-sm font-bold mt-1 ${r.color} opacity-80`}>{r.sub}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              PPI hospis kabulü ve bakım planlaması için geliştirilmiştir. Skor &gt;6 → 3 haftadan az, Skor &gt;4 → 6 haftadan az hayatta kalma olasılığı %80 özgüllükle öngörülür.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
