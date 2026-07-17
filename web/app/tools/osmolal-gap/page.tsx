"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

const CAUSES = [
  { gap: "> 10", title: "Toksik alkoller", items: ["Metanol (kör edici, yüksek AG asidozu)", "Etilen glikol (böbrek yetmezliği, oksalat kristalleri)", "İzopropanol (asetonemi, asidoz yok)", "Propilen glikol (IV ilaçlarda taşıyıcı)"] },
  { gap: "> 10", title: "Diğer nedenler", items: ["Mannitol infüzyonu", "Sorbitol", "Ağır hipertrigliseridemi", "Ağır hiperproteinemi (paraproteinemi)"] },
];

export default function OsmolalGapPage() {
  const [measured, setMeasured] = React.useState("");
  const [na,       setNa]       = React.useState("");
  const [glucose,  setGlucose]  = React.useState("");
  const [bun,      setBun]      = React.useState("");
  const [etoh,     setEtoh]     = React.useState(""); // mg/dL — opsiyonel

  const measN   = parseLocaleNumber(measured);
  const naN     = parseLocaleNumber(na);
  const glucN   = parseLocaleNumber(glucose);
  const bunN    = parseLocaleNumber(bun);
  const etohN   = parseLocaleNumber(etoh);

  const hasCalc = naN > 0 && glucN >= 0 && bunN >= 0;

  // Calculated osmolality = 2×Na + Glucose/18 + BUN/2.8
  const calcOsm   = hasCalc ? 2 * naN + glucN / 18 + bunN / 2.8 : null;
  // Ethanol contribution = ethanol(mg/dL) / 4.6
  const etohContrib = etohN > 0 ? etohN / 4.6 : null;
  const calcOsmFull = calcOsm !== null && etohContrib !== null ? calcOsm + etohContrib : calcOsm;

  const gap = measN > 0 && calcOsmFull !== null ? measN - calcOsmFull : null;

  const getResult = (g: number) => {
    if (g <= 10)  return { label: "NORMAL OSMOLAL GAP", sub: "≤ 10 mOsm/kg — Toksik alkol olasılığı düşük", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (g <= 20)  return { label: "SINIRDA YÜKSEK", sub: "10–20 mOsm/kg — Klinik bağlamla değerlendirin", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "YÜKSEK OSMOLAL GAP", sub: "> 20 mOsm/kg — Toksik alkol veya diğer nedenler araştırılmalı", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = gap !== null ? getResult(gap) : null;

  // Estimated methanol / ethylene glycol level from gap
  const methanol     = gap !== null && gap > 0 ? gap * 3.2  : null;  // MW 32 × gap / 10
  const ethyleneGlyc = gap !== null && gap > 0 ? gap * 6.2  : null;  // MW 62
  const isopropanol  = gap !== null && gap > 0 ? gap * 6.0  : null;  // MW 60

  const Input = ({ label, value, set, ph, unit, note }: { label: string; value: string; set: (v: string) => void; ph: string; unit: string; note?: string }) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
      <div className="relative">
        <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all pr-20" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">{unit}</span>
      </div>
      {note && <span className="text-[9px] font-bold text-slate-400 pl-1">{note}</span>}
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="osmolal-gap" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🧪</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Serum Osmolal Gap</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Ölçülen − Hesaplanan Osmolalite · Toksik Alkol Taraması</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parametreler</p>
          <Input label="Ölçülen Osmolalite" value={measured} set={setMeasured} ph="ör. 320" unit="mOsm/kg" note="Laboratuvar (frezpunkt) değeri" />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Na⁺" value={na}      set={setNa}      ph="ör. 138" unit="mEq/L" />
            <Input label="Glukoz" value={glucose} set={setGlucose} ph="ör. 100" unit="mg/dL" />
            <Input label="BUN"    value={bun}     set={setBun}     ph="ör. 18"  unit="mg/dL" />
          </div>
          <Input label="Etanol (opsiyonel)" value={etoh} set={setEtoh} ph="ör. 80" unit="mg/dL"
            note="Etanol serum düzeyi — biliniyorsa hesaplanan osmolaliteye eklenir" />
        </div>

        {/* Formül */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1">
          <p className="text-[9px] font-black text-blue-900/50 uppercase tracking-widest mb-2">Hesaplanan Osmolalite Formülü</p>
          <p className="text-[10px] font-bold text-blue-900 font-mono">OsmHes = 2×Na + Glukoz/18 + BUN/2.8{etohN > 0 ? ' + Etanol/4.6' : ''}</p>
          <p className="text-[10px] font-bold text-blue-900 font-mono">Osmolal Gap = OsmÖlçülen − OsmHesaplanan</p>
          {calcOsm !== null && (
            <div className="mt-2 pt-2 border-t border-blue-200/50 grid grid-cols-2 gap-2">
              <p className="text-[10px] font-black text-blue-900">
                Hesaplanan: {calcOsm.toFixed(1)} mOsm/kg
                {etohContrib !== null && ` + Etanol ${etohContrib.toFixed(1)} = ${calcOsmFull?.toFixed(1)}`}
              </p>
              {measN > 0 && <p className="text-[10px] font-black text-blue-900">Ölçülen: {measN} mOsm/kg</p>}
            </div>
          )}
        </div>

        {/* Gap sonucu */}
        {gap !== null && result && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">OSMOLAL GAP</div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className={`text-5xl font-black ${result.color}`}>{gap.toFixed(1)}</span>
              <span className={`text-sm font-black ${result.color} opacity-60`}>mOsm/kg</span>
            </div>
            <p className={`text-xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <p className={`text-sm font-bold mt-1 ${result.color} opacity-80`}>{result.sub}</p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { l: "Normal", r: "≤ 10", c: "bg-emerald-100 text-emerald-700" },
                { l: "Sınırda", r: "10–20", c: "bg-amber-100 text-amber-700" },
                { l: "Yüksek", r: "> 20", c: "bg-rose-100 text-rose-700" },
              ].map(x => (
                <div key={x.l} className={`rounded-xl p-2 text-center text-[9px] font-black uppercase tracking-widest ${x.c}`}>
                  <div>{x.l}</div>
                  <div className="font-bold normal-case tracking-normal mt-0.5">{x.r}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tahmini toksik alkol düzeyleri */}
        {gap !== null && gap > 10 && (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gap'ten Tahmini Toksik Alkol Konsantrasyonları</p>
            <p className="text-[9px] font-bold text-slate-400 mb-3">Her madde için: Tahmini düzey = Osmolal Gap × (Molekül Ağırlığı / 10)</p>
            <div className="space-y-2">
              {[
                { name: "Metanol", mw: "MW 32", est: methanol, note: "Görme kaybı, yüksek AG asidozu, toksik: > 20 mg/dL" },
                { name: "Etilen Glikol", mw: "MW 62", est: ethyleneGlyc, note: "Renal hasar, oksalat kristalüri, toksik: > 20 mg/dL" },
                { name: "İzopropanol", mw: "MW 60", est: isopropanol, note: "Asetonemi ama asidoz yok, toksik: > 50 mg/dL" },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-black text-rose-900">{item.name}</span>
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">{item.mw}</span>
                    </div>
                    <p className="text-[9px] font-bold text-rose-700/70">{item.note}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-rose-700">≈ {item.est?.toFixed(0)}</div>
                    <div className="text-[9px] font-black text-rose-400">mg/dL</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-3 italic">⚠ Bu tahminler yaklaşık değerlerdir; kesin tanı için toksik madde düzeyi ölçülmelidir.</p>
          </div>
        )}

        {/* Nedenler */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yüksek Osmolal Gap Nedenleri</p>
          {CAUSES.map(c => (
            <div key={c.title}>
              <p className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest mb-2">{c.title}</p>
              <div className="space-y-1">
                {c.items.map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-blue-900/30 font-black text-xs mt-0.5">•</span>
                    <span className="text-[11px] font-bold text-blue-900">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{ measured: measN, na: naN, glucose: glucN, bun: bunN, etoh: etohN }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Normal osmolal gap, toksik alkol zehirlenmesini dışlamaz — geç evrelerde gap kapanmış olabilir (metabolize olmuş). Klinik şüphe varsa spesifik madde düzeyleri ölçülmeli, fomepizol/etanol tedavisi ve diyaliz kararı geciktirilmemelidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
