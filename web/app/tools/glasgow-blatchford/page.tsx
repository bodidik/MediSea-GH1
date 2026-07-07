"use client";

import React, { useState, useMemo } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/** * Glasgow-Blatchford Skoru Gündüz Modu (Sakin Deniz)
 * Üst GİS kanamasında endoskopi öncesi risk stratifikasyonu
 */

function bunPoints(bun: number): number {
  if (bun >= 70) return 6;
  if (bun >= 28) return 4;
  if (bun >= 22.4) return 3;
  if (bun >= 18.2) return 2;
  return 0;
}

function hgbPoints(hgb: number, sex: "male" | "female"): number {
  if (sex === "male") {
    if (hgb < 10) return 6;
    if (hgb < 12) return 3;
    if (hgb < 13) return 1;
    return 0;
  }
  if (hgb < 10) return 6;
  if (hgb < 12) return 1;
  return 0;
}

function sbpPoints(sbp: number): number {
  if (sbp < 90) return 3;
  if (sbp < 100) return 2;
  if (sbp < 110) return 1;
  return 0;
}

export default function GlasgowBlatchfordPage() {
  const [bun, setBun] = useState<string>("15");
  const [hgb, setHgb] = useState<string>("14");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [sbp, setSbp] = useState<string>("120");
  const [tachycardia, setTachycardia] = useState(false);
  const [melena, setMelena] = useState(false);
  const [syncope, setSyncope] = useState(false);
  const [hepatic, setHepatic] = useState(false);
  const [cardiac, setCardiac] = useState(false);

  const bunNum = parseLocaleNumber(bun);
  const hgbNum = parseLocaleNumber(hgb);
  const sbpNum = parseLocaleNumber(sbp);

  const score = useMemo(() => {
    return (
      bunPoints(bunNum) +
      hgbPoints(hgbNum, sex) +
      sbpPoints(sbpNum) +
      (tachycardia ? 1 : 0) +
      (melena ? 1 : 0) +
      (syncope ? 2 : 0) +
      (hepatic ? 2 : 0) +
      (cardiac ? 2 : 0)
    );
  }, [bunNum, hgbNum, sex, sbpNum, tachycardia, melena, syncope, hepatic, cardiac]);

  const interpretation =
    score === 0
      ? { label: "Düşük Risk — Ayaktan Takip Değerlendirilebilir", color: "text-emerald-700", bg: "bg-emerald-50" }
      : { label: "Yüksek Risk — Hastane Yatışı / Erken Endoskopi Gerekebilir", color: "text-rose-700", bg: "bg-rose-50" };

  const shareParams = {
    bun: bunNum, hgb: hgbNum, sex, sbp: sbpNum,
    tachy: tachycardia ? 1 : 0, mel: melena ? 1 : 0, syn: syncope ? 1 : 0,
    hep: hepatic ? 1 : 0, card: cardiac ? 1 : 0,
  };

  const CheckRow = ({ label, pts, checked, onChange }: { label: string; pts: number; checked: boolean; onChange: () => void }) => (
    <label
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer
        ${checked ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30 text-blue-950'}
      `}
    >
      <span className="text-xs font-bold">{label}</span>
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-black ${checked ? 'text-amber-400' : 'text-slate-400'}`}>+{pts}</span>
        <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checked ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        <ToolTopNav toolSlug="glasgow-blatchford" />

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🩸
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Glasgow-Blatchford Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Üst GİS Kanaması — Endoskopi Öncesi Risk</p>
          </div>
        </div>

        {/* LAB / VİTAL INPUTLAR */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kan Üre Azotu — BUN (mg/dL)</span>
            <input type="text" inputMode="decimal" value={bun} onChange={(e) => setBun(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Hemoglobin (g/dL)</span>
            <input type="text" inputMode="decimal" value={hgb} onChange={(e) => setHgb(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cinsiyet</span>
            <select value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg appearance-none cursor-pointer">
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sistolik KB (mmHg)</span>
            <input type="text" inputMode="decimal" value={sbp} onChange={(e) => setSbp(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all" />
          </label>
        </div>

        {/* DİĞER KRİTERLER */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-2">Diğer Klinik Bulgular</span>
          <CheckRow label="Nabız ≥ 100/dk" pts={1} checked={tachycardia} onChange={() => setTachycardia(v => !v)} />
          <CheckRow label="Melena" pts={1} checked={melena} onChange={() => setMelena(v => !v)} />
          <CheckRow label="Senkop" pts={2} checked={syncope} onChange={() => setSyncope(v => !v)} />
          <CheckRow label="Karaciğer Hastalığı Öyküsü" pts={2} checked={hepatic} onChange={() => setHepatic(v => !v)} />
          <CheckRow label="Kalp Yetmezliği Öyküsü" pts={2} checked={cardiac} onChange={() => setCardiac(v => !v)} />
        </div>

        {/* SONUÇ PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">GBS</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">GLASGOW-BLATCHFORD SKORU</span>
           <div className="text-7xl font-black text-white">{score}</div>
           <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">/ 23</span>
        </div>

        {/* YORUMLAMA PANELİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className={`text-center p-4 rounded-xl font-black italic uppercase tracking-tight ${interpretation.bg} ${interpretation.color}`}>
             {interpretation.label}
           </div>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-slate-900/5 p-6 rounded-[2rem] border border-slate-200 space-y-4">
          <ToolShare params={shareParams} />
          <p className="text-[9px] text-blue-900/60 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic">
            ⚠️ Skor = 0 olan hastalar genellikle güvenle ayaktan takip edilebilir (endoskopi öncesi düşük risk). ≥1 puan, hastane yatışı ve erken endoskopi ihtiyacını artırır.
          </p>
        </div>

      </div>
    </div>
  );
}
