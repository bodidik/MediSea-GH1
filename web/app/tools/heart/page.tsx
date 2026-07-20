"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS: { id: string; label: string; detail: string; options: { label: string; pts: number }[] }[] = [
  {
    id: "history",
    label: "H — Hikaye",
    detail: "Göğüs ağrısının kardiyak açıdan şüphe vericilik düzeyi",
    options: [
      { label: "Düşük şüpheli (non-kardiyak özellikler ağırlıklı)", pts: 0 },
      { label: "Orta şüpheli (karma özellikler)", pts: 1 },
      { label: "Yüksek şüpheli (tipik AMI/ACS — baskı, sol kol/çene yayılım, egzersizle artma)", pts: 2 },
    ],
  },
  {
    id: "ecg",
    label: "E — EKG",
    detail: "12-derivasyon EKG bulguları",
    options: [
      { label: "Normal", pts: 0 },
      { label: "Non-spesifik repolarizasyon bozukluğu (LBBB, pacemaker, LVH, erken repolarizasyon)", pts: 1 },
      { label: "Anlamlı ST depresyonu veya T inversiyonu (yeni/varsayılan yeni)", pts: 2 },
    ],
  },
  {
    id: "age",
    label: "A — Yaş",
    detail: "Hasta yaşı",
    options: [
      { label: "< 45", pts: 0 },
      { label: "45–65", pts: 1 },
      { label: "> 65", pts: 2 },
    ],
  },
  {
    id: "risk",
    label: "R — Risk Faktörleri",
    detail: "Bilinen KAH veya kardiyovasküler risk faktörleri (DM, sigara, hiperkolesterolemi, HT, obezite, aile öyküsü, aterosklerotik hastalık)",
    options: [
      { label: "Bilinen risk faktörü yok", pts: 0 },
      { label: "1–2 risk faktörü", pts: 1 },
      { label: "≥ 3 risk faktörü VEYA aterosklerotik hastalık öyküsü", pts: 2 },
    ],
  },
  {
    id: "troponin",
    label: "T — Troponin",
    detail: "İlk başvurudaki troponin düzeyi (standart assay normal üst sınırına göre)",
    options: [
      { label: "≤ Normal sınır", pts: 0 },
      { label: "1–3× normal sınır", pts: 1 },
      { label: "> 3× normal sınır", pts: 2 },
    ],
  },
];

const getBand = (v: number) =>
  v <= 3  ? { label: "DÜŞÜK RİSK",  color: "emerald", sub: "Erken taburculuk — kardiyak olay riski < %2", action: "Ambulatuar değerlendirme yeterli" } :
  v <= 6  ? { label: "ORTA RİSK",   color: "amber",   sub: "Kardiyoloji konsültasyonu ve gözlem önerilidir", action: "Stres testi veya görüntüleme planla" } :
             { label: "YÜKSEK RİSK",color: "rose",    sub: "Hızlı kardiyoloji değerlendirmesi ve invaziv strateji", action: "Kardiyak kateterizasyon düşün" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function HEARTPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const band = total !== null ? getBand(total) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="heart" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">❤️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">HEART Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Akut Göğüs Ağrısı Kardiyak Risk Triyajı · 5 Kriter · 0–10</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/5 kriter</span>
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
              <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{item.label}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.detail}</p>
              <div className="space-y-1.5">
                {item.options.map(opt => (
                  <button key={opt.pts} type="button"
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
                { l: "Düşük", r: "0–3", mace: "< %2" },
                { l: "Orta",  r: "4–6", mace: "≈ %12" },
                { l: "Yüksek",r: "7–10",mace: "≈ %65" },
              ].map(b => (
                <div key={b.l} className={`rounded-lg p-1.5 font-black
                  ${(b.l === "Düşük" && total <= 3) || (b.l === "Orta" && total >= 4 && total <= 6) || (b.l === "Yüksek" && total >= 7) ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold">{b.r}</div><div className="text-[7px]">MACE {b.mace}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 5 kriteri tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              HEART skoru ≤ 3 olan hastalarda MACE riski < %2 olup güvenli erken taburculuğu destekler. Yüksek duyarlılıklı troponin assayları ile birlikte kullanımı duyarlılığı artırır. Six et al., Eur Heart J Acute Cardiovasc Care 2013.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
