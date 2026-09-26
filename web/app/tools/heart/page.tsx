"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { sozluk } from "@/lib/dil";
import { useDil } from "@/app/components/DilBaglami";
import metin from "./metin.dil.json";

type Metin = ReturnType<typeof M>;

const M = sozluk(metin);

/* Metin `metin.dil.json`da (TR + EN); puanlar ve kimlikler burada, TEK kopya. */
const itemsOf = (t: Metin): { id: string; label: string; detail: string; options: { label: string; pts: number }[] }[] => [
  {
    id: "history",
    label: t.history_label,
    detail: t.history_detail,
    options: [
      { label: t.history_0, pts: 0 },
      { label: t.history_1, pts: 1 },
      { label: t.history_2, pts: 2 },
    ],
  },
  {
    id: "ecg",
    label: t.ecg_label,
    detail: t.ecg_detail,
    options: [
      { label: t.ecg_0, pts: 0 },
      { label: t.ecg_1, pts: 1 },
      { label: t.ecg_2, pts: 2 },
    ],
  },
  {
    id: "age",
    label: t.age_label,
    detail: t.age_detail,
    options: [
      { label: "< 45", pts: 0 },
      { label: "45–65", pts: 1 },
      { label: "> 65", pts: 2 },
    ],
  },
  {
    id: "risk",
    label: t.risk_label,
    detail: t.risk_detail,
    options: [
      { label: t.risk_0, pts: 0 },
      { label: t.risk_1, pts: 1 },
      { label: t.risk_2, pts: 2 },
    ],
  },
  {
    id: "troponin",
    label: t.troponin_label,
    detail: t.troponin_detail,
    options: [
      { label: t.troponin_0, pts: 0 },
      { label: t.troponin_1, pts: 1 },
      { label: t.troponin_2, pts: 2 },
    ],
  },
];

const getBand = (v: number, t: Metin) =>
  v <= 3  ? { label: t.dusuk_label,  color: "emerald", sub: t.dusuk_sub, action: t.dusuk_action } :
  v <= 6  ? { label: t.orta_label,   color: "amber",   sub: t.orta_sub, action: t.orta_action } :
             { label: t.yuksek_label,color: "rose",    sub: t.yuksek_sub, action: t.yuksek_action };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-700 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function HEARTPage() {
  const t = M(useDil());
  const ITEMS = itemsOf(t);
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const band = total !== null ? getBand(total, t) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="heart" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">❤️</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">{t.baslik}</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{t.altBaslik}</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}{t.kriterSayac}</span>
          <div className="flex gap-2 text-[8px] font-black text-slate-400">
            {["H","E","A","R","T"].map((l, i) => (
              <span key={l} className={`w-6 h-6 rounded-lg flex items-center justify-center
                ${Object.values(sel)[i] !== null ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-400"}`}>{l}</span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p id={`grp-0b-${String(item.id).replace(/[^a-zA-Z0-9]+/g, '-')}`} className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{item.label}</p>
              <p id={`grp-0-${String(item.id).replace(/[^a-zA-Z0-9]+/g, '-')}`} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.detail}</p>
              <div role="group" aria-labelledby={`grp-0b-${String(item.id).replace(/[^a-zA-Z0-9]+/g, '-')} grp-0-${String(item.id).replace(/[^a-zA-Z0-9]+/g, '-')}`} className="space-y-1.5">
                {item.options.map(opt => (
                  <button aria-pressed={sel[item.id] === opt.pts} key={opt.pts} type="button"
                    onClick={() => setSel(s => ({ ...s, [item.id]: s[item.id] === opt.pts ? null : opt.pts }))}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-[10px] font-bold transition-all
                      ${sel[item.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
                      ${sel[item.id] === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <SonucDuyuru metin={band ? band.label : null} />
        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">HEART</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 10</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
                <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{band.action}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center text-[8px]">
              {[
                { k: "dusuk",  l: t.tablo_dusuk,  r: "0–3", mace: t.mace_dusuk },
                { k: "orta",   l: t.tablo_orta,   r: "4–6", mace: t.mace_orta },
                { k: "yuksek", l: t.tablo_yuksek, r: "7–10",mace: t.mace_yuksek },
              ].map(b => (
                /* Seçili hücre KİMLİKLE bulunur, etiketle değil: etiket dile göre değişiyor. */
                <div key={b.k} className={`rounded-lg p-1.5 font-black
                  ${(b.k === "dusuk" && total <= 3) || (b.k === "orta" && total >= 4 && total <= 6) || (b.k === "yuksek" && total >= 7) ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold">{b.r}</div><div className="text-[7px]">MACE {b.mace}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.bos}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {t.uyari}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
