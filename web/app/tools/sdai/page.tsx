"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

export default function SdaiPage() {
  const [tjc, setTjc] = React.useState("");
  const [sjc, setSjc] = React.useState("");
  const [pga, setPga] = React.useState("");
  const [ega, setEga] = React.useState("");
  const [crp, setCrp] = React.useState("");

  const t = parseLocaleNumber(tjc);
  const s = parseLocaleNumber(sjc);
  const p = parseLocaleNumber(pga);
  const e = parseLocaleNumber(ega);
  const c = parseLocaleNumber(crp);
  const score = t + s + p + e + c;
  const hasResult = t > 0 || s > 0 || p > 0 || e > 0 || c > 0;

  const getResult = () => {
    if (score <= 3.3)  return { label: "REMİSYON", sub: "SDAI ≤ 3.3", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score <= 11)   return { label: "DÜŞÜK AKTİVİTE", sub: "SDAI 3.4–11", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" };
    if (score <= 26)   return { label: "ORTA AKTİVİTE", sub: "SDAI 11.1–26", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "YÜKSEK AKTİVİTE", sub: "SDAI > 26", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = hasResult ? getResult() : null;
  const params = { t, s, p, e, c };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="sdai" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦴</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">SDAI</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Basitleştirilmiş Hastalık Aktivite İndeksi — Romatoid Artrit</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SDAI = TJC + SJC + PGA + EGA + CRP (max ~86)</p>
          {[
            { label: "TJC — Hassas Eklem Sayısı (0–28)", value: tjc, set: setTjc, ph: "0–28" },
            { label: "SJC — Şiş Eklem Sayısı (0–28)", value: sjc, set: setSjc, ph: "0–28" },
            { label: "PGA — Hasta Genel Değerlendirme (0–10 cm VAS)", value: pga, set: setPga, ph: "0–10" },
            { label: "EGA — Hekim Genel Değerlendirme (0–10 cm VAS)", value: ega, set: setEga, ph: "0–10" },
            { label: "CRP (mg/dL)", value: crp, set: setCrp, ph: "ör. 1.5" },
          ].map(({ label, value, set, ph }) => (
            <label key={label} className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
              <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
          ))}
          {hasResult && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SDAI SKORU</span>
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
                { label: "Remisyon", range: "≤ 3.3", color: "bg-emerald-100 text-emerald-700" },
                { label: "Düşük", range: "3.4–11", color: "bg-sky-100 text-sky-700" },
                { label: "Orta", range: "11.1–26", color: "bg-amber-100 text-amber-700" },
                { label: "Yüksek", range: "> 26", color: "bg-rose-100 text-rose-700" },
              ].map(c => (
                <div key={c.label} className={`rounded-xl p-2 text-center text-[9px] font-black uppercase tracking-widest ${c.color}`}>
                  <div>{c.label}</div>
                  <div className="font-bold normal-case tracking-normal mt-0.5">{c.range}</div>
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
              CRP mg/dL cinsinden girilmelidir (mg/L değil). SDAI ile CDAI arasındaki fark genellikle küçüktür; CRP yüksek olmadığında CDAI tercih edilebilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
