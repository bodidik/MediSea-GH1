"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS: { id: string; q: string; options: { label: string; pts: number }[] }[] = [
  {
    id: "q1",
    q: "Son 4 haftada astımınız nedeniyle işte, okulda veya evde işlerinizi ne sıklıkla yapamadınız?",
    options: [
      { label: "Her zaman", pts: 1 },
      { label: "Çoğunlukla", pts: 2 },
      { label: "Bazen", pts: 3 },
      { label: "Nadiren", pts: 4 },
      { label: "Hiç", pts: 5 },
    ],
  },
  {
    id: "q2",
    q: "Son 4 haftada ne sıklıkla nefes darlığı yaşadınız?",
    options: [
      { label: "Günde birden fazla", pts: 1 },
      { label: "Günde bir kez", pts: 2 },
      { label: "Haftada 3–6 kez", pts: 3 },
      { label: "Haftada 1–2 kez", pts: 4 },
      { label: "Hiç", pts: 5 },
    ],
  },
  {
    id: "q3",
    q: "Son 4 haftada astım belirtileri (hırıltı, öksürük, nefes darlığı, göğüste sıkışma, ağrı) nedeniyle ne sıklıkla gece uyandınız veya sabah her zamankinden erken kalktınız?",
    options: [
      { label: "Haftada 4 gece ve daha fazla", pts: 1 },
      { label: "Haftada 2–3 gece", pts: 2 },
      { label: "Haftada 1 kez", pts: 3 },
      { label: "1–2 kez", pts: 4 },
      { label: "Hiç", pts: 5 },
    ],
  },
  {
    id: "q4",
    q: "Son 4 haftada kısa etkili inhaler (salbutamol gibi) ne sıklıkla kullandınız?",
    options: [
      { label: "Günde 3 kez veya daha fazla", pts: 1 },
      { label: "Günde 1–2 kez", pts: 2 },
      { label: "Haftada 2–3 kez", pts: 3 },
      { label: "Haftada 1 kez veya daha az", pts: 4 },
      { label: "Hiç", pts: 5 },
    ],
  },
  {
    id: "q5",
    q: "Astımınızı genel olarak nasıl değerlendirirsiniz?",
    options: [
      { label: "Hiç kontrol altında değil", pts: 1 },
      { label: "Kötü kontrollü", pts: 2 },
      { label: "Biraz kontrollü", pts: 3 },
      { label: "İyi kontrollü", pts: 4 },
      { label: "Tamamen kontrollü", pts: 5 },
    ],
  },
];

const getBand = (v: number) =>
  v >= 25 ? { label: "TAM KONTROL",          sub: "Astımınız tam kontrol altında",                 color: "emerald" } :
  v >= 20 ? { label: "İYİ KONTROL",           sub: "Kontrol iyidir — tedaviyi sürdürün",            color: "sky" } :
             { label: "KONTROL ALTINDA DEĞİL",sub: "Hekim ile görüşün — tedavi düzenlenmeli",       color: "rose" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     badge: "bg-sky-700 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function ACTPage() {
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
        <ToolTopNav toolSlug="act" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🌬️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">ACT</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Astım Kontrol Testi · 5 Soru · 5–25 Puan</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/5 soru yanıtlandı</span>
          <div className="flex gap-1">
            {ITEMS.map(i => (
              <div key={i.id} className={`w-8 h-2 rounded-full transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map((item, idx) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-blue-950 mb-3 leading-snug">
                <span className="font-black text-slate-400 mr-1.5">{idx + 1}.</span>{item.q}
              </p>
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

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[8px] font-black text-blue-300 uppercase">ACT</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 25</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center text-[8px]">
              {[
                { l: "Kontrol Dışı", r: "< 20", active: total < 20 },
                { l: "İyi Kontrol", r: "20–24", active: total >= 20 && total < 25 },
                { l: "Tam Kontrol", r: "25", active: total === 25 },
              ].map(b => (
                <div key={b.l} className={`rounded-lg p-1.5 font-black
                  ${b.active ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold">{b.r}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 5 soruyu yanıtlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              ACT hasta bildirimine dayalı bir değerlendirme aracıdır; spirometri veya provokasyon testinin yerine geçmez. Nathan et al., J Allergy Clin Immunol 2004.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
