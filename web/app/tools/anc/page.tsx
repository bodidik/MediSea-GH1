"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

export default function AncPage() {
  const [wbc, setWbc] = React.useState("4.0");
  const [segs, setSegs] = React.useState("40");
  const [bands, setBands] = React.useState("0");

  const wbcNum = parseLocaleNumber(wbc);
  const segsNum = parseLocaleNumber(segs);
  const bandsNum = parseLocaleNumber(bands);

  const anc = Math.round(wbcNum * 1000 * ((segsNum + bandsNum) / 100));

  /**
   * GEÇERSİZ GİRDİDE EVRELEME GÖSTERME — ölçülmüş ve klinik olarak riskliydi.
   *
   * `parseLocaleNumber` ayrıştıramadığı her şeyi 0'a çeviriyor; ANC 0 da
   * merdivenin son basamağına düşüyordu:
   *
   *   WBC "abc" → "EVRE 4 — ÇOK CİDDİ · Acil izolasyon ve ampirik antibiyotik"
   *   WBC 0     → aynı
   *   WBC -5    → ANC 500 + "EVRE 2 — ORTA"  (negatifler çarpılınca pozitif)
   *
   * Yani çöp girdi ACİL İZOLASYON ve ampirik antibiyotik öneriyordu.
   *
   * Sınırlar makullük sınırı: lökosit 0.1-500 ×10³/µL (lösemide 200'ü
   * aşabiliyor, üst sınır bilerek geniş), yüzdeler 0-100 ve toplamları
   * 100'ü aşamaz. Amaç tanı koymak değil, saçma girdiden evre üretmemek.
   */
  /**
   * MEŞRU SIFIR, ÇÖP GİRDİDEN AYRILMALI — ve burada ayrılmıyordu.
   *
   * Kapı bir dönem `yuzdeToplam > 0` diyordu. Amaç doğruydu: iki yüzde alanı
   * da çöp olduğunda `parseLocaleNumber` ikisini de 0'a çeviriyor ve toplam
   * 0 çıkıyor. Ama AYNI ifade AGRANÜLOSİTOZU da engelliyordu — segment %0 ve
   * band %0 gerçek bir bulgudur, ANC 0 demektir ve bu aracın bildirmesi
   * gereken EN AĞIR durumdur.
   *
   * Tarayıcıda ölçüldü (lökosit 5):
   *
   *   %0 + %2  ->  ANC 100 · "EVRE 3 — CİDDİ"        hesaplanıyordu
   *   %0 + %0  ->  "–" · "Değerleri girin"           HESAPLANMIYORDU
   *
   * Yani araç, kendi merdiveninin son basamağını üretebileceği tek girdiyi
   * reddediyordu. Ayrım DEĞERE bakılarak yapılamaz (çöp de 0, agranülositoz
   * da 0); HAM DİZEYE bakılır — `sayiGirildiMi` boş alanı ve "abc"yi eler,
   * yazılmış bir "0"ı geçirir.
   */
  const yuzdeToplam = segsNum + bandsNum;
  const girdiGecerli =
    sayiGirildiMi(wbc) && wbcNum > 0 && wbcNum <= 500 &&
    sayiGirildiMi(segs) && segsNum >= 0 && segsNum <= 100 &&
    sayiGirildiMi(bands) && bandsNum >= 0 && bandsNum <= 100 &&
    yuzdeToplam <= 100;

  const getGrade = () => {
    if (!girdiGecerli)
      return { label: "Değerleri girin", sub: "Lökosit ve yüzdeleri girince evre hesaplanır",
               color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
    if (anc >= 1500) return { label: "NORMAL", sub: "Nötropeni yok", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (anc >= 1000) return { label: "EVRE 1 — HAFİF", sub: "ANC 1000–1499/mm³", color: "text-lime-700", bg: "bg-lime-50", border: "border-lime-200" };
    if (anc >= 500)  return { label: "EVRE 2 — ORTA", sub: "ANC 500–999/mm³", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    if (anc >= 100)  return { label: "EVRE 3 — CİDDİ", sub: "ANC 100–499/mm³ · Febril nötropeni riski yüksek", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" };
    return { label: "EVRE 4 — ÇOK CİDDİ", sub: "ANC <100/mm³ · Acil izolasyon ve ampirik antibiyotik", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const g = getGrade();
  const params = { wbc: wbcNum, segs: segsNum, bands: bandsNum };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="anc" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🎗️</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">ANC Hesaplama</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Mutlak Nötrofil Sayısı & Nötropeni Evrelemesi</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Lökosit (×10³/µL)</span>
            <input type="text" inputMode="decimal" value={wbc} onChange={e => setWbc(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Segmentli Nötrofil (%)</span>
            <input type="text" inputMode="decimal" value={segs} onChange={e => setSegs(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Band (Çomak) Nötrofil (%)</span>
            <input type="text" inputMode="decimal" value={bands} onChange={e => setBands(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
          </label>
        </div>

        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
          <div aria-hidden="true" className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">ANC</div>
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">MUTLAK NÖTROFİL SAYISI</span>
          <div className="text-7xl font-black text-white drop-shadow-lg">{girdiGecerli ? anc : "–"}</div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">hücre / mm³</span>
        </div>

        <SonucDuyuru metin={g ? g.label : null} />

        <div className={`p-6 rounded-[2rem] border-2 border-dashed shadow-sm text-center ${g.bg} ${g.border}`}>
          <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest block mb-1">NÖTROPENİ EVRELEMESİ</span>
          <p className={`text-xl font-black italic tracking-tight ${g.color}`}>{g.label}</p>
          <p className={`text-sm font-bold mt-1 ${g.color}`}>{g.sub}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              ANC = Lökosit × ((Segmentli % + Band %) / 100). Ateş (≥38.3°C tek ölçüm veya ≥38°C bir saat) ile birlikte ANC &lt;500 febril nötropeni olarak kabul edilir ve acil değerlendirme gerektirir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
