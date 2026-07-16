"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const AGE_OPTS    = [["<30",0],["30–39",8],["40–49",25],["50–59",41],["60–69",58],["70–79",75],["80–89",91],["≥90",100]] as const;
const HR_OPTS     = [["<50",0],["50–69",3],["70–89",9],["90–109",15],["110–149",24],["150–199",38],["≥200",46]] as const;
const SBP_OPTS    = [["<80",58],["80–99",53],["100–119",43],["120–139",34],["140–159",24],["160–199",10],["≥200",0]] as const;
const CR_OPTS     = [["0–0.39",1],["0.40–0.79",4],["0.80–1.19",7],["1.20–1.59",10],["1.60–1.99",13],["2.0–3.99",21],["≥4.0",28]] as const;
const KILLIP_OPTS = [["I — Belirti yok",0],["II — Bazal raller / S3",20],["III — Akut pulmoner ödem",39],["IV — Kardiyojenik şok",59]] as const;

type Sel = { age: number; hr: number; sbp: number; cr: number; killip: number; arrest: boolean; st: boolean; enzymes: boolean };

function risk(s: number) {
  if (s < 108) return { label: "DÜŞÜK RİSK", sub: "<%1 hastane içi mortalite", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (s <= 140) return { label: "ORTA RİSK", sub: "%1–3 hastane içi mortalite", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
  return { label: "YÜKSEK RİSK", sub: ">%3 hastane içi mortalite", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
}

function SelectRow({ label, opts, value, onChange }: { label: string; opts: readonly (readonly [string, number])[]; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <span className="text-sm font-bold text-blue-900/80 min-w-0 flex-1">{label}</span>
      <select value={value} onChange={e => onChange(Number(e.target.value))}
        className="text-sm font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-blue-900/40 text-blue-950 shrink-0">
        {opts.map(([lbl, pts]) => <option key={pts} value={pts}>{lbl}</option>)}
      </select>
      <span className="text-[10px] font-black text-amber-500 w-12 text-right shrink-0">+{value}</span>
    </div>
  );
}

function CheckRow({ label, sub, checked, onChange }: { label: string; sub: string; checked: boolean; onChange: () => void }) {
  return (
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
    </label>
  );
}

export default function GracePage() {
  const [s, setS] = React.useState<Sel>({ age: 41, hr: 9, sbp: 34, cr: 7, killip: 0, arrest: false, st: false, enzymes: false });
  const score = s.age + s.hr + s.sbp + s.cr + s.killip + (s.arrest ? 39 : 0) + (s.st ? 28 : 0) + (s.enzymes ? 14 : 0);
  const r = risk(score);
  const params = { age: s.age, hr: s.hr, sbp: s.sbp, cr: s.cr, k: s.killip, ar: s.arrest?1:"", st: s.st?1:"", en: s.enzymes?1:"" };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="grace" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">❤️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">GRACE 2.0</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">AKS / NSTEMI Hastane İçi Mortalite Riski</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Demografik & Hemodinamik</p>
          <SelectRow label="Yaş" opts={AGE_OPTS} value={s.age} onChange={v => setS(p => ({...p, age: v}))} />
          <SelectRow label="Kalp Hızı (atım/dk)" opts={HR_OPTS} value={s.hr} onChange={v => setS(p => ({...p, hr: v}))} />
          <SelectRow label="Sistolik KB (mmHg)" opts={SBP_OPTS} value={s.sbp} onChange={v => setS(p => ({...p, sbp: v}))} />
          <SelectRow label="Kreatinin (mg/dL)" opts={CR_OPTS} value={s.cr} onChange={v => setS(p => ({...p, cr: v}))} />
          <SelectRow label="Killip Sınıfı" opts={KILLIP_OPTS} value={s.killip} onChange={v => setS(p => ({...p, killip: v}))} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 mb-2">Klinik Bulgular</p>
          <CheckRow label="Başvuruda Kardiyak Arrest" sub="+39 puan" checked={s.arrest} onChange={() => setS(p => ({...p, arrest: !p.arrest}))} />
          <CheckRow label="ST Segment Değişikliği" sub="+28 puan" checked={s.st} onChange={() => setS(p => ({...p, st: !p.st}))} />
          <CheckRow label="Kardiyak Enzim Yüksekliği" sub="+14 puan" checked={s.enzymes} onChange={() => setS(p => ({...p, enzymes: !p.enzymes}))} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">GRACE</span>
            <div className="text-5xl font-black text-white">{score}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${r.border} ${r.bg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">RİSK KATEGORİSİ</span>
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
              GRACE skoru NSTEMI/UA'da hastane içi ve 6 aylık mortalite riskini tahmin eder. ESC kılavuzu: yüksek risk (&gt;140) → erken invazif strateji (&lt;24 saat).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
