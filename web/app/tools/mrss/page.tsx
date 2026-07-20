"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// Modifiye Rodnan Deri Skoru (mRSS) — 17 bölge, her biri 0-3
const REGIONS = [
  { id: "face",        label: "Yüz" },
  { id: "chest",       label: "Ön göğüs (sternum)" },
  { id: "abdomen",     label: "Karın" },
  { id: "rupper",      label: "Sağ üst kol" },
  { id: "rlower",      label: "Sağ önkol" },
  { id: "rfingers",    label: "Sağ parmaklar" },
  { id: "lupper",      label: "Sol üst kol" },
  { id: "llower",      label: "Sol önkol" },
  { id: "lfingers",    label: "Sol parmaklar" },
  { id: "rupperleg",   label: "Sağ uyluk" },
  { id: "rlowerleg",   label: "Sağ bacak (baldır)" },
  { id: "rfoot",       label: "Sağ ayak üzeri" },
  { id: "lupperleg",   label: "Sol uyluk" },
  { id: "llowerleg",   label: "Sol bacak (baldır)" },
  { id: "lfoot",       label: "Sol ayak üzeri" },
  { id: "upperback",   label: "Üst sırt" },
  { id: "lowerback",   label: "Alt sırt" },
];

const OPTS = [
  { pts: 0, label: "Normal" },
  { pts: 1, label: "Hafif" },
  { pts: 2, label: "Orta" },
  { pts: 3, label: "Ağır" },
];

const getBand = (v: number) =>
  v <= 10 ? { label: "HAFİF",            color: "emerald", sub: "Sınırlı deri tutulumu" } :
  v <= 20 ? { label: "ORTA",             color: "amber",   sub: "Orta deri fibrozisi" } :
  v <= 30 ? { label: "AĞIR",             color: "orange",  sub: "Yaygın deri tutulumu — organ tutulumu riski yüksek" } :
             { label: "ÇOK AĞIR",        color: "rose",    sub: "Difüz cSSc — yoğun takip ve tedavi" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function MRSSPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(REGIONS.map(r => [r.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === REGIONS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const band = total !== null ? getBand(total) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="mrss" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🖐️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">mRSS</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Modifiye Rodnan Deri Skoru · Sistemik Skleroz · 17 Bölge · 0–51</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/17 bölge</span>
          <div className="flex flex-wrap gap-0.5">
            {REGIONS.map(r => (
              <div key={r.id} className={`w-3 h-2 rounded-sm transition-all ${sel[r.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-blue-800">📌 Her bölgede derinin kalınlığını baş ve işaret parmakları arasında pinch (kıstırma) testi ile değerlendirin. 0 = normal, 1 = hafif kalınlaşma, 2 = orta (fold yapılamıyor), 3 = ağır (fold hiç yapılamıyor).</p>
        </div>

        <div className="space-y-2">
          {REGIONS.map(region => (
            <div key={region.id} className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-black text-blue-900 w-40 shrink-0">{region.label}</p>
                <div className="flex gap-1 flex-1">
                  {OPTS.map(opt => (
                    <button key={opt.pts} type="button"
                      onClick={() => setSel(s => ({ ...s, [region.id]: s[region.id] === opt.pts ? null : opt.pts }))}
                      className={`flex-1 py-2 rounded-lg border-2 text-[9px] font-black transition-all
                        ${sel[region.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200"}`}>
                      {opt.pts}<br/><span className="text-[7px]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">mRSS</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 51</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
              </div>
            </div>
            <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(total / 51) * 100}%`, background: band.color === "emerald" ? "#10b981" : band.color === "amber" ? "#f59e0b" : band.color === "orange" ? "#f97316" : "#f43f5e" }} />
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 17 bölgeyi değerlendirin</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              mRSS klinik çalışmalarda primer endpoint olarak kullanılmaktadır. Deneyimli gözlemci gerektirir; inter-gözlemci değişkenliği azaltmak için standardize eğitim önerilir. Clements et al., Arthritis Rheum 1995.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
