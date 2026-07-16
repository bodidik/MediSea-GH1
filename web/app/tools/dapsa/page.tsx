"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

export default function DapsaPage() {
  const [tjc, setTjc] = React.useState("");
  const [sjc, setSjc] = React.useState("");
  const [pain, setPain] = React.useState("");
  const [pga, setPga] = React.useState("");
  const [crp, setCrp] = React.useState("");

  const t = parseLocaleNumber(tjc);
  const s = parseLocaleNumber(sjc);
  const pa = parseLocaleNumber(pain);
  const p = parseLocaleNumber(pga);
  const c = parseLocaleNumber(crp);
  const score = t + s + pa + p + c;
  const hasResult = t > 0 || s > 0 || pa > 0 || p > 0 || c > 0;

  const getResult = () => {
    if (score <= 4)   return { label: "REMİSYON", sub: "DAPSA ≤ 4", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score <= 14)  return { label: "DÜŞÜK AKTİVİTE", sub: "DAPSA 5–14", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" };
    if (score <= 28)  return { label: "ORTA AKTİVİTE", sub: "DAPSA 15–28", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "YÜKSEK AKTİVİTE", sub: "DAPSA > 28", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = hasResult ? getResult() : null;
  const params = { t, s, pa, p, c };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="dapsa" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦴</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">DAPSA</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Disease Activity in PSoriatic Arthritis — Psoriatik Artrit Aktivite Skoru</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DAPSA = TJC + SJC + Ağrı + PGA + CRP</p>
          {[
            { label: "TJC — Hassas Eklem Sayısı (0–68)", value: tjc, set: setTjc, ph: "0–68" },
            { label: "SJC — Şiş Eklem Sayısı (0–66)", value: sjc, set: setSjc, ph: "0–66" },
            { label: "Hasta Ağrı Değerlendirme (0–10 cm VAS)", value: pain, set: setPain, ph: "0–10" },
            { label: "PGA — Hasta Genel Değerlendirme (0–10 cm VAS)", value: pga, set: setPga, ph: "0–10" },
            { label: "CRP (mg/dL)", value: crp, set: setCrp, ph: "ör. 0.8" },
          ].map(({ label, value, set, ph }) => (
            <label key={label} className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
              <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
          ))}

          {hasResult && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DAPSA SKORU</span>
              <span className="text-4xl font-black text-blue-900">{Math.round(score * 10) / 10}</span>
            </div>
          )}
        </div>

        {result && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">AKTİVİTE SINIFI</div>
            <p className={`text-2xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <p className={`text-sm font-bold mt-1 ${result.color} opacity-70`}>{result.sub}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { l: "Remisyon", r: "≤ 4", c: "bg-emerald-100 text-emerald-700" },
                { l: "Düşük", r: "5–14", c: "bg-sky-100 text-sky-700" },
                { l: "Orta", r: "15–28", c: "bg-amber-100 text-amber-700" },
                { l: "Yüksek", r: "> 28", c: "bg-rose-100 text-rose-700" },
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
              DAPSA yalnızca periferik eklem tutulumunu değerlendirir; deri (PASI), entezit, daktilit ve aksiyel tutulum dahil değildir. Minimal Disease Activity (MDA) kriterleriyle birlikte kullanın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
