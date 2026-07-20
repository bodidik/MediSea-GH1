"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS = [
  { id: "age",    label: "Yaş",                  detail: "60 yaşın üzerinde olma",                options: [{ label: "≤ 60", pts: 0 }, { label: "> 60", pts: 1 }] },
  { id: "stage",  label: "Ann Arbor Evresi",     detail: "Hastalık tutulum yaygınlığı",            options: [{ label: "Evre I–II", pts: 0 }, { label: "Evre III–IV", pts: 1 }] },
  { id: "hgb",    label: "Hemoglobin",           detail: "Serum hemoglobin düzeyi",                options: [{ label: "≥ 12 g/dL", pts: 0 }, { label: "< 12 g/dL", pts: 1 }] },
  { id: "ldh",    label: "LDH",                  detail: "Serum LDH (normal üst sınırına göre)", options: [{ label: "Normal veya altı", pts: 0 }, { label: "Normal üzeri", pts: 1 }] },
  { id: "nodal",  label: "Nodal Alan Sayısı",    detail: "Tutulmuş lenf bezi bölgesi sayısı",    options: [{ label: "≤ 4 bölge", pts: 0 }, { label: "> 4 bölge", pts: 1 }] },
];

const BANDS = [
  { min: 0, max: 1, label: "DÜŞÜK RİSK",  os10: "%71", pf10: "%71", color: "emerald" },
  { min: 2, max: 2, label: "ORTA RİSK",   os10: "%51", pf10: "%50", color: "amber" },
  { min: 3, max: 5, label: "YÜKSEK RİSK", os10: "%36", pf10: "%25", color: "rose" },
];

const COLOR = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function FLIPIPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const band = total !== null ? BANDS.find(b => total >= b.min && total <= b.max)! : null;
  const c = band ? COLOR[band.color as keyof typeof COLOR] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="flipi" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🔵</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">FLIPI</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Foliküler Lenfoma Uluslararası Prognostik İndeks · 0–5 Puan</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/5 kriter</span>
          <div className="flex gap-1">
            {ITEMS.map(i => (
              <div key={i.id} className={`w-8 h-2 rounded-full transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
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

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[8px] font-black text-blue-300 uppercase">FLIPI</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 5</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <div className="flex gap-4 mt-1">
                  <div>
                    <p className="text-[8px] text-slate-500 font-bold uppercase">10 Yıllık OS</p>
                    <p className={`text-lg font-black italic ${c.text}`}>{band.os10}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-500 font-bold uppercase">10 Yıllık PF</p>
                    <p className={`text-lg font-black italic ${c.text}`}>{band.pf10}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center text-[8px]">
              {BANDS.map(b => (
                <div key={b.label} className={`rounded-lg p-1.5 font-black
                  ${b.label === band.label ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div className="uppercase">{b.min === b.max ? `${b.min}` : `${b.min}–${b.max}`} pt</div>
                  <div className="font-bold">{b.label.split(" ")[0]}</div>
                  <div className="text-[7px]">OS {b.os10}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 5 kriteri tamamlayın</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-2">FLIPI-2</p>
          <p className="text-[10px] text-blue-800">2009 güncellemesi ile β2-mikroglobulin, kemik iliği tutulumu, en büyük lenf nodu çapı (> 6 cm), hemoglobin ve yaş (> 60) kriterleri kullanılır. Günümüzde obinutuzumab-kemoterapisi çağında PRIMA-PI (β2M + KİT) daha sık tercih edilmektedir.</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              FLIPI bekleme-izleme ve immünokemoterapi öncesi dönem verilerine dayanır. Güncel anti-CD20 kombinasyonlarında mutlak sağkalım değerleri farklılık gösterir. Solal-Céligny et al., Blood 2004.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
