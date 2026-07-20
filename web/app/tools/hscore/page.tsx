"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS: { id: string; label: string; detail: string; options: { label: string; pts: number }[] }[] = [
  {
    id: "temp",
    label: "Vücut Sıcaklığı",
    detail: "Maksimum ateş düzeyi (°C)",
    options: [
      { label: "< 38.4 °C", pts: 0 },
      { label: "38.4–39.4 °C", pts: 33 },
      { label: "> 39.4 °C", pts: 49 },
    ],
  },
  {
    id: "organomegaly",
    label: "Hepatomegali / Splenomegali",
    detail: "Fizik muayenede organ büyümesi",
    options: [
      { label: "Yok", pts: 0 },
      { label: "Sadece biri var (KC veya dalak)", pts: 23 },
      { label: "Her ikisi de var", pts: 38 },
    ],
  },
  {
    id: "cytopenia",
    label: "Sitopeniler",
    detail: "≥ 2 hücre serisinde sitopeni",
    options: [
      { label: "1 seri (veya yok)", pts: 0 },
      { label: "≥ 2 seri", pts: 24 },
    ],
  },
  {
    id: "tg",
    label: "Trigliserit",
    detail: "Serum TG düzeyi (mmol/L veya mg/dL)",
    options: [
      { label: "< 1.5 mmol/L (< 132 mg/dL)", pts: 0 },
      { label: "1.5–4 mmol/L (132–354 mg/dL)", pts: 44 },
      { label: "> 4 mmol/L (> 354 mg/dL)", pts: 64 },
    ],
  },
  {
    id: "fibrinogen",
    label: "Fibrinojen",
    detail: "Plazma fibrinojen düzeyi",
    options: [
      { label: "> 2.5 g/L (> 250 mg/dL)", pts: 0 },
      { label: "≤ 2.5 g/L (≤ 250 mg/dL)", pts: 30 },
    ],
  },
  {
    id: "ferritin",
    label: "Serum Ferritin",
    detail: "Açlık serum ferritin düzeyi (ng/mL)",
    options: [
      { label: "< 2.000 ng/mL", pts: 0 },
      { label: "2.000–6.000 ng/mL", pts: 35 },
      { label: "> 6.000 ng/mL", pts: 50 },
    ],
  },
  {
    id: "ast",
    label: "AST (SGOT)",
    detail: "Serum aspartat aminotransferaz",
    options: [
      { label: "< 30 U/L (normal)", pts: 0 },
      { label: "≥ 30 U/L (yüksek)", pts: 19 },
    ],
  },
  {
    id: "hemophagocytosis",
    label: "Hemofagositoz (Kemik İliği)",
    detail: "Kemik iliği aspirat/biyopsisinde hemofagositoz",
    options: [
      { label: "Yok", pts: 0 },
      { label: "Var", pts: 35 },
    ],
  },
  {
    id: "immunosuppression",
    label: "Bilinen İmmünsüpresyon",
    detail: "HIV pozitifliği veya immunosupresif ilaç kullanımı",
    options: [
      { label: "Yok", pts: 0 },
      { label: "Var", pts: 18 },
    ],
  },
];

function getProbability(score: number): { pct: string; color: string } {
  if (score < 169) return { pct: "< %5",           color: "emerald" };
  if (score < 210) return { pct: "%14–26",          color: "sky" };
  if (score < 240) return { pct: "%57–93",          color: "amber" };
  return               { pct: "> %93",              color: "rose" };
}

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     badge: "bg-sky-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function HScorePage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const prob = total !== null ? getProbability(total) : null;
  const c = prob ? COLOR[prob.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="hscore" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🔥</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">HScore</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">HLH Olasılık Skoru · Hemofagositik Lenfohistiyositoz · 0–337</p>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-rose-800">🔥 HScore ≥ 169 → HLH olasılığı %93+. Klinik şüphe yüksekse kemik iliği tetkiki ve erken uzman konsültasyonu planlanmalıdır.</p>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/9 parametre</span>
          <div className="flex gap-0.5 flex-wrap">
            {ITEMS.map(i => (
              <div key={i.id} className={`w-4 h-2 rounded-sm transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{item.label}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.detail}</p>
              <div className="space-y-1.5">
                {item.options.map(opt => {
                  const active = sel[item.id] === opt.pts;
                  return (
                    <button key={opt.pts} type="button"
                      onClick={() => setSel(s => ({ ...s, [item.id]: s[item.id] === opt.pts ? null : opt.pts }))}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-[10px] font-black transition-all
                        ${active ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                      <span className={`w-7 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0
                        ${active ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {total !== null && prob && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[8px] font-black text-blue-300 uppercase">SKOR</span>
                <span className="text-3xl font-black text-white leading-none">{total}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>HLH OLASILĞI: {prob.pct}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>
                  {total >= 169 ? "HLH ile yüksek uyumlu — uzman değerlendirme acil" :
                   total >= 120 ? "Belirsiz — ek tetkik ve yakın izlem" :
                   "Düşük HLH olasılığı — alternatif tanıları araştırın"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[7px]">
              {[
                { l: "Düşük", r: "< 169",   pct: "< %5" },
                { l: "Orta-D", r: "169–209", pct: "%14–26" },
                { l: "Orta-Y", r: "210–239", pct: "%57–93" },
                { l: "Yüksek",r: "≥ 240",   pct: "> %93" },
              ].map(b => (
                <div key={b.l} className={`rounded-lg p-1 font-black
                  ${prob.pct === b.pct ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div className="uppercase">{b.l}</div>
                  <div className="font-bold">{b.r}</div>
                  <div className="text-[6px] font-bold">{b.pct}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 9 parametreyi tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              HScore erişkin HLH için geliştirilmiştir; pediatrik HLH tanısı HLH-2004 kriterleri (8 kriterin ≥ 5'i) ile yapılır. Fardet et al., Arthritis Rheum 2014.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
