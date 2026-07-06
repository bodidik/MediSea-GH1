"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

/** * HEART Skoru Gündüz Modu (Sakin Deniz)
 * History, ECG, Age, Risk factors, Troponin — göğüs ağrısı risk stratifikasyonu
 */

type Option = { value: number; label: string };
type Category = { key: string; title: string; options: Option[] };

const CATEGORIES: Category[] = [
  {
    key: "history",
    title: "Öykü (History)",
    options: [
      { value: 0, label: "Şüpheli değil" },
      { value: 1, label: "Orta derece şüpheli" },
      { value: 2, label: "Oldukça şüpheli" },
    ],
  },
  {
    key: "ecg",
    title: "EKG",
    options: [
      { value: 0, label: "Normal" },
      { value: 1, label: "Nonspesifik repolarizasyon bozukluğu" },
      { value: 2, label: "Anlamlı ST deviasyonu" },
    ],
  },
  {
    key: "age",
    title: "Yaş",
    options: [
      { value: 0, label: "≤ 45" },
      { value: 1, label: "46 – 65" },
      { value: 2, label: "> 65" },
    ],
  },
  {
    key: "risk",
    title: "Risk Faktörleri",
    options: [
      { value: 0, label: "Risk faktörü yok" },
      { value: 1, label: "1–2 risk faktörü" },
      { value: 2, label: "≥3 risk faktörü VEYA bilinen aterosklerotik hastalık" },
    ],
  },
  {
    key: "troponin",
    title: "Troponin",
    options: [
      { value: 0, label: "≤ normal sınır" },
      { value: 1, label: "1–3× normal sınır" },
      { value: 2, label: "> 3× normal sınır" },
    ],
  },
];

export default function HeartScorePage() {
  const s = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initial: Record<string, number> = {};
  CATEGORIES.forEach((c) => { initial[c.key] = Number(s?.get(c.key)) || 0; });

  const [sel, setSel] = React.useState<Record<string, number>>(initial);
  const total = Object.values(sel).reduce((a, b) => a + b, 0);

  const cat =
    total >= 7
      ? { label: "Yüksek Risk (~65% MACE)", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" }
      : total >= 4
      ? { label: "Orta Risk (~12% MACE)", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" }
      : { label: "Düşük Risk (<2% MACE)", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };

  const shareParams = { ...sel };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            💔
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">HEART Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Göğüs Ağrısı Risk Stratifikasyonu (Acil Servis)</p>
          </div>
        </div>

        {/* KATEGORİLER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-6">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="space-y-2">
              <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest pl-1">{c.title}</span>
              <div className="grid gap-2">
                {c.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setSel((v) => ({ ...v, [c.key]: o.value }))}
                    className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-left transition-all
                      ${sel[c.key] === o.value
                        ? 'bg-blue-900 border-blue-900 text-white shadow-md'
                        : 'bg-slate-50 border-slate-100 hover:border-blue-900/30 text-blue-950'}
                    `}
                  >
                    <span className="text-xs font-bold">{o.label}</span>
                    <span className={`text-[10px] font-black ${sel[c.key] === o.value ? 'text-amber-400' : 'text-slate-400'}`}>
                      +{o.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SKOR VE ANALİTİK YORUM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">SKOR</span>
            <div className="text-5xl font-black text-white">{total}</div>
            <span className="text-[9px] font-bold text-blue-300/70 uppercase tracking-widest mt-1">/ 10</span>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${cat.border} ${cat.bg} transition-all duration-500`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block text-center md:text-left">RİSK KATEGORİSİ</span>
            <p className={`text-2xl font-black italic tracking-tight text-center md:text-left ${cat.color}`}>
              {cat.label}
            </p>
          </div>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={shareParams} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              HEART skoru, akut koroner sendromu ekarte etmek için tasarlanmış bir acil servis risk stratifikasyon aracıdır. Düşük risk grubu bile klinik değerlendirmenin yerini almaz; seri troponin ve klinik gidişat birlikte değerlendirilmelidir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
