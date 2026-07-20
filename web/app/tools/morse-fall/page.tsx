"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS: { id: string; label: string; detail: string; options: { label: string; pts: number }[] }[] = [
  {
    id: "history",
    label: "Düşme Öyküsü",
    detail: "Son 3 ayda veya mevcut hastane yatışında",
    options: [{ label: "Yok", pts: 0 }, { label: "Var", pts: 25 }],
  },
  {
    id: "diagnosis",
    label: "İkincil (Ek) Tanı",
    detail: "Birden fazla tıbbi tanı",
    options: [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 15 }],
  },
  {
    id: "aid",
    label: "Yürüme Yardımcısı",
    detail: "Kullanılan mobilizasyon desteği",
    options: [
      { label: "Yok / Yatak istirahati / Hemşire yardımı", pts: 0 },
      { label: "Koltuk değneği / Baston / Yürüteç", pts: 15 },
      { label: "Mobilya tutarak yürüme", pts: 30 },
    ],
  },
  {
    id: "iv",
    label: "IV Erişim / Heparin Kilidi",
    detail: "Aktif IV hat veya heparin kilitli kateter",
    options: [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 20 }],
  },
  {
    id: "gait",
    label: "Yürüyüş / Transfer",
    detail: "Hastanın yürüyüş ve transfer kalitesi",
    options: [
      { label: "Normal / Yatak istirahati / Tekerlekli sandalye", pts: 0 },
      { label: "Zayıf (kısa/kambur adımlar, ağır kalkar)", pts: 10 },
      { label: "Bozuk (dengesiz, tutunarak, sürünerek)", pts: 20 },
    ],
  },
  {
    id: "mental",
    label: "Mental Durum",
    detail: "Öz kapasiteye ilişkin farkındalık",
    options: [
      { label: "Kapasitesinin farkında (oryante)", pts: 0 },
      { label: "Kapasitesini fazla tahmin ediyor / unutuyor", pts: 15 },
    ],
  },
];

const BANDS = [
  { max: 24,  label: "DÜŞÜK RİSK",  color: "emerald", action: "İyi bakım uygulamaları yeterli" },
  { max: 44,  label: "ORTA RİSK",   color: "amber",   action: "Standart düşme önleme protokolü uygula" },
  { max: 999, label: "YÜKSEK RİSK", color: "rose",    action: "Yüksek riskli düşme önleme protokolü — bariyer, alarm, gözetim" },
];

const COLOR = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function MorseFallPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const band = total !== null ? BANDS.find(b => total <= b.max)! : null;
  const c = band ? COLOR[band.color as keyof typeof COLOR] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="morse-fall" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🚶</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Morse Düşme Riski</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Hastanede Düşme Riski Değerlendirme Skalası · 6 Madde</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/6 madde tamamlandı</span>
          <div className="flex gap-1">
            {ITEMS.map(i => (
              <div key={i.id} className={`w-8 h-2 rounded-full transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
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
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
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
                <span className="text-[8px] font-black text-blue-300 uppercase">SKOR</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.action}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
              {[
                { l: "Düşük Risk", r: "< 25", col: "emerald" },
                { l: "Orta Risk", r: "25–44", col: "amber" },
                { l: "Yüksek Risk", r: "≥ 45", col: "rose" },
              ].map(b => (
                <div key={b.l} className={`rounded-xl p-2 font-black uppercase
                  ${b.l === band.label ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold normal-case">{b.r}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 6 maddeyi tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Morse Düşme Skalası yatarak tedavi gören hastalarda düşme riskini öngörür. Yüksek riskli hastalarda zemin işaretçileri, yatak alarmı ve çağrı zili erişilebilirliği sağlanmalıdır. Morse et al., 1989.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
