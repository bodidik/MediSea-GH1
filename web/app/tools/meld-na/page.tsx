"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/** * MELD-Na (2016) Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function round(n: number, dp = 0) { return Math.round(n * Math.pow(10, dp)) / Math.pow(10, dp); }

export default function MeldNaPage() {
  const s = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  // Metin (string) state: kullanıcı alanı silip yeniden yazabilsin diye —
  // sayıya çevirme sadece hesaplama anında yapılır.
  const [cr, setCr] = React.useState<string>(s?.get("cr") || "1");
  const [tb, setTb] = React.useState<string>(s?.get("tb") || "1");
  const [inr, setInr] = React.useState<string>(s?.get("inr") || "1");
  const [na, setNa] = React.useState<string>(s?.get("na") || "135");

  const [onDialysis, setOnDialysis] = React.useState<boolean>(s?.get("dial") === "1");
  /**
   * KREATİNİN TAVANI SEÇENEK DEĞİL, FORMÜLÜN PARÇASI.
   *
   * Burası bir dönem `capCreat4` adlı, VARSAYILAN OLARAK KAPALI bir onay
   * kutusuydu. Yani araç normalde kreatinini kırpmıyordu ve Cr 8 girilince
   * MELD-Na **34** basıyordu; doğrusu (tavan 4.0 ile) **28**. Nakil
   * önceliğinin konuşulduğu bir skorda 6 puanlık sapma.
   *
   * UNOS tanımında Cr 4.0 mg/dL'de kırpılır ve bunun kapatılabilir bir hâli
   * yoktur — kapatılabilir bir kutu yalnızca YANLIŞ skor üretebiliyordu.
   * Kutu kaldırıldı, kırpma koşulsuz; kullanıcıya kutu yerine ne olduğunu
   * söyleyen bir satır gösteriliyor.
   *
   * Bu kusur BİR BAŞKA KUSUR TARAFINDAN GİZLENİYORDU: eski formülde `× 10`
   * eksik olduğu için Cr 4 (2.686) ile Cr 8 (3.349) İKİSİ DE 3'e yuvarlanıyor
   * ve tavan çalışıyormuş gibi görünüyordu. Ölçek düzelince fark açığa çıktı.
   */
  const CR_TAVAN = 4.0;

  const crNum = parseLocaleNumber(cr);
  const tbNum = parseLocaleNumber(tb);
  const inrNum = parseLocaleNumber(inr);
  const naNum = parseLocaleNumber(na);

  const naAdj = clamp(naNum, 125, 137);
  const crUsed = Math.min(onDialysis ? CR_TAVAN : crNum, CR_TAVAN);
  const crKirpildi = !onDialysis && crNum > CR_TAVAN;

  const crAdj = Math.max(1, crUsed);
  const tbAdj = Math.max(1, tbNum);
  const inrAdj = Math.max(1, inrNum);

  /**
   * MAKULLÜK KAPISI — kıskaçlar çöp girdiyi meşru bir skora çeviriyordu.
   *
   * `parseLocaleNumber` ayrıştıramadığı her şeyi 0'a çeviriyor; ardından
   * `Math.max(1, …)` ve sodyum kıskacı o sıfırı formülün tabanına
   * oturtuyor. Ölçüldü: alanlar BOŞALTILDIĞINDA, negatif değer ya da harf
   * girildiğinde araç çizgi değil **MELD-Na 17** basıyordu — nakil
   * listesi konuşulan aralıkta, somut bir sayı.
   *
   * Sınırlar klinik eşik değil MAKULLÜK sınırı: bu aralıkların dışındaki
   * bir değer laboratuvardan gelmiş olamaz.
   */
  const makul =
    tbNum  >= 0.1 && tbNum  <= 60 &&
    inrNum >= 0.5 && inrNum <= 25 &&
    naNum  >= 90  && naNum  <= 190 &&
    (onDialysis || (crNum >= 0.1 && crNum <= 25));

  /**
   * FORMÜL MELEZDİ VE EKSİ SKOR BASIYORDU — ölçüldü, düzeltildi.
   *
   * Eski hâli:
   *   meld   = 0.957·ln(Cr) + 0.378·ln(bili) + 1.12·ln(INR) + 0.643
   *   meldNa = meld + 1.59 · (135 − Na)
   *
   * İki ayrı kusur üst üste biniyordu:
   *
   * 1. KARACİĞER TERİMİNDE `× 10` YOK. UNOS formülü parantezin tamamını 10
   *    ile çarpar. Katsayılar doğruydu ama sonuç bir kat küçük çıkıyordu:
   *    Cr 4 · bili 2 · INR 1.5 · Na 135 için ekran **3** diyordu, doğrusu 27.
   *
   * 2. İKİ TERİM FARKLI ÖLÇEKTEYDİ. Sodyum katsayısı (1.59) TAM ölçekli
   *    MELD için yayımlanmış; onda birlik bir MELD'e eklenince skoru sodyum
   *    tek başına yönetiyordu. Üstelik kıskaç 2016 varyantından (125–137)
   *    alınmış ama referans 2008'in `135 − Na`'sı olduğu için terim EKSİYE
   *    düşebiliyordu.
   *
   * Bedeli ölçüldü: Cr 1 · bili 1 · INR 1 · Na 137 → ekranda **−3**.
   * MELD 6–40 aralığındadır; eksi bir MELD mümkün değil.
   *
   * Dosyanın başlığı zaten "MELD-Na (2016)" diyor; uygulama o ilana
   * hizalandı (etiket ile aritmetiğin çelişmemesi kuralı).
   *
   *   MELD(i) = 10 × [0.957·ln(Cr) + 0.378·ln(bili) + 1.120·ln(INR) + 0.643]
   *   MELD(i) > 11 ise:
   *     MELD-Na = MELD(i) + 1.32·(137 − Na) − 0.033 · MELD(i) · (137 − Na)
   *   Sonuç 6–40 aralığına oturtulur.
   */
  const meldI = round(10 * (0.957 * Math.log(crAdj) + 0.378 * Math.log(tbAdj) + 1.12 * Math.log(inrAdj) + 0.643), 1);
  const meldNa = meldI > 11
    ? meldI + 1.32 * (137 - naAdj) - 0.033 * meldI * (137 - naAdj)
    : meldI;
  const score = clamp(round(meldNa, 0), 6, 40);

  /* `cap` parametresi kalktı: tavan artık kapatılamıyor, yani taşınacak bir
     durum yok. Eski bir `?cap=1` bağlantısı zararsız — okunmuyor. */
  const params = { cr: crNum, tb: tbNum, inr: inrNum, na: naNum, dial: onDialysis ? 1 : "" };

  return (
    // SAKİN DENİZ: bg-slate-50 | text-blue-950
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="meld-na" />

        {/* BAŞLIK VE GÜNEŞ DETAYI */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">🫁</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">MELD-Na</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Son Evre Karaciğer Hastalığı Analizi</p>
          </div>
        </div>

        {/* PARAMETRELER: BEYAZ KARTLAR */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest pl-1">Kreatinin (mg/dL)</span>
                <input
                  type="text" inputMode="decimal" value={cr}
                  onChange={e => setCr(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none transition-all font-bold text-lg"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest pl-1">Total Bilirubin (mg/dL)</span>
                <input
                  type="text" inputMode="decimal" value={tb}
                  onChange={e => setTb(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none transition-all font-bold text-lg"
                />
              </label>
            </div>
            <div className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest pl-1">INR</span>
                <input
                  type="text" inputMode="decimal" value={inr}
                  onChange={e => setInr(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none transition-all font-bold text-lg"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest pl-1">Sodyum (mEq/L)</span>
                <input
                  type="text" inputMode="decimal" value={na}
                  onChange={e => setNa(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none transition-all font-bold text-lg"
                />
              </label>
            </div>
          </div>

          {/* OPSİYONLAR: GÜN IŞIĞI CHECKBOX */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" checked={onDialysis} 
                onChange={() => setOnDialysis(v => !v)} 
                className="w-5 h-5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
              />
              <span className="text-xs font-bold text-slate-600 group-hover:text-blue-900 transition-colors">Diyalizde (Cr=4 kabul)</span>
            </label>
            {/* Kutu DEĞİL bilgi satırı: tavan formülün parçası, kapatılamaz. */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-sm" aria-hidden="true">🔒</span>
              <span className="text-xs font-bold text-slate-600">
                Kreatinin tavanı: {CR_TAVAN.toFixed(1)} mg/dL{" "}
                {crKirpildi && (
                  <em className="not-italic text-blue-900">
                    — girilen {crNum.toFixed(1)}, formülde {CR_TAVAN.toFixed(1)} kullanıldı
                  </em>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* SONUÇ PANELİ: LACİVERT & ALTIN */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div aria-hidden="true" className="absolute top-0 right-0 p-6 opacity-10 text-white text-8xl font-black italic">⚕️</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">HESAPLANAN MELD-Na SKORU</span>
           <div className="text-7xl font-black text-white drop-shadow-lg">{makul ? score : "–"}</div>
           <div className="mt-4 text-xs font-bold text-amber-400 uppercase tracking-widest italic max-w-xs">
             {makul
               ? "Skor yükseldikçe 90 günlük mortalite riski artış gösterir."
               : "Değerleri girin — bilirubin, INR, kreatinin ve sodyum."}
           </div>
        </div>

        {/* ALT PANEL: PAYLAŞIM VE İSTİHBARAT */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Bu hesaplama eğitim ve referans amaçlıdır. Laboratuvar birimlerinizi, yerel protokolleri ve UNOS kriterlerini mutlaka doğrulayın.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}