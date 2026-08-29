"use client";

import React, { useState, useMemo } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { das28Esr, das28Crp, parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/** * DAS28 Gündüz Modu (Sakin Deniz)
 * Romatoid Artrit Hastalık Aktivite Skoru — ESR veya CRP bazlı
 */

type Mode = "esr" | "crp";

export default function Das28Page() {
  const [mode, setMode] = useState<Mode>("esr");
  const [tjc, setTjc] = useState<string>("0");
  const [sjc, setSjc] = useState<string>("0");
  const [marker, setMarker] = useState<string>("20");
  const [gh, setGh] = useState<string>("20");

  const tjcNum = Math.min(28, Math.max(0, Math.round(parseLocaleNumber(tjc))));
  const sjcNum = Math.min(28, Math.max(0, Math.round(parseLocaleNumber(sjc))));
  const markerNum = parseLocaleNumber(marker);
  const ghNum = Math.min(100, Math.max(0, parseLocaleNumber(gh)));

  /**
   * MAKULLÜK KAPISI — burada kusur TERS yönde çalışıyordu.
   *
   * Ölçüldü (canlı): form BOMBOŞKEN araç **DAS28 0** basıp altına
   * **"Remisyon"** yazıyordu. Veri yokken hastayı remisyonda ilan etmek,
   * yüksek skor uydurmanın aynadaki hâli: bu kez risk tedaviyi
   * gereksiz yere hafifletmek. DAS28'in matematiksel tabanı da ~0.96,
   * yani 0 zaten imkânsız bir değer.
   *
   * MEŞRU SIFIR: hassas/şiş eklem sayısı 0 ve hasta global değerlendirmesi
   * 0 GERÇEK ölçümlerdir (remisyonun tanımı). O yüzden bu alanlar yalnızca
   * sayıya bakılarak denetlenemez.
   *
   * AMA "BOŞ MU" DENETİMİ DE YETMİYOR — ölçüldü, çöp girdi geçiyordu:
   *
   *     tjc "abc"  ->  DAS28 2.38 · "Remisyon"
   *
   * Çünkü "abc" boş değil, `parseLocaleNumber` onu 0'a çeviriyor ve 0 zaten
   * [0, 28] aralığında. Yani kapı, elemek için konduğu şeyi geçiriyordu ve
   * yine aynı tehlikeli yöne düşüyordu: yazım hatası yapan hekime remisyon.
   *
   * Doğru ayrım HAM DİZENİN SAYI OLUP OLMADIĞI: `sayiGirildiMi` "abc"yi ve
   * boş alanı eler, yazılmış bir "0"ı geçirir — meşru sıfır korunur.
   */
  const doluVeAralikta = (ham: string, alt: number, ust: number) => {
    if (!sayiGirildiMi(ham)) return false;
    const n = parseLocaleNumber(ham);
    return n >= alt && n <= ust;
  };

  const makul =
    doluVeAralikta(tjc, 0, 28) &&
    doluVeAralikta(sjc, 0, 28) &&
    doluVeAralikta(gh, 0, 100) &&
    doluVeAralikta(marker, mode === "esr" ? 1 : 0.1, mode === "esr" ? 200 : 500);

  const score = useMemo(() => {
    return mode === "esr"
      ? das28Esr(tjcNum, sjcNum, markerNum, ghNum)
      : das28Crp(tjcNum, sjcNum, markerNum, ghNum);
  }, [mode, tjcNum, sjcNum, markerNum, ghNum]);

  const thresholds = mode === "esr"
    ? { remission: 2.6, low: 3.2, moderate: 5.1 }
    : { remission: 2.3, low: 2.7, moderate: 4.1 };

  const interpretation =
    score > thresholds.moderate
      ? { label: "Yüksek Hastalık Aktivitesi", color: "text-rose-700", bg: "bg-rose-50" }
      : score > thresholds.low
      ? { label: "Orta Hastalık Aktivitesi", color: "text-amber-700", bg: "bg-amber-50" }
      : score > thresholds.remission
      ? { label: "Düşük Hastalık Aktivitesi", color: "text-sky-700", bg: "bg-sky-50" }
      : { label: "Remisyon", color: "text-emerald-700", bg: "bg-emerald-50" };

  const shareParams = { mode, tjc: tjcNum, sjc: sjcNum, marker: markerNum, gh: ghNum };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        <ToolTopNav toolSlug="das28" />

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🦴
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">DAS28</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Romatoid Artrit Hastalık Aktivite Skoru</p>
          </div>
        </div>

        {/* MOD SEÇİMİ */}
        <div className="flex gap-2">
          <button aria-pressed={mode === "esr"}
            type="button"
            onClick={() => setMode("esr")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
              mode === "esr" ? "bg-blue-900 border-blue-900 text-white shadow-md" : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            DAS28-ESR
          </button>
          <button aria-pressed={mode === "crp"}
            type="button"
            onClick={() => setMode("crp")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
              mode === "crp" ? "bg-blue-900 border-blue-900 text-white shadow-md" : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            DAS28-CRP
          </button>
        </div>

        {/* INPUT KARTLARI */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Hassas Eklem Sayısı (0-28)</span>
            <input
              type="text" inputMode="decimal" value={tjc} onChange={(e) => setTjc(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Şiş Eklem Sayısı (0-28)</span>
            <input
              type="text" inputMode="decimal" value={sjc} onChange={(e) => setSjc(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
              {mode === "esr" ? "ESR (mm/saat)" : "CRP (mg/L)"}
            </span>
            <input
              type="text" inputMode="decimal" value={marker} onChange={(e) => setMarker(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Hasta Genel Değerlendirmesi (0-100 VAS)</span>
            <input
              type="text" inputMode="decimal" value={gh} onChange={(e) => setGh(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all"
            />
          </label>
        </div>

        {/* SONUÇ PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div aria-hidden="true" className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">DAS28</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">
             DAS28-{mode.toUpperCase()}
           </span>
           <div className="text-7xl font-black text-white">{makul ? score : "–"}</div>
        </div>

        {/* YORUMLAMA PANELİ */}
        <SonucDuyuru metin={makul ? interpretation.label : null} />

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className={`text-center p-4 rounded-xl font-black italic uppercase tracking-tight ${interpretation.bg} ${interpretation.color}`}>
             {makul ? interpretation.label : "Değerleri girin"}
           </div>
           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center mt-3">
             Remisyon ≤{thresholds.remission} · Düşük ≤{thresholds.low} · Orta ≤{thresholds.moderate} · Yüksek &gt;{thresholds.moderate}
           </p>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-slate-900/5 p-6 rounded-[2rem] border border-slate-200 space-y-4">
          <ToolShare params={shareParams} />
          <p className="text-[9px] text-blue-900/80 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic">
            ⚠️ DAS28, 28 eklemli hassas/şiş eklem sayısı, akut faz reaktanı (ESR/CRP) ve hastanın genel değerlendirmesini birleştirir. Tedaviye yanıt takibinde (T2T stratejisi) seri ölçüm önerilir.
          </p>
        </div>

      </div>
    </div>
  );
}
