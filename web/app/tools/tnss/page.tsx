"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS = [
  { id: "rhinorrhea", label: "Rinore",           detail: "Burun akıntısı miktarı ve kıvamı" },
  { id: "congestion", label: "Burun Tıkanıklığı", detail: "Nazal obstrüksiyon şiddeti" },
  { id: "itching",    label: "Burun Kaşıntısı",   detail: "Nazal kaşıntı şiddeti" },
  { id: "sneezing",   label: "Hapşırık",          detail: "Hapşırık sıklığı" },
];

const OPTIONS = [
  { pts: 0, label: "Yok" },
  { pts: 1, label: "Hafif" },
  { pts: 2, label: "Orta" },
  { pts: 3, label: "Ağır" },
];

const getBand = (v: number) =>
  v <= 3  ? { label: "HAFİF",  color: "emerald", sub: "Semptom yükü minimal" } :
  v <= 7  ? { label: "ORTA",   color: "amber",   sub: "Klinik anlamlı semptomlar" } :
             { label: "AĞIR",  color: "rose",    sub: "Yoğun semptom yükü — tedavi optimizasyonu" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function TNSSPage() {
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
        <ToolTopNav toolSlug="tnss" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🤧</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">TNSS</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Total Nazal Semptom Skoru · Alerjik Rinit · 0–12 Puan</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/4 semptom değerlendirildi</span>
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
              <div className="flex gap-2">
                {OPTIONS.map(opt => (
                  <button key={opt.pts} type="button"
                    onClick={() => setSel(s => ({ ...s, [item.id]: s[item.id] === opt.pts ? null : opt.pts }))}
                    className={`flex-1 flex flex-col items-center py-2 rounded-xl border-2 text-[9px] font-black transition-all
                      ${sel[item.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200"}`}>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black mb-1
                      ${sel[item.id] === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                    <span className="uppercase tracking-widest">{opt.label}</span>
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
                <span className="text-[8px] font-black text-blue-300 uppercase">TNSS</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 12</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
              </div>
            </div>
            <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(total / 12) * 100}%`, background: band.color === "emerald" ? "#10b981" : band.color === "amber" ? "#f59e0b" : "#f43f5e" }} />
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 4 semptomu değerlendirin</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              TNSS klinik çalışmalarda ve alerjen provokasyon testlerinde standart endpoint olarak kullanılır. Göz semptomlarını içermez — göz semptomları için TOSS (Total Ocular Symptom Score) eklenmelidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
