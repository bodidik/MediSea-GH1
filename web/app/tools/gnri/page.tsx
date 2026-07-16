"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

export default function GnriPage() {
  const [alb, setAlb]       = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [height, setHeight] = React.useState("");

  const albN    = parseLocaleNumber(alb);
  const weightN = parseLocaleNumber(weight);
  const heightN = parseLocaleNumber(height);

  // Ideal body weight (Lorenz formula — used in GNRI)
  const ibw = heightN > 0 ? (heightN - 100) - (heightN - 150) / 4 : null;
  const wRatio = ibw !== null && ibw > 0 && weightN > 0 ? Math.min(weightN / ibw, 1) : null;

  // GNRI = 1.489 × Albumin (g/L) + 41.7 × (Weight / IBW)
  // Note: albumin must be in g/L (×10 from g/dL)
  const gnri = albN > 0 && wRatio !== null ? 1.489 * (albN * 10) + 41.7 * wRatio : null;

  const getResult = (s: number) => {
    if (s > 98)    return { label: "RİSK YOK", sub: "GNRI > 98", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (s >= 92)   return { label: "DÜŞÜK RİSK", sub: "GNRI 92–98", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" };
    if (s >= 82)   return { label: "ORTA RİSK", sub: "GNRI 82–91", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "YÜKSEK RİSK", sub: "GNRI < 82", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = gnri !== null ? getResult(gnri) : null;
  const params = { alb: albN, weight: weightN, height: heightN };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="gnri" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🍏</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">GNRI</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Geriyatrik Nütrisyon Risk İndeksi — Albumin & İdeal Ağırlık</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-5">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest mb-1">Formül</p>
            <p className="text-sm font-bold text-blue-900">GNRI = 1.489 × Albumin (g/L) + 41.7 × (Mevcut Ağırlık / İdeal Ağırlık)</p>
            <p className="text-[9px] font-bold text-blue-900/60 mt-1">İdeal ağırlık (Lorenz): Boy(cm) − 100 − (Boy − 150)/4</p>
          </div>

          {[
            { label: "Albumin (g/dL)", value: alb, set: setAlb, ph: "ör. 3.5", ref: "N: 3.5–5.0 g/dL" },
            { label: "Mevcut Ağırlık (kg)", value: weight, set: setWeight, ph: "ör. 58" },
            { label: "Boy (cm)", value: height, set: setHeight, ph: "ör. 165" },
          ].map(({ label, value, set, ph, ref }) => (
            <label key={label} className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
              <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
              {ref && <span className="text-[9px] font-bold text-slate-400 pl-1">{ref}</span>}
            </label>
          ))}

          {ibw !== null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">İdeal Ağırlık</div>
                <div className="text-2xl font-black text-blue-900">{ibw.toFixed(1)} kg</div>
              </div>
              {wRatio !== null && (
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ağırlık Oranı</div>
                  <div className="text-2xl font-black text-blue-900">{(wRatio * 100).toFixed(0)}%</div>
                </div>
              )}
            </div>
          )}

          {gnri !== null && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GNRI</span>
              <span className="text-4xl font-black text-blue-900">{gnri.toFixed(1)}</span>
            </div>
          )}
        </div>

        {result && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">GNRI = {gnri?.toFixed(1)}</div>
            <p className={`text-2xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <p className={`text-sm font-bold mt-1 ${result.color} opacity-80`}>{result.sub}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { l: "Risk yok", r: "> 98", c: "bg-emerald-100 text-emerald-700" },
                { l: "Düşük", r: "92–98", c: "bg-sky-100 text-sky-700" },
                { l: "Orta", r: "82–91", c: "bg-amber-100 text-amber-700" },
                { l: "Yüksek", r: "< 82", c: "bg-rose-100 text-rose-700" },
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
              GNRI özellikle yaşlı ve hemodiyaliz hastalarında malnütrisyon ve mortalite riskini değerlendirmek için geliştirilmiştir. Ağırlık/İBW oranı 1'i geçse de hesapta 1 olarak alınır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
