"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// SCORAD = A/5 + 7B/2 + C/10
// A: vücut yüzey alanı tutulum % (0-100)
// B: yoğunluk skorları toplamı (6 kriter × 0-3 = 0-18)
// C: subjektif semptomlar (kaşıntı 0-10 + uyku bozukluğu 0-10 = 0-20)

const INTENSITY_ITEMS = [
  { id: "erythema",      label: "Eritem",          detail: "Kızarıklık derecesi" },
  { id: "edema",         label: "Ödem / Papül",    detail: "Şişlik / papülasyon" },
  { id: "oozing",        label: "Islak / Kabuk",   detail: "Akıntı veya kurutlanma" },
  { id: "excoriation",   label: "Ekskoriasyon",    detail: "Tırnak izi / sıyrık" },
  { id: "lichenification",label: "Likenifikasyon", detail: "Deri kalınlaşması" },
  { id: "dryness",       label: "Kuruluk",         detail: "Aktiflenmemiş alanlarda" },
];

const INT_OPTS = [
  { pts: 0, label: "Yok" },
  { pts: 1, label: "Hafif" },
  { pts: 2, label: "Orta" },
  { pts: 3, label: "Ağır" },
];

const AREA_OPTS = [
  { pts: 0,  label: "Yok (0%)" },
  { pts: 10, label: "Çok Az (1–9%)" },
  { pts: 25, label: "Az (10–29%)" },
  { pts: 50, label: "Yarısı (30–49%)" },
  { pts: 70, label: "Büyük Kısım (50–69%)" },
  { pts: 85, label: "Neredeyse Hepsi (70–89%)" },
  { pts: 100,label: "Tamamı (90–100%)" },
];

const getBand = (v: number) =>
  v < 25  ? { label: "HAFİF",  color: "emerald", sub: "Topikal bazal tedavi yeterli olabilir" } :
  v < 50  ? { label: "ORTA",   color: "amber",   sub: "Topikal steroid/kalsinörin inhibitörü + nemlendiriciler" } :
             { label: "AĞIR",  color: "rose",    sub: "Sistemik veya biyolojik tedavi değerlendir (dupilumab vb.)" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function SCORADPage() {
  const [area,  setArea]  = React.useState<number | null>(null);
  const [intSel,setIntSel]= React.useState<Record<string, number | null>>(
    Object.fromEntries(INTENSITY_ITEMS.map(i => [i.id, null]))
  );
  const [pruritus, setPruritus] = React.useState<number | null>(null);
  const [sleep,    setSleep]    = React.useState<number | null>(null);

  const intAnswered = Object.values(intSel).filter(v => v !== null).length;
  const allDone = area !== null && intAnswered === 6 && pruritus !== null && sleep !== null;

  const B = intAnswered === 6 ? Object.values(intSel).reduce<number>((s, v) => s + (v ?? 0), 0) : null;
  const C = pruritus !== null && sleep !== null ? pruritus + sleep : null;
  const total = allDone && B !== null && C !== null
    ? Math.round((area! / 5) + (7 * B / 2) + (C / 10))
    : null;

  const band = total !== null ? getBand(total) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="scorad" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🧴</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">SCORAD</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Atopik Dermatit Şiddet Skoru · Alan + Yoğunluk + Subjektif</p>
          </div>
        </div>

        {/* A: Alan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">A — Tutulum Alanı</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Atopik dermatit lezyonlarının vücut yüzeyine oranı (kural-9 veya genel tahmini)</p>
          <div className="space-y-1.5">
            {AREA_OPTS.map(opt => (
              <button key={opt.pts} type="button"
                onClick={() => setArea(a => a === opt.pts ? null : opt.pts)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all
                  ${area === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                <span className={`w-8 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0
                  ${area === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* B: Yoğunluk */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">B — Yoğunluk Kriterleri</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Temsili bir lezyonu değerlendirin · Her kriter 0–3</p>
          <div className="space-y-3">
            {INTENSITY_ITEMS.map(item => (
              <div key={item.id}>
                <p className="text-[10px] font-black text-blue-900 mb-1">{item.label} <span className="text-slate-400 font-bold normal-case">— {item.detail}</span></p>
                <div className="flex gap-1.5">
                  {INT_OPTS.map(opt => (
                    <button key={opt.pts} type="button"
                      onClick={() => setIntSel(s => ({ ...s, [item.id]: s[item.id] === opt.pts ? null : opt.pts }))}
                      className={`flex-1 py-2 rounded-xl border-2 text-[9px] font-black transition-all
                        ${intSel[item.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200"}`}>
                      {opt.pts} — {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {B !== null && <div className="text-right text-[9px] font-black text-blue-900">B toplamı: {B}/18</div>}
          </div>
        </div>

        {/* C: Subjektif */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">C — Subjektif Semptomlar</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Son 3 gün/gece için 0–10 skalası</p>
          {[
            { label: "Kaşıntı (pruritus)", val: pruritus, set: setPruritus },
            { label: "Uyku Bozukluğu", val: sleep, set: setSleep },
          ].map(({ label, val, set }) => (
            <div key={label} className="mb-3">
              <p className="text-[10px] font-black text-blue-900 mb-2">{label}</p>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: 11 }, (_, v) => (
                  <button key={v} type="button" onClick={() => set(s => s === v ? null : v)}
                    className={`w-8 h-8 rounded-xl border-2 text-[10px] font-black transition-all
                      ${val === v ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300"}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-3`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">SCORAD</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ ~103</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
                <p className="text-[9px] font-bold text-slate-500 mt-1">A/5={Math.round(area!/5)} · 7B/2={Math.round(7*B!/2)} · C/10={Math.round(C!/10)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A + B (6 kriter) + C bölümlerini tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={{ area: area ?? 0, ...intSel, pruritus: pruritus ?? 0, sleep: sleep ?? 0 } as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              SCORAD klinisyen tarafından uygulanan objektif bir araçtır; hasta bildirimli POEM ile tamamlanmalıdır. SCORAD ≥ 40 sistemik/biyolojik tedavi endikasyonunu destekler. ETFAD/EADV, 1993.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
