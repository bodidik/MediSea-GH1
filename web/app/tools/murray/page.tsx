"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// Murray Akciğer Hasar Skoru — 4 parametre, her biri 0-4
const PARAMS: { id: string; label: string; detail: string; opts: { label: string; pts: number }[] }[] = [
  {
    id: "xray",
    label: "Akciğer Grafisi",
    detail: "Konsolidasyon alanlarına göre puanlama",
    opts: [
      { label: "0 — Normal", pts: 0 },
      { label: "1 — Tek kadranda konsolidasyon", pts: 1 },
      { label: "2 — İki kadranda konsolidasyon", pts: 2 },
      { label: "3 — Üç kadranda konsolidasyon", pts: 3 },
      { label: "4 — Dört kadranda konsolidasyon", pts: 4 },
    ],
  },
  {
    id: "pf",
    label: "PaO2/FiO2 Oranı",
    detail: "Arteriyel oksijen parsiyel basıncı / inspire edilen oksijen fraksiyonu",
    opts: [
      { label: "0 — ≥ 300", pts: 0 },
      { label: "1 — 225–299", pts: 1 },
      { label: "2 — 175–224", pts: 2 },
      { label: "3 — 100–174", pts: 3 },
      { label: "4 — < 100", pts: 4 },
    ],
  },
  {
    id: "peep",
    label: "PEEP (mekanik ventilatördeyse)",
    detail: "Pozitif ekspirasyon sonu basınç (cmH2O)",
    opts: [
      { label: "0 — ≤ 5 cmH2O", pts: 0 },
      { label: "1 — 6–8 cmH2O", pts: 1 },
      { label: "2 — 9–11 cmH2O", pts: 2 },
      { label: "3 — 12–14 cmH2O", pts: 3 },
      { label: "4 — ≥ 15 cmH2O", pts: 4 },
    ],
  },
  {
    id: "compliance",
    label: "Solunum Sistemi Uyumu (ventilatördeyse)",
    detail: "Statik kompliyanı hesaplama: Vt / (Pplat − PEEP)",
    opts: [
      { label: "0 — ≥ 80 mL/cmH2O", pts: 0 },
      { label: "1 — 60–79 mL/cmH2O", pts: 1 },
      { label: "2 — 40–59 mL/cmH2O", pts: 2 },
      { label: "3 — 20–39 mL/cmH2O", pts: 3 },
      { label: "4 — ≤ 19 mL/cmH2O", pts: 4 },
    ],
  },
];

const getBand = (v: number) =>
  v === 0      ? { label: "HASAR YOK",     color: "emerald", sub: "Akciğer hasarı kriteri karşılanmıyor" } :
  v <= 1       ? { label: "HAFİF-ORTA",    color: "sky",     sub: "Hafif-orta akciğer hasarı" } :
  v <= 2.5     ? { label: "AĞIR",          color: "orange",  sub: "Ağır akciğer hasarı — ARDS riski" } :
                 { label: "ÇOK AĞIR",      color: "rose",    sub: "Ağır ARDS — ECMO değerlendir" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     badge: "bg-sky-700 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function MurrayPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(PARAMS.map(p => [p.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === PARAMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0) / PARAMS.length
    : null;

  const band = total !== null ? getBand(total) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="murray" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🫁</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Murray Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Akciğer Hasar Skoru · ARDS Ağırlık · 4 Parametre</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/4 parametre</span>
          <div className="flex gap-2">
            {PARAMS.map(p => (
              <div key={p.id} className={`w-8 h-2 rounded-full transition-all ${sel[p.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {PARAMS.map(param => (
            <div key={param.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{param.label}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{param.detail}</p>
              <div className="space-y-1.5">
                {param.opts.map(opt => (
                  <button key={opt.pts} type="button"
                    onClick={() => setSel(s => ({ ...s, [param.id]: s[param.id] === opt.pts ? null : opt.pts }))}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-[10px] font-bold transition-all
                      ${sel[param.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
                      ${sel[param.id] === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">Murray</span>
                <span className="text-3xl font-black text-white leading-none">{total.toFixed(2)}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
                {total >= 2.5 && <p className="text-[9px] font-bold text-rose-600 mt-1">Murray ≥ 2.5 ECMO başvurusu için eşik değerdir (CESAR, EOLIA)</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[8px]">
              {[
                { l: "Yok", r: "0" },
                { l: "Hafif-Orta", r: "0.1–1" },
                { l: "Ağır", r: "1.1–2.5" },
                { l: "Çok Ağır", r: "> 2.5" },
              ].map(b => (
                <div key={b.l} className={`rounded-lg p-1.5 font-black
                  ${(b.l === "Yok" && total === 0) || (b.l === "Hafif-Orta" && total > 0 && total <= 1) || (b.l === "Ağır" && total > 1 && total <= 2.5) || (b.l === "Çok Ağır" && total > 2.5) ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold">{b.r}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 4 parametreyi tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Murray skoru = (Xray + PaO2/FiO2 + PEEP + Kompliyan) / kullanılan parametre sayısı. Ventilatöre bağlı olmayan hastalarda PEEP ve kompliyan hesaplanamaz. Murray et al., Am Rev Respir Dis 1988.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
