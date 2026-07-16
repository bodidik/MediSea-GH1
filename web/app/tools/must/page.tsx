"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

const BMI_OPTS = [
  { v: 0, label: "> 20 kg/m²", sub: "Normal/Obez" },
  { v: 1, label: "18.5–20 kg/m²", sub: "Hafif düşük" },
  { v: 2, label: "< 18.5 kg/m²", sub: "Düşük" },
];
const LOSS_OPTS = [
  { v: 0, label: "< %5", sub: "Son 3–6 ayda" },
  { v: 1, label: "%5–10", sub: "Son 3–6 ayda" },
  { v: 2, label: "> %10", sub: "Son 3–6 ayda" },
];
const ACUTE_OPTS = [
  { v: 0, label: "Yok" },
  { v: 2, label: "Var — 5+ gün beslenemiyor / besinmez hasta" },
];

export default function MustPage() {
  const [bmiIdx, setBmiIdx]   = React.useState<number | null>(null);
  const [lossIdx, setLossIdx] = React.useState<number | null>(null);
  const [acute, setAcute]     = React.useState<number | null>(null);

  const score = bmiIdx !== null && lossIdx !== null && acute !== null
    ? BMI_OPTS[bmiIdx].v + LOSS_OPTS[lossIdx].v + acute
    : null;

  const getResult = (s: number) => {
    if (s === 0) return { label: "DÜŞÜK RİSK", sub: "Rutin klinik bakım. Erişkinde haftalık, toplumda aylık tekrar", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (s === 1) return { label: "ORTA RİSK", sub: "3 gün boyunca gıda ve sıvı alımını belgele, gerekirse diyet danışması", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "YÜKSEK RİSK", sub: "Diyetisyen/nütrisyon ekibi ile irtibata geç, nütrisyon desteği planla", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = score !== null ? getResult(score) : null;
  const params = { bmi: bmiIdx, loss: lossIdx, acute };

  const Radio = ({ opts, val, set }: { opts: { v: number; label: string; sub?: string }[]; val: number | null; set: (i: number) => void }) => (
    <div className="space-y-2">
      {opts.map((o, i) => (
        <button key={i} type="button" onClick={() => set(i)}
          className={`w-full text-left p-4 rounded-2xl border transition-all
            ${val === i ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
          <div className={`text-sm font-bold ${val === i ? 'text-white' : 'text-blue-950'}`}>{o.label}</div>
          {o.sub && <div className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${val === i ? 'text-blue-200/70' : 'text-slate-400'}`}>{o.sub} — +{o.v} puan</div>}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="must" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🍏</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">MUST</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Malnutrition Universal Screening Tool — Toplum & Poliklinik</p>
          </div>
        </div>

        {[
          { title: "ADIM 1 — BMI", opts: BMI_OPTS, val: bmiIdx, set: setBmiIdx },
          { title: "ADIM 2 — Kilo Kaybı (son 3–6 ay)", opts: LOSS_OPTS, val: lossIdx, set: setLossIdx },
          { title: "ADIM 3 — Akut Hastalık Etkisi", opts: ACUTE_OPTS, val: acute !== null ? (acute === 0 ? 0 : 1) : null, set: (i: number) => setAcute(ACUTE_OPTS[i].v) },
        ].map(({ title, opts, val, set }) => (
          <div key={title} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
            <p className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest mb-4">{title}</p>
            <Radio opts={opts} val={val} set={set} />
          </div>
        ))}

        {score !== null && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MUST SKORU</span>
            <span className="text-4xl font-black text-blue-900">{score}</span>
          </div>
        )}

        {result && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">MALNÜTRISYON RİSKİ</div>
            <p className={`text-2xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <p className={`text-sm font-bold mt-1 ${result.color} opacity-80`}>{result.sub}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { l: "Düşük", r: "0 puan", c: "bg-emerald-100 text-emerald-700" },
                { l: "Orta", r: "1 puan", c: "bg-amber-100 text-amber-700" },
                { l: "Yüksek", r: "≥ 2 puan", c: "bg-rose-100 text-rose-700" },
              ].map(x => (
                <div key={x.l} className={`rounded-xl p-2 text-center text-[9px] font-black uppercase tracking-widest ${x.c}`}>
                  <div>{x.l}</div>
                  <div className="font-bold normal-case tracking-normal mt-0.5">{x.r}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              MUST toplum ve poliklinik ortamı için geliştirilmiştir. Yatan hastalar için NRS-2002 tercih edilir. BMI ölçülemeyen hastalarda MAMC veya baldır çevresi kullanılabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
