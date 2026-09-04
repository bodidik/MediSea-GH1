"use client";

import React, { useState } from "react";
import ToolShare from "../components/ToolShare";
import ToolTopNav from "../components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

/** * MediSea Donanması - Nütrisyon Üssü
 * GLIM - Global Leadership Initiative on Malnutrition
 * Tanı Kriterleri Sentezi
 */

export default function GLIMPage() {
  /**
   * Bes secici bir donem DENETIMSIZDI (`value` yok) ve durum 0'la basliyordu.
   * "Dokunulmadi" ile "ilk secenek secildi" AYNI seydi, yani dokunulmamis form
   * OLCULDU: "GLIM TANISAL SONUC — Tani Kriterleri Karsilanmadi" basiyordu.
   * Bu bir IDDIA: "degerlendirdik ve bulmadik" demek. `kdigo-aki`nin "AKI
   * Kriteri Yok" ve `das28`in bos formda "Remisyon" kusurlariyla ayni sinif ve
   * ayni tehlikeli yon -- guven veren cevap.
   */
  type Cevap = number | null;
  const [phenotype, setPhenotype] = useState<{ weight: Cevap; bmi: Cevap; muscle: Cevap }>(
    { weight: null, bmi: null, muscle: null });
  const [etiology, setEtiology] = useState<{ intake: Cevap; inflammation: Cevap }>(
    { intake: null, inflammation: null });

  const fenotipTumu   = phenotype.weight !== null && phenotype.bmi !== null && phenotype.muscle !== null;
  const etiyolojiTumu = etiology.intake !== null && etiology.inflammation !== null;

  // GLIM Tanı Şartı: En az 1 Fenotipik + En az 1 Etiyolojik kriter
  const hasPhenotype = (phenotype.weight ?? 0) > 0 || (phenotype.bmi ?? 0) > 0 || (phenotype.muscle ?? 0) > 0;
  const hasEtiology  = (etiology.intake ?? 0) > 0 || (etiology.inflammation ?? 0) > 0;
  const isDiagnosed  = hasPhenotype && hasEtiology;

  /**
   * "Karsilanmadi" ancak BILINIYORSA soylenir: bir grubun tamami yanitlanip
   * hicbiri pozitif cikmadiysa o grup kesin olarak yoktur ve tani dusor.
   * Tani KONDU ise oteki alanlar bos olsa bile hukum verilebilir -- GLIM
   * "en az 1 + en az 1" istiyor, hepsini degil.
   */
  const kesinYok = (fenotipTumu && !hasPhenotype) || (etiyolojiTumu && !hasEtiology);
  const hukum: "kondu" | "karsilanmadi" | null =
    isDiagnosed ? "kondu" : kesinYok ? "karsilanmadi" : null;
  const karar =
    hukum === "kondu" ? "Malnütrisyon Tanısı Kondu"
      : hukum === "karsilanmadi" ? "Tanı Kriterleri Karşılanmadı"
        : null;

  const eksikAlanlar = [
    phenotype.weight === null && "kilo kaybı",
    phenotype.bmi === null && "düşük VKİ",
    phenotype.muscle === null && "kas kütlesi",
    etiology.intake === null && "gıda alımı",
    etiology.inflammation === null && "inflamasyon",
  ].filter(Boolean) as string[];

  // Şiddet Belirleme (Fenotipik kriterlerin en ağırı baz alınır)
  const severityScore = Math.max(phenotype.weight ?? 0, phenotype.bmi ?? 0, phenotype.muscle ?? 0);

  const isaret = (varMi: boolean, tumu: boolean) => varMi ? "✅" : tumu ? "❌" : "—";
  const sec = (v: string): Cevap => v === "" ? null : Number(v);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        <ToolTopNav toolSlug="glim" />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">📊</div>
          <div>
            <div className="flex items-center gap-2">
               <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">GLIM Tanı Seti</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Malnütrisyon Tanı Kriterleri</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* FENOTİPİK KRİTERLER */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b pb-2 flex items-center justify-between">
              1. Fenotipik Kriterler <span>{isaret(hasPhenotype, fenotipTumu)}</span>
            </h2>
            
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kilo Kaybı</span>
                <select value={phenotype.weight ?? ""} onChange={(e)=>setPhenotype({...phenotype, weight: sec(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 text-xs font-bold outline-none border-none ring-2 ring-slate-100 focus:ring-amber-400">
                  <option value="">Seçiniz…</option>
                  <option value="0">Yok / Anlamsız</option>
                  <option value="1">Evre 1 (Hafif-Orta): 6 ayda %5-10 veya &gt;6 ayda %10-20</option>
		  <option value="2">Evre 2 (Şiddetli): 6 ayda &gt;%10 veya &gt;6 ayda &gt;%20</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Düşük VKİ (kg/m²)</span>
                <select value={phenotype.bmi ?? ""} onChange={(e)=>setPhenotype({...phenotype, bmi: sec(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 text-xs font-bold outline-none border-none ring-2 ring-slate-100 focus:ring-amber-400">
                  <option value="">Seçiniz…</option>
                  <option value="0">Normal</option>
                  <option value="1">Evre 1: &lt;20 (70y altı) veya &lt;22 (70y üstü)</option>
                  <option value="2">Evre 2: &lt;18.5 (70y altı) veya &lt;20 (70y üstü)</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kas Kütlesinde Azalma</span>
                <select value={phenotype.muscle ?? ""} onChange={(e)=>setPhenotype({...phenotype, muscle: sec(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 text-xs font-bold outline-none border-none ring-2 ring-slate-100 focus:ring-amber-400">
                  <option value="">Seçiniz…</option>
                  <option value="0">Normal</option>
                  <option value="1">Evre 1: Hafif-Orta (Muayene/Görüntüleme)</option>
                  <option value="2">Evre 2: Şiddetli (Muayene/Görüntüleme)</option>
                </select>
              </label>
            </div>
          </div>

          {/* ETİYOLOJİK KRİTERLER */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-[11px] font-black text-blue-900 uppercase tracking-widest border-b pb-2 flex items-center justify-between">
              2. Etiyolojik Kriterler <span>{isaret(hasEtiology, etiyolojiTumu)}</span>
            </h2>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gıda Alımı / Emilim Azalması</span>
                <select value={etiology.intake ?? ""} onChange={(e)=>setEtiology({...etiology, intake: sec(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 text-xs font-bold outline-none border-none ring-2 ring-slate-100 focus:ring-amber-400">
                  <option value="">Seçiniz…</option>
                  <option value="0">Yok</option>
                  <option value="1">Var: &gt;1 hafta &lt;%50 alım veya kronik GİS sorunları</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">İnflamasyon / Hastalık Yükü</span>
                <select value={etiology.inflammation ?? ""} onChange={(e)=>setEtiology({...etiology, inflammation: sec(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 text-xs font-bold outline-none border-none ring-2 ring-slate-100 focus:ring-amber-400">
                  <option value="">Seçiniz…</option>
                  <option value="0">Yok</option>
                  <option value="1">Var: Akut hastalık/travma veya kronik hastalıkla ilişkili inflamasyon</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* TANILAR VE ŞİDDET SONUCU */}
        <SonucDuyuru metin={karar} />

        <div className={`rounded-[2.5rem] p-8 border-4 transition-all duration-500 ${isDiagnosed ? 'bg-blue-900 border-amber-400 shadow-2xl' : 'bg-slate-200 border-slate-300'}`}>
          <div className="text-center space-y-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDiagnosed ? "text-amber-400" : "text-amber-800"}`}>GLIM TANISAL SONUÇ</span>
            <h2 className={`text-3xl font-black italic uppercase break-words hyphens-auto ${isDiagnosed ? 'text-white' : 'text-slate-400'}`}>
              {karar ?? "Değerlendirilemedi"}
            </h2>
            {hukum === null && (
              <p role="alert" className="text-[11px] font-bold text-slate-500 max-w-md mx-auto">
                Hüküm için şu alan{eksikAlanlar.length > 1 ? "lar" : ""} yanıtlanmalı: {eksikAlanlar.join(" · ")}
              </p>
            )}
            {isDiagnosed && (
              <div className="pt-4 mt-4 border-t border-white/10">
                <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest block mb-1">Şiddet Derecesi</span>
                <p className="text-xl font-black text-amber-400 uppercase italic">
                  {severityScore === 2 ? "EVRE 2 (ŞİDDETLİ MALNÜTRİSYON)" : "EVRE 1 (ORTA DERECE MALNÜTRİSYON)"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ALT NOTLAR */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <ToolShare params={Object.fromEntries(
            Object.entries({ ...phenotype, ...etiology }).filter(([, v]) => v !== null) as [string, number][]
          )} />
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic text-center">
              GLIM tanısı için en az 1 fenotipik ve en az 1 etiyolojik kriterin varlığı şarttır. Tanı konulduktan sonra şiddet derecesi fenotipik kriterlere göre belirlenir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}