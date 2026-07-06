"use client";

import React, { useState, useMemo } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import { anionGap, correctedAnionGap, parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/** * Anyon Açığı (Anion Gap) Gündüz Modu (Sakin Deniz)
 * Formül: AG = Na - (Cl + HCO3); Albumin düzeltmesi: AG + 2.5 * (4.0 - Albumin)
 */

export default function AnionGapPage() {
  // Metin (string) state: kullanıcı alanı silip yeniden yazabilsin, virgül/nokta
  // ondalık ayracı ile yazabilsin diye — sayıya çevirme sadece hesaplama anında yapılır.
  const [na, setNa] = useState<string>("140");
  const [cl, setCl] = useState<string>("104");
  const [hco3, setHco3] = useState<string>("24");
  const [albumin, setAlbumin] = useState<string>("");

  const naNum = parseLocaleNumber(na);
  const clNum = parseLocaleNumber(cl);
  const hco3Num = parseLocaleNumber(hco3);
  const albuminNum = parseLocaleNumber(albumin);

  const ag = useMemo(() => anionGap(naNum, clNum, hco3Num), [naNum, clNum, hco3Num]);
  const agCorrected = useMemo(
    () => (albuminNum > 0 ? correctedAnionGap(ag, albuminNum) : null),
    [ag, albuminNum]
  );

  const displayValue = agCorrected ?? ag;
  const interpretation =
    displayValue > 12
      ? { label: "Yüksek Anyon Açıklı", color: "text-rose-700", bg: "bg-rose-50" }
      : displayValue < 8
      ? { label: "Düşük Anyon Açığı", color: "text-amber-700", bg: "bg-amber-50" }
      : { label: "Normal Aralık", color: "text-emerald-700", bg: "bg-emerald-50" };

  const shareParams = { na: naNum, cl: clNum, hco3: hco3Num, alb: albuminNum || "" };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🧬
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Anyon Açığı</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Asit-Baz Değerlendirmesi (± Albumin Düzeltmesi)</p>
          </div>
        </div>

        {/* INPUT KARTLARI */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sodyum (mEq/L)</span>
            <input
              type="text" inputMode="decimal" value={na} onChange={(e) => setNa(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Klorür (mEq/L)</span>
            <input
              type="text" inputMode="decimal" value={cl} onChange={(e) => setCl(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Bikarbonat (mEq/L)</span>
            <input
              type="text" inputMode="decimal" value={hco3} onChange={(e) => setHco3(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all"
            />
          </label>
        </div>

        {/* OPSİYONEL ALBUMİN */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Albumin (g/dL) — opsiyonel</span>
            <input
              type="text" inputMode="decimal" value={albumin} placeholder="Girilirse düzeltilmiş AG hesaplanır"
              onChange={(e) => setAlbumin(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all placeholder:text-xs placeholder:font-bold placeholder:text-slate-300"
            />
          </label>
          <p className="text-[9px] text-slate-400 font-bold italic uppercase leading-relaxed mt-2">
            * Hipoalbüminemi anyon açığını gizleyebilir; her 1 g/dL albumin düşüşü için AG'ye +2.5 eklenir.
          </p>
        </div>

        {/* SONUÇ PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black">AG</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">
             {agCorrected !== null ? "DÜZELTİLMİŞ ANYON AÇIĞI" : "ANYON AÇIĞI"}
           </span>
           <div className="text-7xl font-black text-white">{displayValue}</div>
           <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">mEq / L</span>
           {agCorrected !== null && (
             <span className="text-[9px] font-bold text-blue-300/70 uppercase tracking-widest mt-3">Düzeltmesiz AG: {ag} mEq/L</span>
           )}
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
            ⚠️ Formül: Na - (Cl + HCO₃). Normal aralık laboratuvara göre değişir (yaklaşık 8-12 mEq/L). Yüksek AG metabolik asidoz ayırıcı tanısında (MUDPILES vb.) kullanılır.
          </p>
        </div>

      </div>
    </div>
  );
}
