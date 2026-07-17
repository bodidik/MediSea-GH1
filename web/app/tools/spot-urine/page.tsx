"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

const TABS = [
  { id: "protein",  label: "Protein & Albumin",   icon: "🧬" },
  { id: "sodium",   label: "Sodyum & AKI (FENa)", icon: "🧂" },
  { id: "potassium",label: "Potasyum (TTKG)",      icon: "⚡" },
  { id: "acidbase", label: "Asit-Baz (UAG)",       icon: "🔬" },
] as const;
type Tab = typeof TABS[number]["id"];

const Input = ({ label, value, set, ph, unit, note }: {
  label: string; value: string; set: (v: string) => void;
  ph: string; unit: string; note?: string;
}) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
    <div className="relative">
      <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all pr-20" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 text-right leading-tight">{unit}</span>
    </div>
    {note && <span className="text-[9px] font-bold text-slate-400 pl-1">{note}</span>}
  </label>
);

const ResultRow = ({ label, value, unit, normal, interpretation, ok }: {
  label: string; value: string | null; unit: string;
  normal: string; interpretation: string; ok?: boolean | null;
}) => (
  <div className={`rounded-2xl p-4 border ${ok === true ? 'bg-emerald-50 border-emerald-200' : ok === false ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
    <div className="flex items-start justify-between gap-2">
      <div>
        <div className="text-[9px] font-black uppercase tracking-widest text-blue-900/50 mb-1">{label}</div>
        {value !== null ? (
          <div className={`text-2xl font-black ${ok === true ? 'text-emerald-700' : ok === false ? 'text-rose-700' : 'text-blue-900'}`}>
            {value} <span className="text-sm font-bold opacity-60">{unit}</span>
          </div>
        ) : (
          <div className="text-xl font-black text-slate-300">—</div>
        )}
        {value !== null && <p className={`text-[10px] font-bold mt-1 ${ok === true ? 'text-emerald-600' : ok === false ? 'text-rose-600' : 'text-slate-500'}`}>{interpretation}</p>}
      </div>
      <div className="text-right shrink-0">
        <div className="text-[9px] font-bold text-slate-400 leading-tight">Normal</div>
        <div className="text-[9px] font-black text-slate-600">{normal}</div>
      </div>
    </div>
  </div>
);

export default function SpotUrinePage() {
  const [tab, setTab] = React.useState<Tab>("protein");

  // ── Protein & Albumin
  const [uprot,  setUprot]  = React.useState("");
  const [ucr,    setUcr]    = React.useState("");  // idrar kreatinin mg/dL
  const [ualb,   setUalb]   = React.useState("");  // albumin mg/dL

  // ── FENa / FEÜre
  const [una,    setUna]    = React.useState("");
  const [ucr2,   setUcr2]   = React.useState("");
  const [pna,    setPna]    = React.useState("");
  const [pcr,    setPcr]    = React.useState(""); // serum Cr mg/dL
  const [uurea,  setUurea]  = React.useState(""); // idrar üre mg/dL
  const [purea,  setPurea]  = React.useState(""); // serum üre mg/dL

  // ── TTKG
  const [uk,     setUk]     = React.useState("");
  const [pk,     setPk]     = React.useState("");
  const [uosm,   setUosm]   = React.useState("");
  const [posm,   setPosm]   = React.useState("");

  // ── UAG / UOG
  const [una2,   setUna2]   = React.useState("");
  const [uk2,    setUk2]    = React.useState("");
  const [ucl,    setUcl]    = React.useState("");
  const [uosm2,  setUosm2]  = React.useState(""); // ölçülen idrar Osm
  const [ugluc,  setUgluc]  = React.useState(""); // idrar glukoz mg/dL
  const [uureab, setUureab] = React.useState(""); // idrar üre mg/dL (acid-base tab)

  // ── Protein hesaplamaları
  const uprotN = parseLocaleNumber(uprot);
  const ucrN   = parseLocaleNumber(ucr);
  const ualbN  = parseLocaleNumber(ualb);

  const pcRatio = uprotN > 0 && ucrN > 0 ? (uprotN * 1000 / ucrN) : null;
  const acRatio = ualbN > 0 && ucrN > 0 ? (ualbN * 1000 / ucrN) : null;

  const getPCRInterp = (v: number) => {
    if (v < 150)   return { txt: "Normal proteinüri", ok: true };
    if (v < 500)   return { txt: "Hafif proteinüri", ok: false };
    if (v < 3500)  return { txt: "Orta proteinüri", ok: false };
    return { txt: "Nefrotik düzey proteinüri (≥ 3500 mg/g)", ok: false };
  };
  const getACRInterp = (v: number) => {
    if (v < 30)    return { txt: "Normal (A1 — CKD risk yok)", ok: true };
    if (v < 300)   return { txt: "Mikro-albuminüri (A2 — orta risk)", ok: false };
    return { txt: "Makro-albuminüri (A3 — yüksek risk)", ok: false };
  };

  // ── FENa / FEÜre
  const unaN  = parseLocaleNumber(una);
  const ucr2N = parseLocaleNumber(ucr2);
  const pnaN  = parseLocaleNumber(pna);
  const pcrN  = parseLocaleNumber(pcr);
  const uureaN = parseLocaleNumber(uurea);
  const pureaN = parseLocaleNumber(purea);

  const fena  = unaN > 0 && pnaN > 0 && ucr2N > 0 && pcrN > 0
    ? (unaN * pcrN) / (pnaN * ucr2N) * 100 : null;
  const feurea = uureaN > 0 && pureaN > 0 && ucr2N > 0 && pcrN > 0
    ? (uureaN * pcrN) / (pureaN * ucr2N) * 100 : null;

  const getFenaInterp = (v: number) => {
    if (v < 1)  return { txt: "Prerenal AKI olası", ok: null };
    if (v < 2)  return { txt: "Belirsiz — klinikle değerlendirin", ok: null };
    return { txt: "İntrensek renal hasar (ATN) olası", ok: false };
  };
  const getFeureaInterp = (v: number) => {
    if (v < 35) return { txt: "Prerenal — diüretik kullanan hastalarda tercih edilir", ok: null };
    if (v < 50) return { txt: "Belirsiz", ok: null };
    return { txt: "İntrensek renal hasar olası", ok: false };
  };

  // ── TTKG
  const ukN   = parseLocaleNumber(uk);
  const pkN   = parseLocaleNumber(pk);
  const uosmN = parseLocaleNumber(uosm);
  const posmN = parseLocaleNumber(posm);

  const ttkg = ukN > 0 && pkN > 0 && uosmN > 0 && posmN > 0
    ? (ukN / pkN) * (posmN / uosmN) : null;

  const getTTKGInterp = (v: number, seK: number) => {
    if (seK > 5) { // hyperkalemia
      if (v < 5)  return { txt: "Hiperkalemi → TTKG < 5: Hipoaldosteronizm veya transmembran kayma", ok: false };
      return { txt: "Hiperkalemi → TTKG > 5: Artmış K alımına uygun yanıt veya periferik etki", ok: null };
    }
    if (seK < 3.5) { // hypokalemia
      if (v > 7)  return { txt: "Hipokalemi → TTKG > 7: Renal K kaybı (hiperaldosteronizm, diüretik)", ok: false };
      return { txt: "Hipokalemi → TTKG < 3: Ekstrarenal K kaybı (diyare, kusma)", ok: null };
    }
    return { txt: `TTKG = ${v.toFixed(1)}`, ok: null };
  };

  // ── UAG / UOG
  const una2N  = parseLocaleNumber(una2);
  const uk2N   = parseLocaleNumber(uk2);
  const uclN   = parseLocaleNumber(ucl);
  const uosm2N = parseLocaleNumber(uosm2);
  const uglucN = parseLocaleNumber(ugluc);
  const uureabN = parseLocaleNumber(uureab);

  const uag = una2N > 0 && uk2N > 0 && uclN > 0 ? una2N + uk2N - uclN : null;
  const uOsmCalc = una2N > 0 && uk2N > 0
    ? 2 * (una2N + uk2N) + uureabN / 2.8 + uglucN / 18 : null;
  const uog = uosm2N > 0 && uOsmCalc !== null ? uosm2N - uOsmCalc : null;

  const getUAGInterp = (v: number) => {
    if (v < -20) return { txt: "Negatif UAG → NH₄⁺ atılımı yeterli: ekstrarenal neden (diyare, proksimal RTA)", ok: true };
    if (v > 20)  return { txt: "Pozitif UAG → NH₄⁺ atılımı yetersiz: distal RTA, hipoaldosteronizm", ok: false };
    return { txt: "Belirsiz (−20 ile +20 arası)", ok: null };
  };
  const getUOGInterp = (v: number) => {
    if (v > 400) return { txt: "İdrar osm. gap çok yüksek → yüksek NH₄⁺ atılımı (uygun asidoz yanıtı)", ok: true };
    if (v > 150) return { txt: "İdrar osm. gap yüksek → artmış NH₄⁺ atılımı", ok: true };
    return { txt: "İdrar osm. gap düşük → NH₄⁺ atılımı yetersiz", ok: false };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="spot-urine" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🧪</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Spot İdrar Hesaplamaları</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">PCR · ACR · FENa · FEÜre · TTKG · UAG · İdrar Osmolal Gap</p>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`p-3 rounded-2xl border transition-all text-center
                ${tab === t.id ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-white border-slate-200 hover:border-blue-900/30'}`}>
              <div className="text-xl mb-1">{t.icon}</div>
              <div className={`text-[9px] font-black uppercase tracking-widest leading-tight ${tab === t.id ? 'text-white' : 'text-blue-950'}`}>{t.label}</div>
            </button>
          ))}
        </div>

        {/* ── Protein & Albumin ─────────────────────── */}
        {tab === "protein" && (
          <div className="space-y-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spot İdrar Protein & Albumin</p>
              <Input label="İdrar Protein" value={uprot} set={setUprot} ph="ör. 45" unit="mg/dL" />
              <Input label="İdrar Albumin" value={ualb}  set={setUalb}  ph="ör. 15" unit="mg/dL"
                note="Albumin girilirse ACR hesaplanır; girilmezse atlanır" />
              <Input label="İdrar Kreatinin" value={ucr} set={setUcr} ph="ör. 80" unit="mg/dL" />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1">
              <p className="text-[9px] font-black text-blue-900/50 uppercase tracking-widest">Formüller</p>
              <p className="text-[10px] font-bold text-blue-900 font-mono">PCR (mg/g) = İdrar protein (mg/dL) × 1000 / İdrar kreatinin (mg/dL)</p>
              <p className="text-[10px] font-bold text-blue-900 font-mono">ACR (mg/g) = İdrar albumin (mg/dL) × 1000 / İdrar kreatinin (mg/dL)</p>
            </div>

            <div className="space-y-3">
              {pcRatio !== null && (() => { const i = getPCRInterp(pcRatio); return (
                <ResultRow label="Protein/Kreatinin Oranı (PCR)" value={Math.round(pcRatio).toString()}
                  unit="mg/g" normal="< 150 mg/g" interpretation={i.txt} ok={i.ok} />
              );})()}
              {acRatio !== null && (() => { const i = getACRInterp(acRatio); return (
                <ResultRow label="Albumin/Kreatinin Oranı (ACR)" value={Math.round(acRatio).toString()}
                  unit="mg/g" normal="< 30 mg/g" interpretation={i.txt} ok={i.ok} />
              );})()}
              {pcRatio !== null && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">24 Saatlik Protein Tahmini</p>
                  <p className="text-2xl font-black text-blue-900">≈ {Math.round(pcRatio)} <span className="text-sm font-bold text-slate-400">mg/gün</span></p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1">PCR (mg/g) ≈ 24 saatlik proteinüri (mg/gün)</p>
                  <div className="mt-3 grid grid-cols-4 gap-1">
                    {[
                      { l: "Normal", r: "< 150", c: "bg-emerald-100 text-emerald-700" },
                      { l: "Hafif", r: "150–500", c: "bg-sky-100 text-sky-700" },
                      { l: "Orta", r: "500–3500", c: "bg-amber-100 text-amber-700" },
                      { l: "Nefrotik", r: "≥ 3500", c: "bg-rose-100 text-rose-700" },
                    ].map(x => (
                      <div key={x.l} className={`rounded-lg p-1.5 text-center text-[8px] font-black uppercase tracking-widest ${x.c}`}>
                        <div>{x.l}</div>
                        <div className="normal-case tracking-normal font-bold">{x.r}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FENa / FEÜre ──────────────────────────── */}
        {tab === "sodium" && (
          <div className="space-y-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İdrar & Serum Değerleri</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="İdrar Na⁺" value={una} set={setUna} ph="ör. 20" unit="mEq/L" />
                <Input label="Serum Na⁺" value={pna} set={setPna} ph="ör. 138" unit="mEq/L" />
                <Input label="İdrar Kreatinin" value={ucr2} set={setUcr2} ph="ör. 80" unit="mg/dL" />
                <Input label="Serum Kreatinin" value={pcr} set={setPcr} ph="ör. 2.1" unit="mg/dL" />
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">FEÜre (diüretik kullanan hastalarda tercih edilir)</p>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="İdrar Üre" value={uurea} set={setUurea} ph="ör. 300" unit="mg/dL" />
                  <Input label="Serum Üre (BUN)" value={purea} set={setPurea} ph="ör. 40" unit="mg/dL" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1">
              <p className="text-[9px] font-black text-blue-900/50 uppercase tracking-widest">Formüller</p>
              <p className="text-[10px] font-bold text-blue-900 font-mono">FENa (%) = (UNa × PCr) / (PNa × UCr) × 100</p>
              <p className="text-[10px] font-bold text-blue-900 font-mono">FEÜre (%) = (UÜre × PCr) / (PÜre × UCr) × 100</p>
            </div>

            <div className="space-y-3">
              {fena !== null && (() => { const i = getFenaInterp(fena); return (
                <ResultRow label="FENa — Fraksiyonel Na Atılımı" value={fena.toFixed(1)} unit="%"
                  normal="< 1% prerenal · > 2% intrensek" interpretation={i.txt} ok={i.ok} />
              );})()}
              {feurea !== null && (() => { const i = getFeureaInterp(feurea); return (
                <ResultRow label="FEÜre — Fraksiyonel Üre Atılımı" value={feurea.toFixed(1)} unit="%"
                  normal="< 35% prerenal · > 50% intrensek" interpretation={i.txt} ok={i.ok} />
              );})()}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Yorum Kılavuzu</p>
              <div className="space-y-2">
                {[
                  { l: "FENa < 1%", d: "Prerenal (tübüler fonksiyon intact, Na tutulumu artmış)", c: "text-sky-700" },
                  { l: "FENa 1–2%", d: "Belirsiz — kontrast nefropati, miyoglobinüri", c: "text-amber-700" },
                  { l: "FENa > 2%", d: "ATN / intrensek AKI (tübüler hasar, Na tutulumu bozulmuş)", c: "text-rose-700" },
                  { l: "FEÜre < 35%", d: "Prerenal — diüretik kullanımında FENa yerine tercih et", c: "text-sky-700" },
                ].map(r => (
                  <div key={r.l} className="flex items-start gap-3">
                    <span className={`text-[10px] font-black ${r.c} w-24 shrink-0`}>{r.l}</span>
                    <span className="text-[10px] font-bold text-blue-900/70">{r.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TTKG ──────────────────────────────────── */}
        {tab === "potassium" && (
          <div className="space-y-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transtübüler Potasyum Gradienti</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="İdrar K⁺" value={uk} set={setUk} ph="ör. 40" unit="mEq/L" />
                <Input label="Serum K⁺"  value={pk} set={setPk} ph="ör. 5.8" unit="mEq/L" />
                <Input label="İdrar Osmolalite" value={uosm} set={setUosm} ph="ör. 400" unit="mOsm/kg" />
                <Input label="Serum Osmolalite" value={posm} set={setPosm} ph="ör. 290" unit="mOsm/kg" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1">
              <p className="text-[9px] font-black text-blue-900/50 uppercase tracking-widest">Formül</p>
              <p className="text-[10px] font-bold text-blue-900 font-mono">TTKG = (UK / PK) × (POsm / UOsm)</p>
              <p className="text-[9px] font-bold text-blue-900/50 mt-1">İdrar osmolalitesi plazma osmolalitesinden yüksek olmalı (tubüler konsantrasyon gereksinimi)</p>
            </div>

            {ttkg !== null && (
              <div className={`p-6 rounded-[2rem] border-2 border-dashed ${ttkg >= 5 && pkN > 5 ? 'bg-sky-50 border-sky-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">TTKG</div>
                <p className={`text-4xl font-black ${ttkg >= 5 ? 'text-sky-700' : 'text-rose-700'}`}>{ttkg.toFixed(1)}</p>
                {pkN > 0 && (
                  <p className={`text-sm font-bold mt-2 ${ttkg >= 5 && pkN > 5 ? 'text-sky-700' : 'text-rose-700'} opacity-80`}>
                    {getTTKGInterp(ttkg, pkN).txt}
                  </p>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">TTKG Yorumlama Kılavuzu</p>
              <div className="space-y-3">
                {[
                  { title: "HİPERKALEMİ VARLĞINDA (K > 5 mEq/L)", rows: [
                    { v: "< 5", d: "Hipoaldosteronizm, transmembran kayma (asidoz, insülin eksikliği)", c: "text-rose-700" },
                    { v: "≥ 5–10", d: "Artmış K alımı, periferik sebep — böbrek yanıtı uygun", c: "text-amber-700" },
                  ]},
                  { title: "HİPOKALEMİ VARLĞINDA (K < 3.5 mEq/L)", rows: [
                    { v: "> 7", d: "Renal K kaybı — hiperaldosteronizm, diüretik, Gitelman/Bartter", c: "text-rose-700" },
                    { v: "< 3", d: "Ekstrarenal K kaybı — diyare, kusma, laksatif", c: "text-sky-700" },
                  ]},
                ].map(sec => (
                  <div key={sec.title}>
                    <p className="text-[8px] font-black text-blue-900/40 uppercase tracking-widest mb-1">{sec.title}</p>
                    {sec.rows.map(r => (
                      <div key={r.v} className="flex items-start gap-3 py-1">
                        <span className={`text-[10px] font-black w-14 shrink-0 ${r.c}`}>TTKG {r.v}</span>
                        <span className="text-[10px] font-bold text-blue-900/70">{r.d}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Asit-Baz: UAG & UOG ───────────────────── */}
        {tab === "acidbase" && (
          <div className="space-y-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İdrar Elektrolitleri & Osmolalite</p>
              <div className="grid grid-cols-3 gap-4">
                <Input label="İdrar Na⁺" value={una2} set={setUna2} ph="ör. 40" unit="mEq/L" />
                <Input label="İdrar K⁺"  value={uk2}  set={setUk2}  ph="ör. 30" unit="mEq/L" />
                <Input label="İdrar Cl⁻" value={ucl}  set={setUcl}  ph="ör. 80" unit="mEq/L" />
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">İdrar Osmolal Gap için (opsiyonel)</p>
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Ölçülen İdrar Osm" value={uosm2} set={setUosm2} ph="ör. 350" unit="mOsm/kg" />
                  <Input label="İdrar Üre" value={uureab} set={setUureab} ph="ör. 200" unit="mg/dL" />
                  <Input label="İdrar Glukoz" value={ugluc} set={setUgluc} ph="ör. 0" unit="mg/dL" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1">
              <p className="text-[9px] font-black text-blue-900/50 uppercase tracking-widest">Formüller</p>
              <p className="text-[10px] font-bold text-blue-900 font-mono">UAG = UNa + UK − UCl</p>
              <p className="text-[10px] font-bold text-blue-900 font-mono">UOsm{"{hes}"} = 2×(UNa + UK) + UÜre/2.8 + UGlukoz/18</p>
              <p className="text-[10px] font-bold text-blue-900 font-mono">İdrar Osm Gap = UOsm{"{ölç}"} − UOsm{"{hes}"} ≈ 2 × [NH₄⁺]</p>
            </div>

            <div className="space-y-3">
              {uag !== null && (() => { const i = getUAGInterp(uag); return (
                <ResultRow label="İdrar Anyon Açığı (UAG)" value={uag.toFixed(0)} unit="mEq/L"
                  normal="Negatif = NH₄⁺ yeterli" interpretation={i.txt} ok={i.ok} />
              );})()}

              {uog !== null && (() => { const i = getUOGInterp(uog); return (
                <ResultRow label="İdrar Osmolal Gap (UOG ≈ 2×[NH₄⁺])" value={uog.toFixed(0)} unit="mOsm/kg"
                  normal="> 150 = yeterli NH₄⁺" interpretation={i.txt} ok={i.ok} />
              );})()}
              {uOsmCalc !== null && (
                <p className="text-[9px] font-bold text-slate-400 pl-2">Hesaplanan idrar osm: {uOsmCalc.toFixed(0)} mOsm/kg</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Metabolik Asidoz Ayırıcı Tanısında Kullanım</p>
              <div className="space-y-2">
                {[
                  { uag: "Negatif (< −20)", uog: "> 150", d: "GİS asit kaybı (diyare), proksimal RTA — NH₄⁺ atılımı normal" },
                  { uag: "Pozitif (> +20)", uog: "< 150", d: "Distal RTA, hipoaldosteronizm — NH₄⁺ atılımı bozulmuş" },
                  { uag: "Yanıltıcı olabilir", uog: "> 150", d: "Üreaz(+) enfeksiyon, ketoanyon (DKA) varlığında UAG güvenilmez" },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-0">
                    <div className="w-32 shrink-0">
                      <div className="text-[8px] font-black text-rose-600 uppercase tracking-widest">UAG: {r.uag}</div>
                      <div className="text-[8px] font-black text-sky-600 uppercase tracking-widest">UOG: {r.uog}</div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-900/70">{r.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{ tab, uprot: uprotN, ucr: ucrN }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Spot idrar örnekleri sabah ilk idrardan veya rastgele elde edilebilir. Dilüe idrar (UCr &lt; 30 mg/dL) oransal hesaplamaları yanıltabilir. FENa diüretik kullanımında yanlış pozitif, kontrast nefropatide yanlış negatif olabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
