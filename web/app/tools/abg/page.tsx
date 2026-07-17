"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/* ── helpers ─────────────────────────────────────────────────────────── */
type Disorder =
  | "metabolic_acidosis"
  | "metabolic_alkalosis"
  | "respiratory_acidosis_acute"
  | "respiratory_acidosis_chronic"
  | "respiratory_alkalosis_acute"
  | "respiratory_alkalosis_chronic"
  | "normal"
  | null;

interface CompResult {
  expected: string;
  low: number;
  high: number;
  label: string;
  adequate: boolean | null;
}

function identifyDisorder(ph: number, pco2: number, hco3: number): { primary: Disorder; phStatus: string } {
  const acidemia  = ph < 7.35;
  const alkalemia = ph > 7.45;

  if (!acidemia && !alkalemia) return { primary: "normal", phStatus: "normal" };

  const metAcid = hco3 < 22;
  const metAlk  = hco3 > 26;
  const respAcid = pco2 > 45;
  const respAlk  = pco2 < 35;

  if (acidemia) {
    if (metAcid && !respAcid) return { primary: "metabolic_acidosis", phStatus: "acidemia" };
    if (respAcid && !metAcid) return { primary: "respiratory_acidosis_acute", phStatus: "acidemia" };
    if (metAcid && respAcid)  return { primary: "metabolic_acidosis", phStatus: "acidemia" }; // double
    return { primary: "metabolic_acidosis", phStatus: "acidemia" };
  }
  // alkalemia
  if (metAlk && !respAlk)  return { primary: "metabolic_alkalosis", phStatus: "alkalemia" };
  if (respAlk && !metAlk)  return { primary: "respiratory_alkalosis_acute", phStatus: "alkalemia" };
  if (metAlk && respAlk)   return { primary: "metabolic_alkalosis", phStatus: "alkalemia" };
  return { primary: "metabolic_alkalosis", phStatus: "alkalemia" };
}

function getCompensation(disorder: Disorder, ph: number, pco2: number, hco3: number): CompResult | null {
  if (!disorder || disorder === "normal") return null;

  const round1 = (n: number) => Math.round(n * 10) / 10;

  if (disorder === "metabolic_acidosis") {
    const exp = 1.5 * hco3 + 8;
    const lo  = round1(exp - 2);
    const hi  = round1(exp + 2);
    return {
      expected: `PaCO₂ = 1.5 × HCO₃⁻ + 8 ± 2`,
      low: lo, high: hi, label: `Beklenen PaCO₂: ${lo}–${hi} mmHg`,
      adequate: pco2 >= lo && pco2 <= hi,
    };
  }
  if (disorder === "metabolic_alkalosis") {
    const exp = 0.7 * hco3 + 21;
    const lo  = round1(exp - 5);
    const hi  = round1(exp + 5);
    return {
      expected: `PaCO₂ = 0.7 × HCO₃⁻ + 21 ± 5`,
      low: lo, high: hi, label: `Beklenen PaCO₂: ${lo}–${hi} mmHg`,
      adequate: pco2 >= lo && pco2 <= hi,
    };
  }
  if (disorder === "respiratory_acidosis_acute") {
    const delta = (pco2 - 40) / 10;
    const exp   = 24 + delta * 1;
    const lo    = round1(exp - 2);
    const hi    = round1(exp + 2);
    return {
      expected: `HCO₃⁻ = 24 + (ΔPaCO₂/10) × 1`,
      low: lo, high: hi, label: `Beklenen HCO₃⁻: ${lo}–${hi} mEq/L`,
      adequate: hco3 >= lo && hco3 <= hi,
    };
  }
  if (disorder === "respiratory_acidosis_chronic") {
    const delta = (pco2 - 40) / 10;
    const exp   = 24 + delta * 3.5;
    const lo    = round1(exp - 3);
    const hi    = round1(exp + 3);
    return {
      expected: `HCO₃⁻ = 24 + (ΔPaCO₂/10) × 3.5`,
      low: lo, high: hi, label: `Beklenen HCO₃⁻: ${lo}–${hi} mEq/L`,
      adequate: hco3 >= lo && hco3 <= hi,
    };
  }
  if (disorder === "respiratory_alkalosis_acute") {
    const delta = (40 - pco2) / 10;
    const exp   = 24 - delta * 2;
    const lo    = round1(exp - 2);
    const hi    = round1(exp + 2);
    return {
      expected: `HCO₃⁻ = 24 − (ΔPaCO₂/10) × 2`,
      low: lo, high: hi, label: `Beklenen HCO₃⁻: ${lo}–${hi} mEq/L`,
      adequate: hco3 >= lo && hco3 <= hi,
    };
  }
  if (disorder === "respiratory_alkalosis_chronic") {
    const delta = (40 - pco2) / 10;
    const exp   = 24 - delta * 5;
    const lo    = round1(exp - 2);
    const hi    = round1(exp + 2);
    return {
      expected: `HCO₃⁻ = 24 − (ΔPaCO₂/10) × 5`,
      low: lo, high: hi, label: `Beklenen HCO₃⁻: ${lo}–${hi} mEq/L`,
      adequate: hco3 >= lo && hco3 <= hi,
    };
  }
  return null;
}

const DISORDER_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  metabolic_acidosis:           { label: "METABOLİK ASİDOZ",             color: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200" },
  metabolic_alkalosis:          { label: "METABOLİK ALKALOZ",            color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200" },
  respiratory_acidosis_acute:   { label: "SOLUNUM ASİDOZU (AKUT)",       color: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200" },
  respiratory_acidosis_chronic: { label: "SOLUNUM ASİDOZU (KRONİK)",     color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200" },
  respiratory_alkalosis_acute:  { label: "SOLUNUM ALKALOZU (AKUT)",      color: "text-sky-700",     bg: "bg-sky-50",     border: "border-sky-200" },
  respiratory_alkalosis_chronic:{ label: "SOLUNUM ALKALOZU (KRONİK)",    color: "text-indigo-700",  bg: "bg-indigo-50",  border: "border-indigo-200" },
  normal:                       { label: "NORMAL",                        color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
};

/* ── component ───────────────────────────────────────────────────────── */
export default function AbgPage() {
  // Core ABG
  const [ph,   setPh]   = React.useState("");
  const [pco2, setPco2] = React.useState("");
  const [hco3, setHco3] = React.useState("");
  const [pao2, setPao2] = React.useState("");
  const [fio2, setFio2] = React.useState("0.21");

  // Extra electrolytes
  const [na,   setNa]   = React.useState("");
  const [cl,   setCl]   = React.useState("");
  const [alb,  setAlb]  = React.useState("");
  const [age,  setAge]  = React.useState("");

  // Resp acidosis: acute vs chronic toggle
  const [respAcidType, setRespAcidType] = React.useState<"acute"|"chronic">("acute");
  const [respAlkType,  setRespAlkType]  = React.useState<"acute"|"chronic">("acute");

  const phN   = parseLocaleNumber(ph);
  const pco2N = parseLocaleNumber(pco2);
  const hco3N = parseLocaleNumber(hco3);
  const pao2N = parseLocaleNumber(pao2);
  const fio2N = parseLocaleNumber(fio2);
  const naN   = parseLocaleNumber(na);
  const clN   = parseLocaleNumber(cl);
  const albN  = parseLocaleNumber(alb);
  const ageN  = parseLocaleNumber(age);

  const hasCore = phN > 0 && pco2N > 0 && hco3N > 0;

  // Identify disorder
  let { primary, phStatus } = hasCore ? identifyDisorder(phN, pco2N, hco3N) : { primary: null, phStatus: "" };
  if (primary === "respiratory_acidosis_acute" && respAcidType === "chronic") primary = "respiratory_acidosis_chronic";
  if (primary === "respiratory_alkalosis_acute" && respAlkType === "chronic") primary = "respiratory_alkalosis_chronic";

  const comp = hasCore && primary ? getCompensation(primary, phN, pco2N, hco3N) : null;
  const dl   = primary ? DISORDER_LABELS[primary] : null;

  // Mixed disorder check
  const mixed = comp && comp.adequate === false
    ? primary?.includes("metabolic")
      ? pco2N > (comp.high || 0) ? "Eşzamanlı solunum asidozu şüphesi" : "Eşzamanlı solunum alkalozu şüphesi"
      : hco3N > (comp.high || 0) ? "Eşzamanlı metabolik alkaloz şüphesi" : "Eşzamanlı metabolik asidoz şüphesi"
    : null;

  // Anion Gap
  const ag          = naN > 0 && clN > 0 && hco3N > 0 ? naN - clN - hco3N : null;
  const agCorrected = ag !== null && albN > 0 ? ag + 2.5 * (4 - albN) : null;
  const agEff       = agCorrected ?? ag;
  const agHigh      = agEff !== null && agEff > 12;

  // Delta-delta (only if AG metabolic acidosis)
  const deltaAg  = agEff !== null ? agEff - 12 : null;
  const deltaHco3 = hco3N > 0 ? 24 - hco3N : null;
  const dd       = deltaAg && deltaHco3 && deltaHco3 !== 0 ? deltaAg / deltaHco3 : null;

  // A-a gradient
  const pao2Calc = fio2N > 0 && pco2N > 0 ? fio2N * 713 - pco2N / 0.8 : null;
  const aaGrad   = pao2Calc !== null && pao2N > 0 ? pao2Calc - pao2N : null;
  const aaNormal = ageN > 0 ? ageN / 4 + 4 : 10;
  const pf       = pao2N > 0 && fio2N > 0 ? Math.round(pao2N / fio2N) : null;

  // HCO3 calculated from pH + pCO2 (Henderson-Hasselbalch check)
  const hco3Calc = phN > 0 && pco2N > 0 ? 0.03 * pco2N * Math.pow(10, phN - 6.1) : null;

  const Input = ({ label, value, set, ph: placeholder, unit }: { label: string; value: string; set: (v: string) => void; ph: string; unit: string }) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
      <div className="relative">
        <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-900 outline-none font-bold text-base transition-all pr-10" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">{unit}</span>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="abg" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🩸</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Asit-Baz Analizi</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">ABG · Kompansasyon · AG · Delta-Delta · A-a Gradyant</p>
          </div>
        </div>

        {/* ── ABG Girişi ─────────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arteriyel Kan Gazı</p>
          <div className="grid grid-cols-3 gap-4">
            <Input label="pH" value={ph} set={setPh} ph="7.35–7.45" unit="" />
            <Input label="PaCO₂" value={pco2} set={setPco2} ph="35–45" unit="mmHg" />
            <Input label="HCO₃⁻" value={hco3} set={setHco3} ph="22–26" unit="mEq/L" />
          </div>
          {hco3Calc !== null && hco3N > 0 && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold
              ${Math.abs(hco3Calc - hco3N) < 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
              <span>HH kontrolü: Hesaplanan HCO₃⁻ = {hco3Calc.toFixed(1)} mEq/L</span>
              {Math.abs(hco3Calc - hco3N) >= 2 && <span className="font-black">— Uyumsuzluk!</span>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <Input label="PaO₂ (opsiyonel)" value={pao2} set={setPao2} ph="ör. 85" unit="mmHg" />
            <Input label="FiO₂" value={fio2} set={setFio2} ph="0.21" unit="(0–1)" />
          </div>
        </div>

        {/* Resp. tipi seçimi */}
        {hasCore && primary?.startsWith("respiratory_acidosis") && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Solunum Asidozu — Kompansasyon Tipi</p>
            <div className="flex gap-3">
              {(["acute", "chronic"] as const).map(t => (
                <button key={t} type="button" onClick={() => setRespAcidType(t)}
                  className={`flex-1 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                    ${respAcidType === t ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 text-blue-900'}`}>
                  {t === "acute" ? "Akut (×1 mEq/10mmHg)" : "Kronik (×3.5 mEq/10mmHg)"}
                </button>
              ))}
            </div>
          </div>
        )}
        {hasCore && primary?.startsWith("respiratory_alkalosis") && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Solunum Alkalozu — Kompansasyon Tipi</p>
            <div className="flex gap-3">
              {(["acute", "chronic"] as const).map(t => (
                <button key={t} type="button" onClick={() => setRespAlkType(t)}
                  className={`flex-1 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                    ${respAlkType === t ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 text-blue-900'}`}>
                  {t === "acute" ? "Akut (×2 mEq/10mmHg)" : "Kronik (×5 mEq/10mmHg)"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Primer Bozukluk ────────────────────────── */}
        {dl && hasCore && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${dl.border} ${dl.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">PRİMER BOZUKLUK</div>
            <p className={`text-2xl font-black italic tracking-tight ${dl.color}`}>{dl.label}</p>

            {/* pH / PCO2 / HCO3 status chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { label: "pH", val: phN.toFixed(2), status: phN < 7.35 ? "↓ ASİDEMİ" : phN > 7.45 ? "↑ ALKALEMİ" : "NORMAL", ok: phN >= 7.35 && phN <= 7.45 },
                { label: "PaCO₂", val: `${pco2N} mmHg`, status: pco2N > 45 ? "↑ YÜKSEK" : pco2N < 35 ? "↓ DÜŞÜK" : "NORMAL", ok: pco2N >= 35 && pco2N <= 45 },
                { label: "HCO₃⁻", val: `${hco3N} mEq/L`, status: hco3N < 22 ? "↓ DÜŞÜK" : hco3N > 26 ? "↑ YÜKSEK" : "NORMAL", ok: hco3N >= 22 && hco3N <= 26 },
              ].map(c => (
                <div key={c.label} className={`rounded-2xl px-4 py-2 border ${c.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-white/80 border-white'}`}>
                  <div className={`text-[8px] font-black uppercase tracking-widest ${c.ok ? 'text-emerald-600' : dl.color}`}>{c.label}</div>
                  <div className={`text-base font-black ${c.ok ? 'text-emerald-700' : dl.color}`}>{c.val}</div>
                  <div className={`text-[8px] font-black ${c.ok ? 'text-emerald-600' : dl.color} opacity-70`}>{c.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Kompansasyon ───────────────────────────── */}
        {comp && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${comp.adequate ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">KOMPANSASYON KONTROLÜ</div>
            <p className="text-[10px] font-bold text-blue-900/50 font-mono mb-2">{comp.expected}</p>
            <p className={`text-lg font-black ${comp.adequate ? 'text-emerald-700' : 'text-amber-700'}`}>{comp.label}</p>
            <p className={`text-sm font-bold mt-1 ${comp.adequate ? 'text-emerald-700' : 'text-amber-700'} opacity-80`}>
              {comp.adequate
                ? "✓ Kompansasyon yeterli — basit bozukluk"
                : `✗ Kompansasyon yetersiz — ${mixed ?? "mikst bozukluk olasılığı"}`}
            </p>
          </div>
        )}

        {/* ── Anyon Açığı ───────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anyon Açığı & Delta-Delta</p>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Na⁺" value={na} set={setNa} ph="ör. 138" unit="mEq/L" />
            <Input label="Cl⁻" value={cl} set={setCl} ph="ör. 102" unit="mEq/L" />
            <Input label="Albumin (opsiyonel)" value={alb} set={setAlb} ph="ör. 4.0" unit="g/dL" />
          </div>

          {ag !== null && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className={`rounded-2xl p-4 text-center ${agHigh ? 'bg-rose-900 text-white' : 'bg-emerald-50 border border-emerald-200'}`}>
                <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${agHigh ? 'text-rose-200/70' : 'text-emerald-600'}`}>Anyon Açığı</div>
                <div className={`text-3xl font-black ${agHigh ? 'text-white' : 'text-emerald-700'}`}>{ag.toFixed(1)}</div>
                <div className={`text-[9px] font-bold mt-1 ${agHigh ? 'text-amber-400' : 'text-emerald-600'}`}>{agHigh ? "↑ YÜKSEK (N: 8–12)" : "NORMAL (N: 8–12)"}</div>
              </div>
              {agCorrected !== null && (
                <div className={`rounded-2xl p-4 text-center ${agCorrected > 12 ? 'bg-rose-900 text-white' : 'bg-emerald-50 border border-emerald-200'}`}>
                  <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${agCorrected > 12 ? 'text-rose-200/70' : 'text-emerald-600'}`}>Albumin Düzeltmeli AG</div>
                  <div className={`text-3xl font-black ${agCorrected > 12 ? 'text-white' : 'text-emerald-700'}`}>{agCorrected.toFixed(1)}</div>
                  <div className={`text-[9px] font-bold mt-1 ${agCorrected > 12 ? 'text-amber-400' : 'text-emerald-600'}`}>AG + 2.5×(4−Alb)</div>
                </div>
              )}
            </div>
          )}

          {agHigh && dd !== null && hco3N > 0 && (
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delta-Delta Oranı (AG asidozunda eşzamanlı bozukluk)</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3 text-center">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ΔAG</div>
                  <div className="text-xl font-black text-blue-900">{deltaAg?.toFixed(1)}</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 text-center">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ΔHCO₃⁻</div>
                  <div className="text-xl font-black text-blue-900">{deltaHco3?.toFixed(1)}</div>
                </div>
                <div className={`rounded-2xl p-3 text-center ${dd < 1 ? 'bg-sky-100' : dd <= 2 ? 'bg-emerald-100' : 'bg-purple-100'}`}>
                  <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${dd < 1 ? 'text-sky-600' : dd <= 2 ? 'text-emerald-600' : 'text-purple-600'}`}>Δ/Δ</div>
                  <div className={`text-xl font-black ${dd < 1 ? 'text-sky-700' : dd <= 2 ? 'text-emerald-700' : 'text-purple-700'}`}>{dd.toFixed(2)}</div>
                </div>
              </div>
              <div className={`rounded-xl px-4 py-2 text-[10px] font-bold
                ${dd < 1 ? 'bg-sky-50 text-sky-700 border border-sky-200' : dd <= 2 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                {dd < 1  ? "Δ/Δ < 1 → Eşzamanlı non-AG metabolik asidoz" :
                 dd <= 2 ? "Δ/Δ 1–2 → Saf AG metabolik asidoz" :
                           "Δ/Δ > 2 → Eşzamanlı metabolik alkaloz"}
              </div>
            </div>
          )}
        </div>

        {/* ── Oksijenasyon ──────────────────────────── */}
        {(pao2N > 0 || ageN > 0) && (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Oksijenasyon</p>
            <Input label="Hasta Yaşı (A-a gradyant normalini hesaplamak için)" value={age} set={setAge} ph="ör. 55" unit="yıl" />

            {aaGrad !== null && (
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-2xl p-4 text-center ${aaGrad > aaNormal ? 'bg-rose-900 text-white' : 'bg-emerald-50 border border-emerald-200'}`}>
                  <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${aaGrad > aaNormal ? 'text-rose-200/70' : 'text-emerald-600'}`}>A-a Gradyant</div>
                  <div className={`text-3xl font-black ${aaGrad > aaNormal ? 'text-white' : 'text-emerald-700'}`}>{aaGrad.toFixed(0)}</div>
                  <div className={`text-[9px] font-bold mt-1 ${aaGrad > aaNormal ? 'text-amber-400' : 'text-emerald-600'}`}>
                    {aaGrad > aaNormal ? `↑ YÜKSEK (N: ~${aaNormal.toFixed(0)})` : `NORMAL (N: ~${aaNormal.toFixed(0)})`}
                  </div>
                </div>
                {pf !== null && (
                  <div className={`rounded-2xl p-4 text-center ${pf < 200 ? 'bg-rose-900 text-white' : pf < 300 ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                    <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${pf < 200 ? 'text-rose-200/70' : pf < 300 ? 'text-amber-600' : 'text-emerald-600'}`}>P/F Oranı</div>
                    <div className={`text-3xl font-black ${pf < 200 ? 'text-white' : pf < 300 ? 'text-amber-700' : 'text-emerald-700'}`}>{pf}</div>
                    <div className={`text-[9px] font-bold mt-1 ${pf < 200 ? 'text-amber-400' : pf < 300 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {pf >= 300 ? "NORMAL" : pf >= 200 ? "HAFİF ARDS" : "ORTA/AĞIR ARDS"}
                    </div>
                  </div>
                )}
              </div>
            )}
            {pao2Calc !== null && (
              <p className="text-[9px] font-bold text-slate-400">PAO₂ = FiO₂ × 713 − PaCO₂/0.8 = {pao2Calc.toFixed(1)} mmHg (deniz seviyesi)</p>
            )}
          </div>
        )}

        {/* ── Kompansasyon Formülleri Referans ─────── */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Kompansasyon Formülleri Referansı</p>
          <div className="space-y-2">
            {[
              { d: "Metabolik Asidoz",          f: "PaCO₂ = 1.5 × HCO₃⁻ + 8 ± 2  (Winter)" },
              { d: "Metabolik Alkaloz",          f: "PaCO₂ = 0.7 × HCO₃⁻ + 21 ± 5" },
              { d: "Solunum Asidozu (Akut)",     f: "ΔHCO₃⁻ = ΔPaCO₂/10 × 1" },
              { d: "Solunum Asidozu (Kronik)",   f: "ΔHCO₃⁻ = ΔPaCO₂/10 × 3.5" },
              { d: "Solunum Alkalozu (Akut)",    f: "ΔHCO₃⁻ = ΔPaCO₂/10 × 2" },
              { d: "Solunum Alkalozu (Kronik)",  f: "ΔHCO₃⁻ = ΔPaCO₂/10 × 5" },
            ].map(r => (
              <div key={r.d} className="flex items-baseline gap-3 py-1.5 border-b border-slate-50">
                <span className="text-[10px] font-black text-blue-900/60 uppercase tracking-widest w-44 shrink-0">{r.d}</span>
                <span className="text-[11px] font-bold text-blue-900 font-mono">{r.f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{ ph: phN, pco2: pco2N, hco3: hco3N, na: naN, cl: clN }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Henderson-Hasselbalch kontrolü lab değerleriyle uyumsuzluk gösteriyorsa ölçüm hatası veya laboratuvar artefaktı değerlendirin. A-a gradyant hesabı deniz seviyesinde geçerlidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
