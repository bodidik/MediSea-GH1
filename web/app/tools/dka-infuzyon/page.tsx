"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * Diyabetik ketoasidoz — sıvı, insülin ve potasyum kurulumu.
 *
 * ─────────────────────────────────────────────────────────────────────
 * BU ARAÇ DKA TANISI KOYMAZ ve protokolün yerini tutmaz. Tanı glukoz,
 * ketonemi/ketonüri ve metabolik asidoz üçlüsüyle konur; hiperglisemik
 * hiperosmolar durum ve öglisemik DKA ayrı yönetilir. Araç yalnızca
 * tedaviye başlanacağı bilindikten SONRAKİ aritmetiği ve sıralamayı
 * gösterir.
 *
 * ARACIN ASIL DEĞERİ TEK BİR SAYIDA DEĞİL, BİR SIRADA: potasyum 3.3
 * mEq/L'nin altındaysa insülin BEKLETİLİR. İnsülin potasyumu hücre içine
 * sokar; düşük potasyumla başlanan infüzyon aritmi ve solunum kası
 * güçsüzlüğüne yol açabilir. Bu yüzden potasyum dalı ekranda insülin
 * dozunun ÜSTÜNDE ve baskın duruyor — hesap doğru olsa bile sıra yanlışsa
 * hasta zarar görür.
 * ─────────────────────────────────────────────────────────────────────
 */

const yuvarla = (n: number, b = 0) => Math.round(n * 10 ** b) / 10 ** b;

/** Protokol sabitleri tek yerde ve okunur. */
const ILK_SAAT_ML_KG = { alt: 15, ust: 20 };      // izotonik, ilk saat
const INSULIN_BOLUS_U_KG = 0.1;
const INSULIN_INF_U_KG_SAAT = 0.1;                // bolusla birlikte
const INSULIN_INF_BOLUSSUZ = 0.14;                // bolus verilmezse
const INSULIN_DUSUK_ALT = 0.02;                   // glukoz hedefe inince
const INSULIN_DUSUK_UST = 0.05;
const K_ALT_ESIK = 3.3;
const K_UST_ESIK = 5.2;

/**
 * MODÜL DÜZEYİNDE — sayfa fonksiyonunun içinde tanımlanırsa React her
 * render'da <input>u söküp yeniden takar, kullanıcı her rakamdan sonra
 * odağı kaybeder. Bu depoda ölçülmüş ve düzeltilmiş bir kusur.
 */
function SayiAlani({
  id, etiket, birim, deger, ayarla, ipucu,
}: {
  id: string; etiket: string; birim: string;
  deger: string; ayarla: (v: string) => void; ipucu?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2"
      >
        {etiket}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={deger}
          onChange={(e) => ayarla(e.target.value)}
          placeholder={ipucu}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-20 text-xl font-black text-blue-900 focus:border-blue-900 outline-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
          {birim}
        </span>
      </div>
    </div>
  );
}

export default function DkaInfuzyonSayfasi() {
  const [kilo, setKilo] = React.useState("");
  const [potasyum, setPotasyum] = React.useState("");
  const [bolusVer, setBolusVer] = React.useState(true);

  const kiloNum = parseLocaleNumber(kilo);
  const kNum = parseLocaleNumber(potasyum);

  const kiloMakul = kilo.trim() !== "" && kiloNum >= 1 && kiloNum <= 400;
  const kMakul = potasyum.trim() !== "" && kNum >= 1 && kNum <= 10;

  /** Potasyum dalı — sıra kararı burada veriliyor. */
  const kDurumu = !kMakul
    ? null
    : kNum < K_ALT_ESIK
      ? {
          tip: "bekle" as const,
          baslik: "İNSÜLİNİ BEKLET",
          metin:
            `Potasyum ${yuvarla(kNum, 1)} mEq/L — ${K_ALT_ESIK}'ün altında. Önce potasyum ` +
            "replasmanı yapılır (olağan yaklaşım 20-30 mEq/saat) ve potasyum " +
            `${K_ALT_ESIK} mEq/L üzerine çıkana kadar insülin infüzyonu BAŞLATILMAZ. ` +
            "İnsülin potasyumu hücre içine kaydırır; düşük potasyumda başlamak " +
            "aritmi ve solunum kası güçsüzlüğü riski taşır.",
        }
      : kNum > K_UST_ESIK
        ? {
            tip: "verme" as const,
            baslik: "POTASYUM EKLEME",
            metin:
              `Potasyum ${yuvarla(kNum, 1)} mEq/L — ${K_UST_ESIK}'nin üzerinde. Sıvıya potasyum ` +
              "eklenmez; 2 saatte bir kontrol edilir ve düştükçe replasmana geçilir.",
          }
        : {
            tip: "ekle" as const,
            baslik: "SIVIYA POTASYUM EKLE",
            metin:
              `Potasyum ${yuvarla(kNum, 1)} mEq/L — ${K_ALT_ESIK}-${K_UST_ESIK} aralığında. ` +
              "Her litre sıvıya 20-30 mEq potasyum eklenir, hedef 4-5 mEq/L.",
          };

  const insulinBaslanabilir = kDurumu?.tip !== "bekle";

  const ilkSaatAlt = yuvarla(kiloNum * ILK_SAAT_ML_KG.alt, 0);
  const ilkSaatUst = yuvarla(kiloNum * ILK_SAAT_ML_KG.ust, 0);
  const bolusU = yuvarla(kiloNum * INSULIN_BOLUS_U_KG, 1);
  const infUSaat = yuvarla(kiloNum * (bolusVer ? INSULIN_INF_U_KG_SAAT : INSULIN_INF_BOLUSSUZ), 1);
  const dusukAlt = yuvarla(kiloNum * INSULIN_DUSUK_ALT, 1);
  const dusukUst = yuvarla(kiloNum * INSULIN_DUSUK_UST, 1);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="dka-infuzyon" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🩸</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                DKA Kurulumu
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
              Sıvı · insülin · potasyum sıralaması
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg" aria-hidden="true">⚠️</span>
          <p className="text-[12px] leading-relaxed text-amber-900">
            <strong>Bu araç tanı koymaz ve protokolün yerini tutmaz.</strong> Yalnızca
            tedaviye başlanacağı bilindikten sonraki doz aritmetiğini ve
            başlama sırasını gösterir.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SayiAlani id="dka-kilo" etiket="Hasta ağırlığı" birim="kg"
              deger={kilo} ayarla={setKilo} ipucu="ör. 70" />
            <SayiAlani id="dka-potasyum" etiket="Serum potasyum" birim="mEq/L"
              deger={potasyum} ayarla={setPotasyum} ipucu="ör. 4.2" />
          </div>

          <label className="flex items-start gap-3 cursor-pointer rounded-xl p-2 -m-2 focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2">
            <input
              type="checkbox"
              className="sr-only"
              checked={bolusVer}
              onChange={() => setBolusVer((v) => !v)}
            />
            <span
              aria-hidden="true"
              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${bolusVer ? "bg-blue-900 border-blue-900" : "border-slate-300 bg-white"}`}
            >
              {bolusVer && (
                <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white"><path d="M1 4l3 3 5-6" /></svg>
              )}
            </span>
            <span className="text-sm font-bold text-blue-900 leading-snug">
              İnsülin bolusu verilecek
              <span className="block text-[11px] font-medium text-slate-500 mt-0.5">
                Bolus verilmezse infüzyon {INSULIN_INF_BOLUSSUZ} Ü/kg/saat olarak kurulur.
              </span>
            </span>
          </label>
        </div>

        {/* POTASYUM — SIRA KARARI, insülinin ÜSTÜNDE duruyor */}
        {kDurumu && (
          <div
            role="status"
            className={`rounded-[2rem] p-6 border-2 shadow-sm
              ${kDurumu.tip === "bekle"
                ? "bg-rose-50 border-rose-300"
                : kDurumu.tip === "verme"
                  ? "bg-amber-50 border-amber-300"
                  : "bg-emerald-50 border-emerald-300"}`}
          >
            <span
              className={`text-[11px] font-black uppercase tracking-[0.2em] block
                ${kDurumu.tip === "bekle" ? "text-rose-700"
                  : kDurumu.tip === "verme" ? "text-amber-800" : "text-emerald-800"}`}
            >
              {kDurumu.baslik}
            </span>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-700">{kDurumu.metin}</p>
          </div>
        )}

        {/* SONUÇ */}
        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-3">
          {!kiloMakul ? (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              Hasta ağırlığını girin (1–400 kg). Potasyum sırayı belirlediği için
              onu da girin.
            </p>
          ) : (
            <>
              <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                <span className="text-[11px] font-black text-blue-200 uppercase tracking-widest block">
                  1 · Sıvı — ilk saat
                </span>
                <div className="mt-2 text-3xl font-black text-white">
                  {ilkSaatAlt}–{ilkSaatUst} mL
                </div>
                <p className="mt-1 text-[11px] text-blue-200">
                  {ILK_SAAT_ML_KG.alt}–{ILK_SAAT_ML_KG.ust} mL/kg izotonik (%0.9 NaCl).
                  Sonraki saatlerde hız ve sıvı seçimi düzeltilmiş sodyuma ve
                  hidrasyon durumuna göre ayarlanır.
                </p>
              </div>

              <div
                className={`rounded-2xl p-4 border ${
                  insulinBaslanabilir
                    ? "bg-blue-950/50 border-blue-800"
                    : "bg-rose-950/40 border-rose-700"
                }`}
              >
                <span className="text-[11px] font-black text-blue-200 uppercase tracking-widest block">
                  2 · İnsülin (regüler, IV)
                </span>

                {!insulinBaslanabilir ? (
                  <p className="mt-2 text-[12px] font-bold leading-relaxed text-rose-200">
                    Potasyum {K_ALT_ESIK} mEq/L üzerine çıkana kadar başlatılmaz.
                    Hesaplanan dozlar hazır olsun diye aşağıda; uygulama için
                    potasyumun düzelmesi beklenir.
                  </p>
                ) : null}

                <div
                  className={`mt-3 space-y-2 ${
                    insulinBaslanabilir ? "" : "border-l-2 border-dashed border-blue-400 pl-3"
                  }`}
                >
                  {bolusVer && (
                    <p className="text-[12px] text-blue-100">
                      Bolus: <strong className="text-white text-lg">{bolusU} Ü</strong>
                      <span className="text-blue-300"> ({INSULIN_BOLUS_U_KG} Ü/kg)</span>
                    </p>
                  )}
                  <p className="text-[12px] text-blue-100">
                    İnfüzyon: <strong className="text-white text-lg">{infUSaat} Ü/saat</strong>
                    <span className="text-blue-300">
                      {" "}({bolusVer ? INSULIN_INF_U_KG_SAAT : INSULIN_INF_BOLUSSUZ} Ü/kg/saat)
                    </span>
                  </p>
                  <p className="text-[11px] text-blue-200 leading-relaxed">
                    Glukoz hedef aralığa indiğinde infüzyon{" "}
                    <strong className="text-white">{dusukAlt}–{dusukUst} Ü/saat</strong>{" "}
                    ({INSULIN_DUSUK_ALT}–{INSULIN_DUSUK_UST} Ü/kg/saat) düzeyine
                    indirilir ve sıvıya dekstroz eklenir. Ketoasidoz düzelene
                    kadar insülin kesilmez.
                  </p>
                </div>
              </div>

              <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                <span className="text-[11px] font-black text-blue-200 uppercase tracking-widest block">
                  3 · Potasyum
                </span>
                <p className="mt-2 text-[11px] leading-relaxed text-blue-200">
                  {kMakul
                    ? kDurumu?.metin
                    : "Serum potasyumunu girin — bu değer insülinin başlatılıp başlatılmayacağını belirler."}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-blue-900">Bikarbonat:</strong> DKA'da rutin
            önerilmez; çok ağır asidozda (pH &lt; 6.9) tartışmalı bir seçenektir.
            <strong className="text-blue-900"> İzlem:</strong> ilk saatlerde
            saatlik glukoz, 2-4 saatte bir elektrolit ve kan gazı; anyon açığı
            kapanana kadar tedavi sürer.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Hesaplanan değerleri kurumunuzun DKA protokolüyle karşılaştırın.
              Çocuk hastada sıvı ve insülin yaklaşımı farklıdır; beyin ödemi
              riski nedeniyle pediatrik protokol ayrı uygulanır.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
