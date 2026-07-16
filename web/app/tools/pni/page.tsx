"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

export default function PniPage() {
  const [alb, setAlb]   = React.useState("");
  const [lymp, setLymp] = React.useState("");

  const albN  = parseLocaleNumber(alb);
  const lympN = parseLocaleNumber(lymp);
  const hasResult = albN > 0 && lympN > 0;

  // PNI = 10 × Albumin (g/dL) + 0.005 × Lenfosit (/μL)
  const pni = hasResult ? 10 * albN + 0.005 * lympN : null;

  const getResult = (s: number) => {
    if (s >= 45)   return { label: "İYİ NÜTRISYON DURUMU", sub: "PNI ≥ 45 — Düşük morbidite ve mortalite riski", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (s >= 40)   return { label: "HAFIF RİSK", sub: "PNI 40–44.9 — Orta derece risk", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    if (s >= 35)   return { label: "ORTA RİSK", sub: "PNI 35–39.9 — Artmış komplikasyon riski", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" };
    return { label: "YÜKSEK RİSK", sub: "PNI < 35 — Ciddi malnütrisyon; yüksek mortalite riski", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = pni !== null ? getResult(pni) : null;
  const params = { alb: albN, lymp: lympN };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="pni" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🍏</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">PNI</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Prognostik Nütrisyon İndeksi — Albumin & Lenfosit</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-5">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest mb-1">Formül</p>
            <p className="text-sm font-bold text-blue-900">PNI = 10 × Albumin (g/dL) + 0.005 × Lenfosit (/μL)</p>
          </div>
          {[
            { label: "Albumin (g/dL)", value: alb, set: setAlb, ph: "ör. 3.2", ref: "N: 3.5–5.0 g/dL" },
            { label: "Lenfosit Sayısı (/μL)", value: lymp, set: setLymp, ph: "ör. 1500", ref: "Mutlak lenfosit sayısı" },
          ].map(({ label, value, set, ph, ref }) => (
            <label key={label} className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
              <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
              <span className="text-[9px] font-bold text-slate-400 pl-1">{ref}</span>
            </label>
          ))}

          {pni !== null && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PNI</span>
              <span className="text-4xl font-black text-blue-900">{pni.toFixed(1)}</span>
            </div>
          )}
        </div>

        {result && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">PNI = {pni?.toFixed(1)}</div>
            <p className={`text-2xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <p className={`text-sm font-bold mt-1 ${result.color} opacity-80`}>{result.sub}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { l: "İyi", r: "≥ 45", c: "bg-emerald-100 text-emerald-700" },
                { l: "Hafif", r: "40–44", c: "bg-amber-100 text-amber-700" },
                { l: "Orta", r: "35–39", c: "bg-orange-100 text-orange-700" },
                { l: "Yüksek", r: "< 35", c: "bg-rose-100 text-rose-700" },
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
              PNI özellikle onkoloji hastalarında cerrahi komplikasyon ve sağkalım tahmini için kullanılır. Bazı çalışmalarda &lt;45, bazılarında &lt;40 eşiği kullanılmaktadır; klinik bağlama göre değerlendirin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
