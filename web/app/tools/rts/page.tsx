"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// Revised Trauma Score (RTS) — GCS, SBP, RR coded values
const GCS_OPTS = [
  { label: "13–15", coded: 4 },
  { label: "9–12",  coded: 3 },
  { label: "6–8",   coded: 2 },
  { label: "4–5",   coded: 1 },
  { label: "3",     coded: 0 },
];
const SBP_OPTS = [
  { label: "> 89 mmHg",   coded: 4 },
  { label: "76–89 mmHg",  coded: 3 },
  { label: "50–75 mmHg",  coded: 2 },
  { label: "1–49 mmHg",   coded: 1 },
  { label: "0 mmHg (yok)",coded: 0 },
];
const RR_OPTS = [
  { label: "10–29 /dak",  coded: 4 },
  { label: "≥ 30 /dak",   coded: 3 },
  { label: "6–9 /dak",    coded: 2 },
  { label: "1–5 /dak",    coded: 1 },
  { label: "0 (yok)",     coded: 0 },
];

// RTS = 0.9368×GCS_coded + 0.7326×SBP_coded + 0.2908×RR_coded
function calcRTS(g: number, s: number, r: number) {
  return 0.9368 * g + 0.7326 * s + 0.2908 * r;
}

function survivalProbability(rts: number): string {
  // Ps ≈ e^(b0+b1*RTS)/(1+e^(b0+b1*RTS)), b0=-1.2470, b1=0.7705 (TRISS simplified)
  const logit = -1.2470 + 0.7705 * rts;
  const ps = 1 / (1 + Math.exp(-logit));
  return (ps * 100).toFixed(1);
}

const getBand = (rts: number) =>
  rts >= 7.84 ? { label: "HAFİF",         color: "emerald", sub: "Minimal fizyolojik anormallik" } :
  rts >= 5    ? { label: "ORTA",          color: "amber",   sub: "Travma merkezi / acil cerrahi değerlendirme" } :
  rts >= 2    ? { label: "AĞIR",          color: "orange",  sub: "Acil müdahale — yoğun bakım" } :
               { label: "KRİTİK",        color: "rose",    sub: "Hayat kurtarma önceliklendirmesi" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function RTSPage() {
  const [gcs, setGcs] = React.useState<number | null>(null);
  const [sbp, setSbp] = React.useState<number | null>(null);
  const [rr, setRr]   = React.useState<number | null>(null);

  const ready = gcs !== null && sbp !== null && rr !== null;
  const rts = ready ? calcRTS(gcs!, sbp!, rr!) : null;
  const band = rts !== null ? getBand(rts) : null;
  const c = band ? COLOR[band.color] : null;

  const Selector = ({ label, opts, value, onChange }: {
    label: string; opts: { label: string; coded: number }[];
    value: number | null; onChange: (v: number) => void;
  }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <p className="font-black text-blue-900 uppercase italic text-sm mb-3">{label}</p>
      <div className="space-y-1.5">
        {opts.map(opt => (
          <button key={opt.coded} type="button"
            onClick={() => onChange(value === opt.coded ? -1 : opt.coded)}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-[10px] font-bold transition-all
              ${value === opt.coded ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
              ${value === opt.coded ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.coded}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="rts" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🚑</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">RTS</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Revize Travma Skoru · GCS + SKB + Solunum Hızı · 0–7.84</p>
          </div>
        </div>

        <Selector label="GKS (Glasgow Koma Skalası)" opts={GCS_OPTS} value={gcs} onChange={v => setGcs(v === -1 ? null : v)} />
        <Selector label="Sistolik Kan Basıncı" opts={SBP_OPTS} value={sbp} onChange={v => setSbp(v === -1 ? null : v)} />
        <Selector label="Solunum Hızı (/dak)" opts={RR_OPTS} value={rr} onChange={v => setRr(v === -1 ? null : v)} />

        {rts !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">RTS</span>
                <span className="text-2xl font-black text-white leading-none">{rts.toFixed(2)}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
                <p className="text-[11px] font-black text-blue-900 mt-1">Tahmini Hayatta Kalma: <span className="text-amber-500">{survivalProbability(rts)}%</span></p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center text-[8px]">
              {[
                { l: "GCS",   v: gcs, max: 4 },
                { l: "SKB",   v: sbp, max: 4 },
                { l: "Solunum",v: rr, max: 4 },
              ].map(p => (
                <div key={p.l} className="bg-white/60 rounded-lg p-1.5">
                  <div className="font-black text-slate-600">{p.l}</div>
                  <div className="text-lg font-black text-blue-900">{p.v}</div>
                  <div className="text-[7px] text-slate-400">/ {p.max}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3 parametreyi tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={{ gcs: gcs ?? 0, sbp: sbp ?? 0, rr: rr ?? 0 }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              RTS = 0.9368×GCS + 0.7326×SKB + 0.2908×Solunum hızı (kodlanmış). RTS ≤ 11 (ham kodlar) travma merkezi sevkini önerir. Champion et al., J Trauma 1989.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
