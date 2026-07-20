"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// Puanlar ondalıklı
const CYTOGENETICS = [
  { label: "Çok İyi — del(11q), -Y", pts: -1 },
  { label: "İyi — normal, del(5q), del(12p), del(20q), çift del(5q) dahil", pts: 0 },
  { label: "Orta — del(7q), +8, +19, i(17q), tek/çift diğer klonal", pts: 1 },
  { label: "Kötü — -7, inv(3)/t(3q)/del(3q), çift -7/del(7q), kompleks 3 anormallik", pts: 2 },
  { label: "Çok Kötü — kompleks ≥ 3 anormallik (yukarıdakiler hariç)", pts: 3 },
];
const BLASTS = [
  { label: "< 2%", pts: 0 },
  { label: "2% – < 5%", pts: 1 },
  { label: "5% – 10%", pts: 2 },
  { label: "> 10%", pts: 3 },
];
const HGB = [
  { label: "≥ 10 g/dL", pts: 0 },
  { label: "8 – < 10 g/dL", pts: 1 },
  { label: "< 8 g/dL", pts: 1.5 },
];
const PLT = [
  { label: "≥ 100 × 10⁹/L", pts: 0 },
  { label: "50 – < 100 × 10⁹/L", pts: 0.5 },
  { label: "< 50 × 10⁹/L", pts: 1 },
];
const ANC = [
  { label: "≥ 0.8 × 10⁹/L", pts: 0 },
  { label: "< 0.8 × 10⁹/L", pts: 0.5 },
];

const BANDS = [
  { max: 1.5,  label: "ÇOK DÜŞÜK",  os: "8.8 yıl",  aml: "NR",        color: "emerald" },
  { max: 3,    label: "DÜŞÜK",       os: "5.3 yıl",  aml: "10.8 yıl",  color: "sky" },
  { max: 4.5,  label: "ORTA",        os: "3.0 yıl",  aml: "3.2 yıl",   color: "amber" },
  { max: 6,    label: "YÜKSEK",      os: "1.6 yıl",  aml: "1.4 yıl",   color: "orange" },
  { max: 99,   label: "ÇOK YÜKSEK", os: "0.8 yıl",  aml: "0.7 yıl",   color: "rose" },
];

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     badge: "bg-sky-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

function Selector({ label, detail, options, value, onChange }: {
  label: string; detail: string; options: { label: string; pts: number }[];
  value: number | null; onChange: (v: number) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{label}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{detail}</p>
      <div className="space-y-1.5">
        {options.map((opt, oi) => (
          <button key={oi} type="button" onClick={() => onChange(opt.pts)}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all
              ${value === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
            <span className={`w-8 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0
              ${value === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function IPSSRPage() {
  const [cyto,   setCyto]   = React.useState<number | null>(null);
  const [blasts, setBlasts] = React.useState<number | null>(null);
  const [hgb,    setHgb]    = React.useState<number | null>(null);
  const [plt,    setPlt]    = React.useState<number | null>(null);
  const [anc,    setAnc]    = React.useState<number | null>(null);

  const answered = [cyto, blasts, hgb, plt, anc].filter(v => v !== null).length;
  const total = answered === 5
    ? (cyto! + blasts! + hgb! + plt! + anc!)
    : null;

  const band = total !== null ? BANDS.find(b => total <= b.max)! : null;
  const c = band ? COLOR[band.color] : null;

  const shareParams = { cyto: cyto ?? 0, blasts: blasts ?? 0, hgb: hgb ?? 0, plt: plt ?? 0, anc: anc ?? 0 };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="ipss-r" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🧬</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">IPSS-R</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">MDS Revize Uluslararası Prognostik Skorlama Sistemi</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/5 parametre</span>
          <div className="flex gap-1.5">
            {["Sitogenetik","Blast","Hgb","Plt","ANC"].map((l, i) => (
              <div key={l} className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded transition-all ${
                [cyto, blasts, hgb, plt, anc][i] !== null ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-400"
              }`}>{l}</div>
            ))}
          </div>
        </div>

        <Selector label="Sitogenetik" detail="FISH/konvansiyonel sitogenetik sonucu"
          options={CYTOGENETICS} value={cyto} onChange={setCyto} />
        <Selector label="Kemik İliği Blast %" detail="Aspirat/biyopsi blast yüzdesi"
          options={BLASTS} value={blasts} onChange={setBlasts} />
        <Selector label="Hemoglobin" detail="Serum Hb düzeyi (g/dL)"
          options={HGB} value={hgb} onChange={setHgb} />
        <Selector label="Trombosit" detail="Periferik trombosit sayısı (× 10⁹/L)"
          options={PLT} value={plt} onChange={setPlt} />
        <Selector label="ANC (Mutlak Nötrofil)" detail="Absolut nötrofil sayısı (× 10⁹/L)"
          options={ANC} value={anc} onChange={setAnc} />

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[8px] font-black text-blue-300 uppercase">SKOR</span>
                <span className="text-3xl font-black text-white leading-none">{total.toFixed(1)}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <div className="flex gap-4 mt-1">
                  <div>
                    <p className="text-[8px] text-slate-500 font-bold uppercase">Median OS</p>
                    <p className={`text-base font-black italic ${c.text}`}>{band.os}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-500 font-bold uppercase">AML Riski (%25)</p>
                    <p className={`text-base font-black italic ${c.text}`}>{band.aml}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1 text-center text-[7px]">
              {BANDS.map(b => (
                <div key={b.label} className={`rounded-lg p-1 font-black uppercase
                  ${b.label === band.label ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.label.split(" ").map(w => w[0]).join("")}</div>
                  <div className="font-bold text-[6px]">≤{b.max}</div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-center text-slate-500 font-bold">Çok Düşük · Düşük · Orta · Yüksek · Çok Yüksek</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 5 parametreyi tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={shareParams} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              IPSS-R tanı anında kullanılır; tedavi sırasında değişen parametreler yeniden skorlanmalıdır. Düşük/Orta hastalar için destek tedavisi, Yüksek/Çok Yüksek için allojenik KİT değerlendirilir. Greenberg et al., Blood 2012.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
