"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS = [
  {
    id: "bmi",
    label: "Vücut Kitle İndeksi (VKİ)",
    detail: "kg/m²",
    options: [
      { label: "> 21 kg/m²", pts: 0 },
      { label: "≤ 21 kg/m²", pts: 1 },
    ],
  },
  {
    id: "fev1",
    label: "FEV₁ (% Beklenen)",
    detail: "Bronkodilatör sonrası spirometri",
    options: [
      { label: "≥ 65%", pts: 0 },
      { label: "50–64%", pts: 1 },
      { label: "36–49%", pts: 2 },
      { label: "≤ 35%", pts: 3 },
    ],
  },
  {
    id: "mmrc",
    label: "mMRC Dispne Skalası",
    detail: "Modifiye MRC dispne derecesi",
    options: [
      { label: "Grade 0–1 (egzersizde veya hızlı yürürken)", pts: 0 },
      { label: "Grade 2 (yaşıtlarından yavaş veya düz zeminde duruyor)", pts: 1 },
      { label: "Grade 3 (yaklaşık 100 m veya birkaç dakika sonra duruyor)", pts: 2 },
      { label: "Grade 4 (evden çıkamıyor veya giyinirken nefes darlığı)", pts: 3 },
    ],
  },
  {
    id: "6mwt",
    label: "6 Dakika Yürüme Testi",
    detail: "Düz zeminde 6 dakikada kat edilen mesafe",
    options: [
      { label: "≥ 350 m", pts: 0 },
      { label: "250–349 m", pts: 1 },
      { label: "150–249 m", pts: 2 },
      { label: "< 150 m", pts: 3 },
    ],
  },
];

const QUARTILES = [
  { min: 0, max: 2, label: "Q1 — Düşük Risk", os4: "%80+", color: "emerald" },
  { min: 3, max: 4, label: "Q2 — Orta-Düşük",  os4: "%67",  color: "sky" },
  { min: 5, max: 6, label: "Q3 — Orta-Yüksek", os4: "%57",  color: "amber" },
  { min: 7, max: 10, label: "Q4 — Yüksek Risk", os4: "%18",  color: "rose" },
];

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     badge: "bg-sky-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function BODEPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const q = total !== null ? QUARTILES.find(b => total >= b.min && total <= b.max)! : null;
  const c = q ? COLOR[q.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="bode" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">📊</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">BODE İndeksi</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">KOAH Mortalite Tahmini · BMI · Obstrüksiyon · Dispne · Egzersiz</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/4 parametre</span>
          <div className="flex gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
            {["B","O","D","E"].map((l, i) => (
              <span key={l} className={`w-6 h-6 rounded-lg flex items-center justify-center
                ${Object.values(sel)[i] !== null ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-400"}`}>{l}</span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{item.label}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.detail}</p>
              <div className="space-y-1.5">
                {item.options.map(opt => (
                  <button key={opt.pts} type="button"
                    onClick={() => setSel(s => ({ ...s, [item.id]: s[item.id] === opt.pts ? null : opt.pts }))}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all
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

        {total !== null && q && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[8px] font-black text-blue-300 uppercase">BODE</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 10</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{q.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>4 Yıllık Sağkalım ≈ {q.os4}</p>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5 uppercase tracking-widest">Quartil: {q.min}–{q.max} puan</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[8px]">
              {QUARTILES.map(b => (
                <div key={b.label} className={`rounded-lg p-1.5 font-black
                  ${b.label === q.label ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.min}–{b.max}</div>
                  <div className="font-bold">{b.os4}</div>
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
              BODE indeksi yalnızca FEV₁ kullanımına kıyasla KOAH mortalitesini daha iyi öngörür. Akciğer transplantasyonu ve pulmoner rehabilitasyon kararlarında referans alınır. Celli et al., NEJM 2004.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
