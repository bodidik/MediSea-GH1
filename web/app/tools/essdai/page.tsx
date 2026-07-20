"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// ESSDAI — 12 domain, her birinde 0/1/2/3 aktivite seviyeleri (bazılarında sınırlı seçenek)
const DOMAINS: { id: string; label: string; weight: number; options: { level: number; label: string; pts: number }[] }[] = [
  {
    id: "constitutional", label: "Anayasal", weight: 3,
    options: [
      { level: 0, label: "Yok", pts: 0 },
      { level: 1, label: "Hafif/Orta (ateş < 38.5°C, gece terlemesi, kilo kaybı < %10)", pts: 3 },
      { level: 2, label: "Ağır (ateş ≥ 38.5°C veya kilo kaybı ≥ %10)", pts: 6 },
    ],
  },
  {
    id: "lymphadenopathy", label: "Lenf Bezi / Lenfoma", weight: 4,
    options: [
      { level: 0, label: "Yok", pts: 0 },
      { level: 1, label: "LAP (çap < 2 cm, tüm bölgelerde) VEYA splenomegali", pts: 4 },
      { level: 2, label: "LAP ≥ 2 cm, 1 bölge VEYA > 3 cm, 1 yerde", pts: 8 },
      { level: 3, label: "B hücreli lenfoma mevcut", pts: 12 },
    ],
  },
  {
    id: "glandular", label: "Bez (Tükürük/Lakrimal)", weight: 2,
    options: [
      { level: 0, label: "Yok", pts: 0 },
      { level: 1, label: "Hafif bez büyümesi (parotis < 3 cm, submandibular < 1.5 cm)", pts: 2 },
      { level: 2, label: "Orta/Ağır bez büyümesi", pts: 4 },
    ],
  },
  {
    id: "articular", label: "Eklem", weight: 2,
    options: [
      { level: 0, label: "Yok", pts: 0 },
      { level: 1, label: "Artralji veya sabah tutukluğu", pts: 2 },
      { level: 2, label: "Sinovit — 1–5 eklem", pts: 4 },
      { level: 3, label: "Sinovit — > 5 eklem", pts: 6 },
    ],
  },
  {
    id: "cutaneous", label: "Kutanöz", weight: 3,
    options: [
      { level: 0, label: "Yok", pts: 0 },
      { level: 1, label: "Eritema anüler, kutanöz vaskülit sınırlı (< %18 BSA)", pts: 3 },
      { level: 2, label: "Ürtiker vaskülit, kutanöz vaskülit yaygın (≥ %18 BSA)", pts: 6 },
    ],
  },
  {
    id: "pulmonary", label: "Pulmoner", weight: 5,
    options: [
      { level: 0, label: "Yok", pts: 0 },
      { level: 1, label: "Hafif: öksürük veya DLCO > %70", pts: 5 },
      { level: 2, label: "Orta: DLCO 40–70% veya FVC 60–80%", pts: 10 },
      { level: 3, label: "Ağır: FVC < 60% veya aktif alveolit", pts: 15 },
    ],
  },
  {
    id: "renal", label: "Renal", weight: 5,
    options: [
      { level: 0, label: "Yok (GFR ≥ 60, proteinüri < 0.5 g/g, aktif sediment yok)", pts: 0 },
      { level: 1, label: "Hafif: GFR 60+, proteinüri 0.5–1 g/g", pts: 5 },
      { level: 2, label: "Orta: GFR 30–60, glomerülonefrit aktif", pts: 10 },
      { level: 3, label: "Ağır: GFR < 30", pts: 15 },
    ],
  },
  {
    id: "muscular", label: "Kas", weight: 6,
    options: [
      { level: 0, label: "Yok", pts: 0 },
      { level: 1, label: "Hafif miyozit (CK normal veya hafif yüksek)", pts: 6 },
      { level: 2, label: "Orta miyozit (CK yüksek, kas güçsüzlüğü)", pts: 12 },
      { level: 3, label: "Ağır miyozit", pts: 18 },
    ],
  },
  {
    id: "pns", label: "Periferik Sinir Sistemi", weight: 5,
    options: [
      { level: 0, label: "Yok", pts: 0 },
      { level: 1, label: "Saf duyusal periferik nöropati", pts: 5 },
      { level: 2, label: "Aksonal duyusal-motor nöropati veya kranyal sinir tutulumu", pts: 10 },
      { level: 3, label: "Motor nöropati, vaskülit veya beyin sapı tutulumu", pts: 15 },
    ],
  },
  {
    id: "cns", label: "Merkezi Sinir Sistemi", weight: 5,
    options: [
      { level: 0, label: "Yok", pts: 0 },
      { level: 2, label: "Orta: kognitif bozukluk, optik nevrit", pts: 10 },
      { level: 3, label: "Ağır: serebral vaskülit, vaskülopati, progresif SSS tutulumu", pts: 15 },
    ],
  },
  {
    id: "hematological", label: "Hematolojik", weight: 2,
    options: [
      { level: 0, label: "Yok", pts: 0 },
      { level: 1, label: "Sitopenilerden 1 tanesi (lenfopeni 500–1000/mm³, Plt 100–150K)", pts: 2 },
      { level: 2, label: "Sitopenilerden 1 tanesi (lökopeni < 1000, lenfopeni < 500, Plt < 100K)", pts: 4 },
      { level: 3, label: "Aplastik anemi veya otoimmün hemolitik anemi", pts: 6 },
    ],
  },
  {
    id: "biological", label: "Biyolojik (Lab)", weight: 1,
    options: [
      { level: 0, label: "Yok (IgG normal, negatif kriyo ve kompleman normal)", pts: 0 },
      { level: 1, label: "IgG > 16 g/L, pozitif kriyo VEYA düşük C3 ya da C4", pts: 1 },
      { level: 2, label: "Yukarıdakilerin 2 veya daha fazlası", pts: 2 },
    ],
  },
];

const getBand = (v: number) =>
  v < 5   ? { label: "HASTALIK DIŞI / REMİSYON", color: "emerald", sub: "Klinik ekstraglandüler aktivite yok" } :
  v < 14  ? { label: "DÜŞÜK AKTİVİTE",            color: "sky",     sub: "Düşük ekstraglandüler hastalık aktivitesi" } :
  v < 28  ? { label: "ORTA AKTİVİTE",             color: "amber",   sub: "Orta aktivite — tedavi yoğunlaştırılmalı" } :
             { label: "YÜKSEK AKTİVİTE",           color: "rose",    sub: "Yüksek aktivite — agresif tedavi planlanmalı" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     badge: "bg-sky-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function ESSDIAPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(DOMAINS.map(d => [d.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === DOMAINS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const band = total !== null ? getBand(total) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="essdai" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">💧</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">ESSDAI</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Sjögren Hastalık Aktivite İndeksi · 12 Domain</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/12 domain</span>
          <div className="flex flex-wrap gap-0.5">
            {DOMAINS.map(d => (
              <div key={d.id} className={`w-3 h-2 rounded-sm transition-all ${sel[d.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {DOMAINS.map(domain => (
            <div key={domain.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-black text-blue-900 uppercase italic text-sm">{domain.label}</p>
                <span className="text-[8px] font-black text-slate-400 uppercase">Ağırlık ×{domain.weight}</span>
              </div>
              <div className="space-y-1.5">
                {domain.options.map(opt => (
                  <button key={opt.level} type="button"
                    onClick={() => setSel(s => ({ ...s, [domain.id]: s[domain.id] === opt.pts ? null : opt.pts }))}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all
                      ${sel[domain.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                    <span className={`w-6 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0
                      ${sel[domain.id] === opt.pts ? opt.pts > 0 ? "bg-amber-400 text-blue-900" : "bg-slate-400 text-white" : "bg-white border border-slate-200 text-slate-400"}`}>
                      {opt.pts}
                    </span>
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
                <span className="text-[7px] font-black text-blue-300 uppercase">ESSDAI</span>
                <span className="text-3xl font-black text-white leading-none">{total}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[8px]">
              {[
                { l: "Remisyon", r: "< 5" },
                { l: "Düşük", r: "5–13" },
                { l: "Orta", r: "14–27" },
                { l: "Yüksek", r: "≥ 28" },
              ].map(b => (
                <div key={b.l} className={`rounded-lg p-1.5 font-black
                  ${(b.l === "Remisyon" && total < 5) || (b.l === "Düşük" && total >= 5 && total < 14) || (b.l === "Orta" && total >= 14 && total < 28) || (b.l === "Yüksek" && total >= 28) ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold">{b.r}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 12 domaini tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              ESSDAI yalnızca ekstraglandüler aktiviteyi ölçer; kserostomi ve kseroftalmi semptomarını ESSPRI değerlendirir. ESSDAI ≥ 5 klinik çalışmalara dahil etme kriteri olarak kabul edilir. Seror et al., Ann Rheum Dis 2010.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
