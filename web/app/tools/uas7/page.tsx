"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const WHEAL_OPTS = [
  { pts: 0, label: "Yok" },
  { pts: 1, label: "Hafif (< 20 küçük kabarıklık)" },
  { pts: 2, label: "Orta (20–50 veya büyük alanlar)" },
  { pts: 3, label: "Yoğun (> 50 veya dev kabarıklıklar)" },
];
const ITCH_OPTS = [
  { pts: 0, label: "Yok" },
  { pts: 1, label: "Hafif (rahatsız edici değil)" },
  { pts: 2, label: "Orta (rahatsız edici ama tolere edilebilir)" },
  { pts: 3, label: "Ağır (dayanılmaz, aktiviteyi etkiliyor)" },
];

const getBand = (v: number) =>
  v === 0     ? { label: "SEMPTOMSUZ",          color: "emerald", sub: "Hastalık aktivitesi yok" } :
  v <= 6      ? { label: "İYİ KONTROLLÜ",        color: "sky",     sub: "Minimal aktivite" } :
  v <= 15     ? { label: "HAFİF AKTİF",          color: "amber",   sub: "Hafif hastalık aktivitesi" } :
  v <= 27     ? { label: "ORTA AKTİF",           color: "orange",  sub: "Orta hastalık aktivitesi" } :
               { label: "AĞIR AKTİF",            color: "rose",    sub: "Ağır hastalık aktivitesi — biyolojik tedavi değerlendir" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     badge: "bg-sky-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function UAS7Page() {
  const [wheal, setWheal] = React.useState<(number | null)[]>(Array(7).fill(null));
  const [itch,  setItch]  = React.useState<(number | null)[]>(Array(7).fill(null));
  const [expanded, setExpanded] = React.useState<number>(0);

  const answered = wheal.filter(v => v !== null).length + itch.filter(v => v !== null).length;
  const allDone = wheal.every(v => v !== null) && itch.every(v => v !== null);
  const total = allDone
    ? wheal.reduce((s, v, i) => s + (v ?? 0) + (itch[i] ?? 0), 0)
    : null;

  const band = total !== null ? getBand(total) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="uas7" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🔴</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">UAS7</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Ürtiker Aktivite Skoru 7 · Kronik Spontan Ürtiker · 0–42 Puan</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{Math.floor(answered / 2)}/7 gün tamamlandı</span>
          <div className="flex gap-1">
            {DAYS.map((_, i) => (
              <div key={i} className={`w-5 h-2 rounded-full transition-all
                ${wheal[i] !== null && itch[i] !== null ? "bg-blue-900" : wheal[i] !== null || itch[i] !== null ? "bg-blue-400" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {DAYS.map((day, i) => {
            const done = wheal[i] !== null && itch[i] !== null;
            const dayScore = done ? (wheal[i]! + itch[i]!) : null;
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <button type="button" onClick={() => setExpanded(expanded === i ? -1 : i)}
                  className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black
                      ${done ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-500"}`}>{i + 1}</div>
                    <span className="font-black text-sm text-blue-900">{day}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {dayScore !== null && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-900 text-white">{dayScore} pt</span>
                    )}
                    <span className={`text-slate-400 transition-transform ${expanded === i ? "rotate-180" : ""}`}>▾</span>
                  </div>
                </button>
                {expanded === i && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Kabarıklık (Pomf)</p>
                      <div className="space-y-1">
                        {WHEAL_OPTS.map(opt => (
                          <button key={opt.pts} type="button"
                            onClick={() => { const a = [...wheal]; a[i] = opt.pts; setWheal(a); }}
                            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold transition-all
                              ${wheal[i] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0
                              ${wheal[i] === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Kaşıntı Şiddeti</p>
                      <div className="space-y-1">
                        {ITCH_OPTS.map(opt => (
                          <button key={opt.pts} type="button"
                            onClick={() => { const a = [...itch]; a[i] = opt.pts; setItch(a); }}
                            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold transition-all
                              ${itch[i] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0
                              ${itch[i] === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[8px] font-black text-blue-300 uppercase">UAS7</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 42</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1 text-center text-[7px]">
              {[
                { l: "Semptomsuz", r: "0", active: total === 0 },
                { l: "İyi Kontrol", r: "1–6", active: total >= 1 && total <= 6 },
                { l: "Hafif", r: "7–15", active: total >= 7 && total <= 15 },
                { l: "Orta", r: "16–27", active: total >= 16 && total <= 27 },
                { l: "Ağır", r: "28–42", active: total >= 28 },
              ].map(b => (
                <div key={b.l} className={`rounded-lg p-1 font-black ${b.active ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold">{b.r}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">7 günün tamamını doldurun</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={Object.fromEntries([...wheal.map((v, i) => [`w${i}`, v ?? 0]), ...itch.map((v, i) => [`k${i}`, v ?? 0])])} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              UAS7 ≥ 28 omalizumab tedavisi başlamak için eşik değer olarak kabul edilmektedir. Hasta sabah bildirim esasına dayanır; her gün aynı saatte değerlendirme önerilir. Zuberbier et al., Allergy 2022.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
