"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

export default function KtvPage() {
  const [preBun,  setPreBun]  = React.useState("");
  const [postBun, setPostBun] = React.useState("");
  const [time,    setTime]    = React.useState("");   // dakika
  const [uf,      setUf]      = React.useState("");   // litre
  const [postWt,  setPostWt]  = React.useState("");   // kg

  const pre  = parseLocaleNumber(preBun);
  const post = parseLocaleNumber(postBun);
  const t    = parseLocaleNumber(time);    // dakika
  const ufL  = parseLocaleNumber(uf);
  const wt   = parseLocaleNumber(postWt);

  const hasAll = pre > 0 && post > 0 && t > 0 && ufL >= 0 && wt > 0;
  const tHours = t / 60;

  // Daugirdas II (Single Pool)
  const R    = hasAll ? post / pre : null;
  const spKtV = hasAll && R !== null
    ? -Math.log(R - 0.008 * tHours) + (4 - 3.5 * R) * (ufL / wt)
    : null;

  // Equilibrated Kt/V (Daugirdas & Schneditz)
  const eKtV = spKtV !== null
    ? spKtV - (0.6 * spKtV / tHours) + 0.03
    : null;

  // URR
  const urr = R !== null ? (1 - R) * 100 : null;

  const spOk  = spKtV !== null && spKtV >= 1.2;
  const eOk   = eKtV  !== null && eKtV  >= 1.0;
  const urrOk = urr   !== null && urr   >= 65;

  const Input = ({ label, value, set, ph, unit }: { label: string; value: string; set: (v: string) => void; ph: string; unit: string }) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
      <div className="relative">
        <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all pr-12" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">{unit}</span>
      </div>
    </label>
  );

  const ResultCard = ({ label, value, target, unit, ok }: { label: string; value: number | null; target: string; unit: string; ok: boolean | null }) => (
    <div className={`rounded-2xl p-4 text-center border ${
      value === null ? 'bg-slate-50 border-slate-200' :
      ok ? 'bg-emerald-900 border-emerald-900' : 'bg-rose-900 border-rose-900'}`}>
      <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${value === null ? 'text-slate-400' : 'text-white/60'}`}>{label}</div>
      <div className={`text-3xl font-black ${value === null ? 'text-slate-300' : 'text-white'}`}>
        {value !== null ? value.toFixed(2) : '—'}
      </div>
      <div className={`text-[9px] font-bold mt-1 ${value === null ? 'text-slate-400' : ok ? 'text-emerald-300' : 'text-rose-300'}`}>
        {value !== null ? (ok ? `✓ Hedef ${target} ${unit}` : `✗ Hedef ${target} ${unit}`) : `Hedef: ${target} ${unit}`}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="ktv" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🩺</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Kt/V — Daugirdas II</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Hemodiyaliz Yeterliliği · spKt/V · eKt/V · URR</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seans Parametreleri</p>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pre-diyaliz BUN" value={preBun}  set={setPreBun}  ph="ör. 85"  unit="mg/dL" />
            <Input label="Post-diyaliz BUN" value={postBun} set={setPostBun} ph="ör. 22"  unit="mg/dL" />
            <Input label="Seans Süresi" value={time}    set={setTime}    ph="ör. 240" unit="dakika" />
            <Input label="Ultrafiltrasyon" value={uf}      set={setUf}      ph="ör. 2.5" unit="Litre" />
          </div>
          <Input label="Post-diyaliz Ağırlık" value={postWt} set={setPostWt} ph="ör. 70" unit="kg" />
        </div>

        {/* Formül gösterimi */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1">
          <p className="text-[9px] font-black text-blue-900/50 uppercase tracking-widest mb-2">Daugirdas II Formülleri</p>
          <p className="text-[10px] font-bold text-blue-900 font-mono">spKt/V = −ln(R − 0.008×t) + (4 − 3.5×R) × UF/W</p>
          <p className="text-[10px] font-bold text-blue-900 font-mono">eKt/V = spKt/V − (0.6×spKt/V / t) + 0.03</p>
          <p className="text-[9px] font-bold text-blue-900/50 mt-1">R = BUN(post)/BUN(pre) · t = seans süresi (saat) · UF (L) · W = post ağırlık (kg)</p>
          {R !== null && (
            <p className="text-[10px] font-black text-blue-900 mt-2">R = {R.toFixed(3)} · t = {tHours.toFixed(2)} saat</p>
          )}
        </div>

        {/* Sonuçlar */}
        <div className="grid grid-cols-3 gap-3">
          <ResultCard label="spKt/V" value={spKtV} target="≥ 1.2" unit="" ok={spKtV !== null ? spKtV >= 1.2 : null} />
          <ResultCard label="eKt/V"  value={eKtV}  target="≥ 1.0" unit="" ok={eKtV  !== null ? eKtV  >= 1.0 : null} />
          <div className={`rounded-2xl p-4 text-center border ${
            urr === null ? 'bg-slate-50 border-slate-200' :
            urrOk ? 'bg-emerald-900 border-emerald-900' : 'bg-rose-900 border-rose-900'}`}>
            <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${urr === null ? 'text-slate-400' : 'text-white/60'}`}>URR</div>
            <div className={`text-3xl font-black ${urr === null ? 'text-slate-300' : 'text-white'}`}>
              {urr !== null ? `${urr.toFixed(0)}%` : '—'}
            </div>
            <div className={`text-[9px] font-bold mt-1 ${urr === null ? 'text-slate-400' : urrOk ? 'text-emerald-300' : 'text-rose-300'}`}>
              {urr !== null ? (urrOk ? "✓ Hedef ≥ 65%" : "✗ Hedef ≥ 65%") : "Hedef: ≥ 65%"}
            </div>
          </div>
        </div>

        {hasAll && spKtV !== null && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${spOk && eOk && urrOk ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">SONUÇ</div>
            <p className={`text-xl font-black italic tracking-tight ${spOk && eOk && urrOk ? 'text-emerald-700' : 'text-rose-700'}`}>
              {spOk && eOk && urrOk ? "HEMODİYALİZ YETERLİLİĞİ SAĞLANDI" : "YETERSİZ DİYALİZ — PROTOKOL GÖZDEN GEÇİRİLMELİ"}
            </p>
            {!(spOk && eOk && urrOk) && (
              <div className="mt-3 space-y-1 text-[11px] font-bold text-rose-700/80">
                {!spOk  && <p>• spKt/V {spKtV.toFixed(2)} &lt; 1.2 — seans süresini veya kan akımını artırın</p>}
                {!urrOk && urr !== null && <p>• URR %{urr.toFixed(0)} &lt; 65 — BUN azalması yetersiz</p>}
              </div>
            )}
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{ pre, post, t, uf: ufL, wt }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              KDOQI kılavuzu: 3×/hafta HHD için spKt/V ≥ 1.2 (eKt/V ≥ 1.0) hedeflenir. Post-BUN örneği kan pompası durdurulduktan 15–30 sn sonra alınmalıdır. Geri sirkülasyon eKt/V'yi etkiler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
