"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS = [
  { id: "cough",     a: "Hiç öksürmüyorum",              b: "Her zaman öksürüyorum" },
  { id: "phlegm",   a: "Hiç balgam yok",                 b: "Göğsüm tamamen balgam dolu" },
  { id: "chest",    a: "Göğsüm hiç sıkışmıyor",          b: "Göğsüm çok fazla sıkışıyor" },
  { id: "breath",   a: "Yokuş veya merdiven çıkarken nefes darlığı yok", b: "Yokuş veya merdiven çıkarken çok fazla nefes darlığı" },
  { id: "activity", a: "Evdeki aktivitelerde hiç kısıtlama yok", b: "Evdeki aktivitelerde çok fazla kısıtlama var" },
  { id: "confident",a: "KOAH'ıma rağmen evden çıkmaktan çekinmiyorum", b: "KOAH nedeniyle evden çıkmaktan çekiniyorum" },
  { id: "sleep",    a: "Uyku çok iyidir",                b: "KOAH nedeniyle uyku çok kötüdür" },
  { id: "energy",   a: "Çok enerjiliyim",                b: "Hiç enerjim yok" },
];

const BANDS = [
  { max: 9,  label: "DÜŞÜK ETKİ",    color: "emerald", action: "Hafif semptomlar — yaşam kalitesi iyi korunmuş" },
  { max: 20, label: "ORTA ETKİ",     color: "amber",   action: "Günlük yaşamı etkiliyor — tedavi gözden geçirilmeli" },
  { max: 30, label: "YÜKSEK ETKİ",   color: "orange",  action: "Ciddi etki — uzman değerlendirme ve tedavi optimizasyonu" },
  { max: 40, label: "ÇOK YÜKSEK",    color: "rose",    action: "Çok ağır etki — kapsamlı yönetim planı gerekli" },
];

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function CatCopdPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const band = total !== null ? BANDS.find(b => total <= b.max)! : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="cat-copd" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">💨</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">CAT Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">KOAH Değerlendirme Testi · 8 Madde · 0–40 Puan</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/8 soru yanıtlandı</span>
          <div className="flex gap-1">
            {ITEMS.map(i => (
              <div key={i.id} className={`w-5 h-2 rounded-full transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map((item, idx) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-[10px] font-bold text-slate-600 flex-1 leading-snug">{item.a}</p>
                <span className="text-[9px] font-black text-slate-400 shrink-0">Madde {idx + 1}</span>
                <p className="text-[10px] font-bold text-slate-600 flex-1 text-right leading-snug">{item.b}</p>
              </div>
              <div className="flex gap-1 justify-center">
                {[0, 1, 2, 3, 4, 5].map(v => (
                  <button key={v} type="button"
                    onClick={() => setSel(s => ({ ...s, [item.id]: s[item.id] === v ? null : v }))}
                    className={`w-9 h-9 rounded-xl border-2 text-[11px] font-black transition-all
                      ${sel[item.id] === v ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300"}`}>
                    {v}
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
                <span className="text-[8px] font-black text-blue-300 uppercase">CAT</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 40</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.action}</p>
              </div>
            </div>
            <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(total / 40) * 100}%`, background: band.color === "emerald" ? "#10b981" : band.color === "amber" ? "#f59e0b" : band.color === "orange" ? "#f97316" : "#f43f5e" }} />
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[8px]">
              {BANDS.map(b => (
                <div key={b.label} className={`rounded-lg p-1.5 font-black
                  ${b.label === band.label ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div className="uppercase">{b.label.split(" ")[0]}</div>
                  <div className="font-bold">≤ {b.max} pt</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 8 soruyu yanıtlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              CAT semptom yükünü değerlendirir; spirometri ile birlikte GOLD sınıflaması yapılır. ≥ 10 puan klinik anlamlı semptom yükü olarak kabul edilir. Jones et al., ERJ 2009.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
