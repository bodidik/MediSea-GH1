"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// RAPID3 = HAQ-II (13 soru yerine 3 HAQ sorusu) × 10/3 + Ağrı VAS/10 + Global VAS/10 → 0-30
// Basitleştirilmiş versiyon: 3 etkinlik sorusu (0-3 her biri) + ağrı (0-10) + global (0-10)

const FUNCTION_ITEMS = [
  { id: "f1", q: "Giyinme (düğmeleme, fermuar gibi) dahil kendinize bakabilir misiniz?" },
  { id: "f2", q: "Ayağa kalkma (yataktan veya kolsuz sandalyeden) yapabilir misiniz?" },
  { id: "f3", q: "Yeme (et kesme, ekmek sürme dahil) yapabilir misiniz?" },
  { id: "f4", q: "Yürüme (düz zeminde) yapabilir misiniz?" },
  { id: "f5", q: "Banyo yapma (silme, kurulama dahil) yapabilir misiniz?" },
  { id: "f6", q: "Bükülme (yerden nesne alma) yapabilir misiniz?" },
  { id: "f7", q: "Grip açma (su musluğu, kavanoz kapağı) yapabilir misiniz?" },
  { id: "f8", q: "Alışveriş (alışveriş merkezine gitme) yapabilir misiniz?" },
  { id: "f9", q: "Günlük aktiviteleri gerçekleştirme yapabilir misiniz?" },
  { id: "f10",q: "Arkadaş ve akrabalarla bir arada olma yapabilir misiniz?" },
];

const FUNC_OPTS = [
  { pts: 0, label: "Hiç güçlük yok" },
  { pts: 1, label: "Biraz güçlük" },
  { pts: 2, label: "Çok güçlük" },
  { pts: 3, label: "Yapamıyorum" },
];

const getBand = (v: number) =>
  v <= 3  ? { label: "REMİSYON",      color: "emerald", sub: "Hastalık aktivitesi minimal" } :
  v <= 6  ? { label: "DÜŞÜK AKTİVİTE",color: "sky",     sub: "Düşük hastalık aktivitesi" } :
  v <= 12 ? { label: "ORTA AKTİVİTE", color: "amber",   sub: "Orta hastalık aktivitesi — tedavi optimizasyonu" } :
             { label: "YÜKSEK AKTİVİTE",color:"rose",    sub: "Yüksek aktivite — tedavi değişikliği değerlendir" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     badge: "bg-sky-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function RAPID3Page() {
  const [func, setFunc] = React.useState<Record<string, number | null>>(
    Object.fromEntries(FUNCTION_ITEMS.map(i => [i.id, null]))
  );
  const [pain,   setPain]   = React.useState<number | null>(null);
  const [global, setGlobal] = React.useState<number | null>(null);

  const funcAnswered = Object.values(func).filter(v => v !== null).length;
  const allDone = funcAnswered === 10 && pain !== null && global !== null;

  const funcSum = funcAnswered === 10 ? Object.values(func).reduce<number>((s, v) => s + (v ?? 0), 0) : null;
  // RAPID3 = funcSum (0-30) + pain (0-10) + global (0-10) = 0-30 (pain ve global 0-10 normalize edilir)
  const total = allDone && funcSum !== null
    ? parseFloat((funcSum + pain! + global!).toFixed(1))
    : null;

  const band = total !== null ? getBand(total) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="rapid3" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">⚡</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">RAPID3</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Rutin Hasta İndeksi · RA Takip Aracı · 0–30 Puan</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{funcAnswered}/10 işlev + {[pain, global].filter(v => v !== null).length}/2 semptom</span>
          <div className="flex gap-0.5">
            {FUNCTION_ITEMS.map(i => (
              <div key={i.id} className={`w-3 h-2 rounded-sm transition-all ${func[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm space-y-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">İşlevsel Durum — Son 1 Hafta</p>
          {FUNCTION_ITEMS.map((item, idx) => (
            <div key={item.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50">
              <p className="text-[10px] font-bold text-blue-950 mb-2">
                <span className="font-black text-slate-400 mr-1.5">{idx + 1}.</span>{item.q}
              </p>
              <div className="flex gap-1.5">
                {FUNC_OPTS.map(opt => (
                  <button key={opt.pts} type="button"
                    onClick={() => setFunc(s => ({ ...s, [item.id]: s[item.id] === opt.pts ? null : opt.pts }))}
                    className={`flex-1 py-1.5 rounded-lg border-2 text-[8px] font-black uppercase tracking-widest transition-all
                      ${func[item.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"}`}>
                    {opt.pts}<br/>{opt.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="font-black text-blue-900 uppercase italic text-sm mb-4">Ağrı (Son 1 Hafta) — 0 = Ağrı Yok · 10 = En Kötü Ağrı</p>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 11 }, (_, v) => (
              <button key={v} type="button" onClick={() => setPain(p => p === v ? null : v)}
                className={`w-9 h-9 rounded-xl border-2 text-[11px] font-black transition-all
                  ${pain === v ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300"}`}>{v}</button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="font-black text-blue-900 uppercase italic text-sm mb-4">Global Değerlendirme (Son 1 Hafta) — 0 = Çok İyi · 10 = Çok Kötü</p>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 11 }, (_, v) => (
              <button key={v} type="button" onClick={() => setGlobal(g => g === v ? null : v)}
                className={`w-9 h-9 rounded-xl border-2 text-[11px] font-black transition-all
                  ${global === v ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300"}`}>{v}</button>
            ))}
          </div>
        </div>

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">RAPID3</span>
                <span className="text-3xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 30</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[8px]">
              {[
                { l: "Remisyon", r: "≤ 3" },
                { l: "Düşük", r: "3.1–6" },
                { l: "Orta", r: "6.1–12" },
                { l: "Yüksek", r: "> 12" },
              ].map(b => (
                <div key={b.l} className={`rounded-lg p-1.5 font-black
                  ${band.label.includes(b.l.toUpperCase().split(" ")[0]) || (b.l === "Remisyon" && band.label === "REMİSYON") ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold">{b.r}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">10 işlev sorusu + ağrı + global değerlendirmeyi tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={{ ...Object.fromEntries(Object.entries(func).map(([k, v]) => [k, v ?? 0])), pain: pain ?? 0, global: global ?? 0 }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              RAPID3 poliklinik ortamında DAS28 veya CDAI ile benzer duyarlılık gösterir ve 30 saniyede tamamlanabilir. Parmenter & Pincus, Clin Exp Rheumatol 2009.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
