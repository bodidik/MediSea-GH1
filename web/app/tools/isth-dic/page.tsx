"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS = [
  {
    id: "plt",
    label: "Trombosit Sayısı",
    detail: "× 10⁹/L",
    options: [
      { label: "> 100", pts: 0 },
      { label: "50–100", pts: 1 },
      { label: "< 50", pts: 2 },
    ],
  },
  {
    id: "fdp",
    label: "Fibrin İlgili Belirteçler",
    detail: "D-dimer veya FDP (fibrin yıkım ürünleri)",
    options: [
      { label: "Yükselmemiş", pts: 0 },
      { label: "Orta düzeyde yüksek", pts: 2 },
      { label: "Belirgin yüksek (> 5 × normal)", pts: 3 },
    ],
  },
  {
    id: "pt",
    label: "PT Uzaması",
    detail: "Protrombin zamanı — normal değerden sapma",
    options: [
      { label: "< 3 saniye", pts: 0 },
      { label: "3–6 saniye", pts: 1 },
      { label: "> 6 saniye", pts: 2 },
    ],
  },
  {
    id: "fib",
    label: "Fibrinojen",
    detail: "Plazma fibrinojen düzeyi",
    options: [
      { label: "> 1 g/L (≥ 100 mg/dL)", pts: 0 },
      { label: "≤ 1 g/L (< 100 mg/dL)", pts: 1 },
    ],
  },
];

export default function ISTHDICPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const isDIC     = total !== null && total >= 5;
  const isNonOvert = total !== null && total < 5;

  const c = isDIC
    ? { bg: "bg-rose-50",    border: "border-rose-300",    text: "text-rose-700",    badge: "bg-rose-700 text-white" }
    : isNonOvert
    ? { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" }
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="isth-dic" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🩹</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">ISTH DIC Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Yaygın Damar İçi Pıhtılaşma · ISTH 2001 Diagnostik Algoritması</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-amber-800">⚠️ Bu skoru yalnızca DIC ile uyumlu altta yatan hastalığı (sepsis, travma, obstetrik komplikasyon, malignite) olan hastalarda uygulayın. Altta yatan hastalık yoksa hesaplama geçersizdir.</p>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/4 parametre</span>
          <div className="flex gap-1">
            {ITEMS.map(i => (
              <div key={i.id} className={`w-10 h-2 rounded-full transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{item.label}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.detail}</p>
              <div className="flex flex-wrap gap-2">
                {item.options.map(opt => {
                  const active = sel[item.id] === opt.pts;
                  return (
                    <button key={opt.pts} type="button"
                      onClick={() => setSel(s => ({ ...s, [item.id]: s[item.id] === opt.pts ? null : opt.pts }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-[10px] font-black transition-all flex-1
                        ${active ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
                        ${active ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {total !== null && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[8px] font-black text-blue-300 uppercase">SKOR</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 8</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>
                  {isDIC ? "AÇIK DIC ile Uyumlu" : "Açık DIC ile Uyumsuz"}
                </span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>
                  {isDIC
                    ? "Antikoagülan tedavi + altta yatan hastalık tedavisini başlatın"
                    : "Parametreleri 1–2 günde tekrarlayın; klinik durumu yakın izleyin"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-[9px]">
              {[
                { l: "Açık DIC", r: "≥ 5 puan", active: isDIC },
                { l: "Açık DIC Değil", r: "< 5 puan", active: isNonOvert },
              ].map(b => (
                <div key={b.l} className={`rounded-xl p-2 font-black uppercase
                  ${b.active ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold normal-case">{b.r}</div>
                </div>
              ))}
            </div>
            {isDIC && (
              <div className="bg-white/70 rounded-xl p-3 space-y-1">
                <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest mb-1">Tedavi Prensipleri</p>
                <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-700">
                  {["Altta yatan hastalığı tedavi et", "Plt < 50 → transfüzyon", "Fibrinojen < 1.5 g/L → kriyopresipitat", "PT > 1.5× → TDP", "TM kanama yok + tromboz → DMAH düşün", "D-dimer + klinik takip"].map(t => (
                    <div key={t} className="flex items-start gap-1"><span className="text-amber-500 shrink-0">·</span>{t}</div>
                  ))}
                </div>
              </div>
            )}
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
              ISTH skoru "açık DIC" tanısına yönelik bir araçtır; pre-DIC (non-overt DIC) için ayrı algoritmalar önerilmektedir. Taylor et al., J Thromb Haemost 2001.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
