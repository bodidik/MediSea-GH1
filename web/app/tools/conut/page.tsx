"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

function scoreAlbumin(alb: number) {
  if (alb >= 3.5) return 0;
  if (alb >= 3.0) return 2;
  if (alb >= 2.5) return 4;
  return 6;
}
function scoreLymph(lymp: number) {
  if (lymp >= 1600) return 0;
  if (lymp >= 1200) return 1;
  if (lymp >= 800)  return 2;
  return 3;
}
function scoreCholesterol(chol: number) {
  if (chol >= 180) return 0;
  if (chol >= 140) return 1;
  return 2;
}

export default function ConutPage() {
  const [alb, setAlb]   = React.useState("");
  const [lymp, setLymp] = React.useState("");
  const [chol, setChol] = React.useState("");

  const albN  = parseLocaleNumber(alb);
  const lympN = parseLocaleNumber(lymp);
  const cholN = parseLocaleNumber(chol);

  const hasResult = albN > 0 || lympN > 0 || cholN > 0;
  const sAlb  = albN > 0 ? scoreAlbumin(albN) : null;
  const sLymp = lympN > 0 ? scoreLymph(lympN) : null;
  const sChol = cholN > 0 ? scoreCholesterol(cholN) : null;
  const total = sAlb !== null && sLymp !== null && sChol !== null ? sAlb + sLymp + sChol : null;

  const getResult = (s: number) => {
    if (s <= 1)  return { label: "NORMAL", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (s <= 4)  return { label: "HAFİF MALNÜTRISYON", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" };
    if (s <= 8)  return { label: "ORTA MALNÜTRISYON", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "AĞIR MALNÜTRISYON", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = total !== null ? getResult(total) : null;
  const params = { alb: albN, lymp: lympN, chol: cholN };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="conut" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🍏</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">CONUT</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Controlling Nutritional Status — Laboratuvar Tabanlı Tarama</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-5">
          {[
            { label: "Albumin (g/dL)", value: alb, set: setAlb, ph: "ör. 3.8", ref: "0 puan ≥3.5 | 2p 3.0–3.4 | 4p 2.5–2.9 | 6p <2.5", score: sAlb },
            { label: "Lenfosit (/μL)", value: lymp, set: setLymp, ph: "ör. 1800", ref: "0 puan ≥1600 | 1p 1200–1599 | 2p 800–1199 | 3p <800", score: sLymp },
            { label: "Total Kolesterol (mg/dL)", value: chol, set: setChol, ph: "ör. 175", ref: "0 puan ≥180 | 1p 140–179 | 2p <140", score: sChol },
          ].map(({ label, value, set, ph, ref, score: sc }) => (
            <label key={label} className="flex flex-col gap-2">
              <div className="flex items-center justify-between pl-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                {sc !== null && <span className="text-[10px] font-black text-blue-900 bg-blue-50 border border-blue-100 rounded-lg px-2 py-0.5">+{sc} puan</span>}
              </div>
              <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
              <span className="text-[9px] font-bold text-slate-400 pl-1">{ref}</span>
            </label>
          ))}

          {total !== null && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CONUT SKORU</span>
              <span className="text-4xl font-black text-blue-900">{total}</span>
            </div>
          )}
        </div>

        {result && total !== null && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">CONUT = {total}/11</div>
            <p className={`text-2xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { l: "Normal", r: "0–1", c: "bg-emerald-100 text-emerald-700" },
                { l: "Hafif", r: "2–4", c: "bg-sky-100 text-sky-700" },
                { l: "Orta", r: "5–8", c: "bg-amber-100 text-amber-700" },
                { l: "Ağır", r: "9–11", c: "bg-rose-100 text-rose-700" },
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
              CONUT rutin kan tetkiklerinden hesaplanan pratik bir tarama aracıdır. Onkoloji, kardiyoloji ve cerrahi hastalarında prognostik değer taşır. Akut inflamasyon albumin ve lenfosit değerlerini etkiler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
