"use client";

import React, { useState } from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * Birim Çevirici — geleneksel ↔ SI laboratuvar birimleri.
 *
 * ─────────────────────────────────────────────────────────────────────
 * BU SAYFA CANLIDA TAMAMEN BOZUKTU. Ölçüldü: her analitte, ilk açılış
 * dahil, SI kutusunda **NaN** yazıyordu.
 *
 * Sebep: ortak yardımcı `mgdlToMmol(mgdl, factor = 18)` ikinci parametre
 * olarak SAYI bekliyor, sayfa ise ona `selectedUnit` yani `"glucose"` gibi
 * bir DİZE geçiriyordu — `100 / "glucose"` = NaN. Kusuru tip denetimi
 * yakalayabilirdi ama dosyanın başında "bütün dosyayı kurtaran zırh" diye
 * eklenmiş `as any` dökümleri vardı ve denetimi tam da bu noktada
 * susturuyordu. Ayrıca hiçbir yerde kullanılmayan, her erişimde 1 döndüren
 * sahte bir `factor` Proxy'si duruyordu.
 *
 * Bu yüzden çeviri artık ortak yardımcıyı KULLANMIYOR: her analit kendi
 * ileri/geri dönüşümünü taşıyor. Böylece hem imza karışıklığı ortadan
 * kalkıyor hem de HbA1c gibi çarpan olmayan (doğrusal) dönüşümler
 * ifade edilebiliyor.
 *
 * İKİNCİ KUSUR — SI birimi her analit için "mmol/L" yazıyordu. Kreatinin,
 * bilirubin, ürik asit ve demir SI'da **µmol/L** ile raporlanır; albümin
 * ve hemoglobin **g/L**; HbA1c **mmol/mol**. Kreatininde bu, 1000 kat
 * yanlış bir etiket demekti.
 * ─────────────────────────────────────────────────────────────────────
 */

type Analit = {
  key: string;
  ad: string;
  ikon: string;
  gelenekselBirim: string;
  siBirim: string;
  /** geleneksel → SI */
  ileri: (x: number) => number;
  /** SI → geleneksel */
  geri: (y: number) => number;
  /** makullük sınırı (geleneksel birimde) — klinik eşik DEĞİL */
  alt: number;
  ust: number;
  /** katsayının kaynağı; ekranda gösteriliyor */
  not: string;
  /**
   * mEq/L ile mmol/L ilişkisi — yalnızca iyonlarda anlamlı.
   *
   * Türk laboratuvarları sodyum ve potasyumu çoğu zaman mEq/L ile
   * raporluyor; tek değerlikli iyonlarda mEq/L SAYICA mmol/L'ye eşittir,
   * iki değerliklilerde (kalsiyum, magnezyum) mEq/L mmol/L'nin İKİ
   * KATIDIR. Bu, klinikte sık yapılan bir karıştırma; çevirici zaten
   * birim gösterdiği için doğru yer burası.
   */
  esdegerlik?: string;
};

/** Ondalık gürültüsünü temizler: 5.550000000000001 → 5.55 */
const yuvarla = (n: number, basamak: number) =>
  Math.round(n * 10 ** basamak) / 10 ** basamak;

/** Çarpan tabanlı analit üreteci (çoğu dönüşüm böyle). */
function carpanlaAnalit(
  key: string, ad: string, ikon: string,
  gelenekselBirim: string, siBirim: string,
  k: number, alt: number, ust: number, not: string,
  basamakSI = 2, basamakGel = 2, esdegerlik?: string,
): Analit {
  return {
    key, ad, ikon, gelenekselBirim, siBirim, alt, ust, not, esdegerlik,
    ileri: (x) => yuvarla(x * k, basamakSI),
    geri: (y) => yuvarla(y / k, basamakGel),
  };
}

/**
 * Katsayılar standart laboratuvar dönüşüm sabitleridir; her biri yorumda
 * açıkça yazılı ki gözden geçirilebilsin.
 */
const ANALITLER: Analit[] = [
  carpanlaAnalit("glukoz", "Glukoz", "🍬", "mg/dL", "mmol/L",
    1 / 18.0182, 5, 2000, "mg/dL ÷ 18.02"),
  carpanlaAnalit("bun", "BUN (üre azotu)", "🧪", "mg/dL", "mmol/L",
    1 / 2.8, 1, 300, "mg/dL ÷ 2.8 (üre olarak)"),
  carpanlaAnalit("kreatinin", "Kreatinin", "🧬", "mg/dL", "µmol/L",
    88.4, 0.1, 25, "mg/dL × 88.4", 1, 2),
  carpanlaAnalit("kalsiyum", "Kalsiyum", "🥛", "mg/dL", "mmol/L",
    1 / 4.008, 1, 25, "mg/dL ÷ 4.008", 2, 2,
    "İki değerlikli: mEq/L = mmol/L × 2"),
  // ── Elektrolitler ───────────────────────────────────────────────────
  // Katsayılar iyonun atom/molekül ağırlığından gelir:
  //   mmol/L = (mg/dL × 10) ÷ ağırlık
  // Na 22.99 · K 39.10 · Cl 35.45 · HCO₃ 61.02
  carpanlaAnalit("sodyum", "Sodyum", "🧂", "mg/dL", "mmol/L",
    10 / 22.99, 50, 900, "mg/dL × 10 ÷ 22.99", 1, 1,
    "Tek değerlikli: mEq/L = mmol/L (aynı sayı)"),
  carpanlaAnalit("potasyum", "Potasyum", "🍌", "mg/dL", "mmol/L",
    10 / 39.10, 2, 120, "mg/dL × 10 ÷ 39.10", 2, 2,
    "Tek değerlikli: mEq/L = mmol/L (aynı sayı)"),
  carpanlaAnalit("klor", "Klor", "🌊", "mg/dL", "mmol/L",
    10 / 35.45, 50, 900, "mg/dL × 10 ÷ 35.45", 1, 1,
    "Tek değerlikli: mEq/L = mmol/L (aynı sayı)"),
  carpanlaAnalit("bikarbonat", "Bikarbonat (HCO₃)", "🫧", "mg/dL", "mmol/L",
    10 / 61.02, 5, 400, "mg/dL × 10 ÷ 61.02", 1, 1,
    "Tek değerlikli: mEq/L = mmol/L (aynı sayı)"),
  carpanlaAnalit("laktat", "Laktat", "🏃", "mg/dL", "mmol/L",
    1 / 9.01, 1, 300, "mg/dL ÷ 9.01", 2, 2),
  carpanlaAnalit("amonyak", "Amonyak", "☁️", "µg/dL", "µmol/L",
    0.5872, 5, 2000, "µg/dL × 0.5872", 1, 1),
  carpanlaAnalit("fosfor", "Fosfor", "🦴", "mg/dL", "mmol/L",
    1 / 3.097, 0.3, 20, "mg/dL ÷ 3.10"),
  carpanlaAnalit("magnezyum", "Magnezyum", "⚡", "mg/dL", "mmol/L",
    1 / 2.431, 0.2, 15, "mg/dL ÷ 2.43", 2, 2,
    "İki değerlikli: mEq/L = mmol/L × 2"),
  carpanlaAnalit("kolesterol", "Kolesterol (T/LDL/HDL)", "🫀", "mg/dL", "mmol/L",
    1 / 38.67, 5, 900, "mg/dL ÷ 38.67"),
  carpanlaAnalit("trigliserid", "Trigliserid", "🧈", "mg/dL", "mmol/L",
    1 / 88.57, 5, 5000, "mg/dL ÷ 88.57"),
  carpanlaAnalit("bilirubin", "Bilirubin", "🟡", "mg/dL", "µmol/L",
    17.104, 0.1, 60, "mg/dL × 17.10", 1, 2),
  carpanlaAnalit("urikasit", "Ürik asit", "💎", "mg/dL", "µmol/L",
    59.48, 0.5, 30, "mg/dL × 59.48", 0, 2),
  carpanlaAnalit("demir", "Demir", "🧲", "µg/dL", "µmol/L",
    0.179, 1, 1000, "µg/dL × 0.179", 1, 1),
  carpanlaAnalit("albumin", "Albümin", "🥚", "g/dL", "g/L",
    10, 0.5, 8, "g/dL × 10", 0, 2),
  carpanlaAnalit("hemoglobin", "Hemoglobin", "🩸", "g/dL", "g/L",
    10, 1, 25, "g/dL × 10", 0, 1),
  {
    // HbA1c ÇARPAN DEĞİL doğrusal bir dönüşüm; ortak yardımcı bunu
    // ifade edemiyordu, kendi fonksiyonlarıyla duruyor.
    key: "hba1c", ad: "HbA1c", ikon: "📉",
    gelenekselBirim: "% (NGSP)", siBirim: "mmol/mol (IFCC)",
    alt: 2, ust: 20, not: "(% − 2.15) × 10.929",
    ileri: (x) => yuvarla((x - 2.15) * 10.929, 0),
    geri: (y) => yuvarla(y / 10.929 + 2.15, 1),
  },
];

export default function BirimCeviriciSayfasi() {
  const [secili, setSecili] = useState<string>("glukoz");
  const [gelenekselHam, setGelenekselHam] = useState<string>("100");
  /** Hangi kutuya yazıldıysa o kaynaktır; öteki ondan türetilir. */
  const [kaynak, setKaynak] = useState<"geleneksel" | "si">("geleneksel");
  /**
   * Ortadaki çift yönlü ok bir dönem SÜSLEMEYDİ: tıklanabilir görünüyor ama
   * hiçbir şey yapmıyordu. Kullanıcı bildirdi. Artık panelleri yer
   * değiştiriyor — SI ile düşünen biri SI kutusunu sola alabiliyor.
   *
   * DEĞERLERİ değil YERLERİ takas ediyor: değer takası yanlış sayı üretirdi
   * (140 mmol/L'yi mg/dL kutusuna koymak gibi).
   */
  const [ters, setTers] = useState(false);
  const [siHam, setSiHam] = useState<string>("");

  const analit = ANALITLER.find((a) => a.key === secili) ?? ANALITLER[0];

  /**
   * Tek yönlü türetme: iki kutuyu birbirine yazan iki ayrı efekt yerine,
   * yalnızca KAYNAK olan kutu durumda tutuluyor. Böylece ondalık yazarken
   * ("5." gibi ara hâllerde) kutular birbirini ezmiyor.
   */
  const gelenekselSayi = parseLocaleNumber(gelenekselHam);
  const siSayi = parseLocaleNumber(siHam);

  const gelenekselMakul =
    gelenekselHam.trim() !== "" &&
    gelenekselSayi >= analit.alt &&
    gelenekselSayi <= analit.ust;

  const siMakulKaynak =
    siHam.trim() !== "" &&
    (() => {
      const g = analit.geri(siSayi);
      return g >= analit.alt && g <= analit.ust;
    })();

  const gelenekselGosterim =
    kaynak === "geleneksel" ? gelenekselHam : siMakulKaynak ? String(analit.geri(siSayi)) : "";
  const siGosterim =
    kaynak === "si" ? siHam : gelenekselMakul ? String(analit.ileri(gelenekselSayi)) : "";

  const gecerli = kaynak === "geleneksel" ? gelenekselMakul : siMakulKaynak;

  const analitDegistir = (key: string) => {
    setSecili(key);
    // Analit değişince ÖTEKİ kutu yeniden türetilsin; kaynak kutu korunur.
    setKaynak((k) => k);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        <ToolTopNav toolSlug="unit-converter" />

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🔄</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Birim Çevirici
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
              Laboratuvar Birim Dönüştürme Paneli · {ANALITLER.length} analit
            </p>
          </div>
        </div>

        {/* ANALİT SEÇİMİ */}
        <div className="flex flex-wrap gap-2">
          {ANALITLER.map((a) => (
            <button
              key={a.key}
              type="button"
              aria-pressed={secili === a.key}
              onClick={() => analitDegistir(a.key)}
              className={`px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2
                ${secili === a.key
                  ? "bg-blue-900 border-blue-900 text-white shadow-lg shadow-blue-900/20"
                  : "bg-white border-slate-200 text-slate-500 hover:border-blue-900/30 hover:text-blue-900"}
              `}
            >
              <span className="mr-2" aria-hidden="true">{a.ikon}</span>{a.ad}
            </button>
          ))}
        </div>

        {/* ÇEVİRİ PANELİ */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-6 items-center relative z-10">

            {/* Geleneksel taraf */}
            <div className={`space-y-3 ${ters ? "order-3" : "order-1"}`}>
              <label
                htmlFor="birim-geleneksel"
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block"
              >
                Geleneksel birim
              </label>
              <div className="relative">
                <input
                  id="birim-geleneksel"
                  type="text"
                  inputMode="decimal"
                  value={gelenekselGosterim}
                  onChange={(e) => { setKaynak("geleneksel"); setGelenekselHam(e.target.value); }}
                  className="w-full bg-slate-50 border-b-4 border-blue-900/10 text-4xl md:text-5xl font-black text-blue-900 p-4 pr-24 focus:border-amber-400 outline-none transition-all rounded-t-2xl"
                />
                <span className="absolute right-4 bottom-5 text-xs font-black text-blue-900/80 uppercase">
                  {analit.gelenekselBirim}
                </span>
              </div>
            </div>

            {/* Yön oku — panelleri yer değiştirir */}
            <div className="flex items-center justify-center order-2">
              <button
                type="button"
                onClick={() => setTers((t) => !t)}
                aria-label="Birimlerin yerini değiştir"
                title="Birimlerin yerini değiştir"
                className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-blue-900 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7h12M8 7l4-4M8 7l4 4M16 17H4m12 0-4-4m4 4-4 4" /></svg>
              </button>
            </div>

            {/* SI taraf */}
            <div className={`space-y-3 ${ters ? "order-1" : "order-3"}`}>
              <label
                htmlFor="birim-si"
                className="text-[10px] font-black text-blue-900/80 uppercase tracking-[0.2em] block md:text-right"
              >
                SI birimi
              </label>
              <div className="relative">
                <input
                  id="birim-si"
                  type="text"
                  inputMode="decimal"
                  value={siGosterim}
                  onChange={(e) => { setKaynak("si"); setSiHam(e.target.value); }}
                  className="w-full bg-blue-900 border-b-4 border-amber-400 text-4xl md:text-5xl font-black text-white p-4 pl-24 focus:border-white outline-none transition-all rounded-t-2xl shadow-xl md:text-right"
                />
                <span className="absolute left-4 bottom-5 text-xs font-black text-blue-200 uppercase">
                  {analit.siBirim}
                </span>
              </div>
            </div>
          </div>

          {/* Durum satırı: makul değilse SESSİZ KALMAZ */}
          <p
            className={`mt-6 text-[11px] font-bold tracking-wide ${gecerli ? "text-slate-500" : "text-amber-700"}`}
            role="status"
          >
            {gecerli
              ? `${analit.ad}: ${analit.not}`
              : `Değer girin — ${analit.ad} için beklenen aralık ${analit.alt}–${analit.ust} ${analit.gelenekselBirim}.`}
          </p>

          {/* mEq/L uyarısı yalnızca iyonlarda basılıyor; ötekilerde anlamsız. */}
          {analit.esdegerlik && (
            <p className="mt-2 text-[11px] font-bold text-blue-900/70">
              {analit.esdegerlik}
            </p>
          )}
        </div>

        {/* ALT BİLGİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3 opacity-70">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Dönüşüm katsayıları standart laboratuvar sabitleridir ve her analitin
              yanında yazılıdır. Bazı analitler laboratuvardan laboratuvara farklı
              birimle raporlanabilir; sonucu kendi raporunuzun birimiyle karşılaştırın.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
