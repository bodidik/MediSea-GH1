"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

const MODE_OPTS = [
  { id: "deficiency", label: "GH Eksikliği — Stimülasyon Testi", icon: "📉" },
  { id: "excess", label: "Akromegali — Süpresyon Testi (OGTT)", icon: "📈" },
] as const;
type Mode = typeof MODE_OPTS[number]["id"];

const STIM_PROTOCOLS = [
  { id: "itt", label: "İnsülin Tolerans Testi (ITT)", cutoff: 3, note: "Altın standart. Hipoglisemi sırasında pik GH ölçülür. KKY ve epilepside kontrendike." },
  { id: "glucagon", label: "Glukagon Stimülasyon", cutoff: 3, note: "ITT kontrendike olduğunda. 150 dk'ya kadar ölçüm. Obez bireylerde yanıt zayıf." },
  { id: "arginine", label: "Arginin ± GHRH", cutoff: 3, note: "GHRH+Arginin daha güçlü stimülandır; pik eşiği BMI'ye göre değişir (cutoff ~4–11 μg/L)." },
  { id: "clonidine", label: "Klonidin Stimülasyon", cutoff: 10, note: "Çocuklarda yaygın. Erişkinde daha az tercih edilir." },
] as const;

const AGE_OPTS = [["≤ 25 yaş", 11.5], ["26–50 yaş", 8], ["> 50 yaş", 4]] as const;

export default function GhTestPage() {
  const [mode, setMode]         = React.useState<Mode>("deficiency");
  const [stimIdx, setStimIdx]   = React.useState(0);
  const [peak, setPeak]         = React.useState("");
  const [nadir, setNadir]       = React.useState("");
  const [assay, setAssay]       = React.useState<"sensitive" | "standard">("sensitive");
  const [ageIdx, setAgeIdx]     = React.useState(1);

  const peakN  = parseLocaleNumber(peak);
  const nadirN = parseLocaleNumber(nadir);
  const proto  = STIM_PROTOCOLS[stimIdx];
  const ageCutoff = AGE_OPTS[ageIdx][1];
  const supCutoff = assay === "sensitive" ? 0.4 : 1.0;

  const getDefResult = () => {
    if (!peakN) return null;
    const cutoff = stimIdx === 3 ? 10 : proto.cutoff;
    if (peakN >= cutoff) return { label: "YETERLİ GH YANITI", sub: `Pik GH ≥ ${cutoff} μg/L — GH eksikliği dışlanır`, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    return { label: "YETERSİZ GH YANITI", sub: `Pik GH < ${cutoff} μg/L — GH eksikliği ile uyumlu`, color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const getExcessResult = () => {
    if (!nadirN) return null;
    if (nadirN < supCutoff) return { label: "GH SÜPRESİYONU YETERLİ", sub: `Nadir GH < ${supCutoff} μg/L — Akromegali dışlanır`, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    return { label: "GH SÜPRESİYONU YETERSİZ", sub: `Nadir GH ≥ ${supCutoff} μg/L — Akromegali ile uyumlu`, color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const result = mode === "deficiency" ? getDefResult() : getExcessResult();
  const params = { mode, stim: stimIdx, peak: peakN, nadir: nadirN, assay, age: ageIdx };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="gh-test" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Büyüme Hormonu Testleri</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">GH Eksikliği (Stimülasyon) & Akromegali (Süpresyon)</p>
          </div>
        </div>

        {/* Mod seçimi */}
        <div className="grid grid-cols-2 gap-3">
          {MODE_OPTS.map(m => (
            <button key={m.id} type="button" onClick={() => setMode(m.id)}
              className={`p-4 rounded-2xl border transition-all text-center
                ${mode === m.id ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-white border-slate-200 hover:border-blue-900/30'}`}>
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className={`text-xs font-bold ${mode === m.id ? 'text-white' : 'text-blue-950'}`}>{m.label}</div>
            </button>
          ))}
        </div>

        {mode === "deficiency" && (
          <>
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stimülasyon Protokolü</p>
              {STIM_PROTOCOLS.map((p, i) => (
                <button key={p.id} type="button" onClick={() => setStimIdx(i)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all
                    ${stimIdx === i ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
                  <div className={`text-sm font-bold ${stimIdx === i ? 'text-white' : 'text-blue-950'}`}>{p.label}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${stimIdx === i ? 'text-blue-200/70' : 'text-slate-400'}`}>
                    Eşik: {stimIdx === i && i === 3 ? "10" : p.cutoff} μg/L
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
              <label className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Pik GH Değeri (μg/L)</span>
                <input type="text" inputMode="decimal" value={peak} onChange={e => setPeak(e.target.value)} placeholder="ör. 2.1"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-[9px] font-black text-blue-900/50 uppercase tracking-widest mb-1">Not</p>
              <p className="text-[11px] font-bold text-blue-900">{proto.note}</p>
            </div>
          </>
        )}

        {mode === "excess" && (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex gap-3">
              {(["sensitive", "standard"] as const).map(a => (
                <label key={a} className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all text-center
                  ${assay === a ? 'bg-blue-900 border-blue-900' : 'bg-slate-50 border-slate-200 hover:border-blue-900/30'}`}>
                  <input type="radio" className="hidden" checked={assay === a} onChange={() => setAssay(a)} />
                  <div className={`text-sm font-bold ${assay === a ? 'text-white' : 'text-blue-900/80'}`}>{a === "sensitive" ? "Hassas Assay" : "Standart Assay"}</div>
                  <div className={`text-[9px] font-bold uppercase tracking-widest ${assay === a ? 'text-blue-200/70' : 'text-slate-400'}`}>{a === "sensitive" ? "Eşik: 0.4 μg/L" : "Eşik: 1.0 μg/L"}</div>
                </label>
              ))}
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">GH Nadir Değeri (μg/L)</span>
              <input type="text" inputMode="decimal" value={nadir} onChange={e => setNadir(e.target.value)} placeholder="ör. 0.8"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
              <span className="text-[9px] font-bold text-slate-400 pl-1">75g glukoz sonrası 60–120. dakika en düşük GH değeri</span>
            </label>
          </div>
        )}

        {result && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">YORUM</div>
            <p className={`text-xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <p className={`text-sm font-bold mt-1 ${result.color} opacity-80`}>{result.sub}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              GH eksikliği tanısı için en az 2 patolojik stimülasyon testi veya organik hipopitüitarizm + düşük IGF-1 gereklidir. IGF-1 her iki durumda da birlikte değerlendirilmelidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
