"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Lipid emülsiyon (%20) — lokal anestezik sistemik toksisitesi (LAST).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BİRİM TUZAĞI: PROTOKOL DAKİKA BAŞINA YAZILI, POMPA SAAT BAŞINA KURULUYOR.
 *
 * İdame 0.25 mL/kg/DAKİKA. Bu sayı doğrudan pompaya yazılırsa hasta 60 KAT
 * eksik alır. Araç bu yüzden ikisini de basıyor ve hangisinin pompaya
 * gireceğini açıkça söylüyor. Aynı sınıf sedasyon aracında da var
 * (remifentanil tek dakika tabanlı ajan).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ÜÇ SAYI KARIŞTIRILMAMALI:
 *   bolus            1.5 mL/kg, 1 dakikada
 *   idame            0.25 mL/kg/dk
 *   KÜMÜLATİF TAVAN  ~12 mL/kg — bolus ve idame TOPLAMI için
 *
 * Tavan toplam üzerinden işliyor; yalnızca idameye bakan bir hesap tavanı
 * geç fark eder.
 *
 * PROPOFOL LİPİD EMÜLSİYONU DEĞİLDİR — daha doğrusu lipid içeriği çok düşük
 * ve kendisi miyokard baskılayıcı. LAST'te propofolü "elimizde lipid var"
 * diye kullanmak zarar verir. Bu, ekranda yazılı olması gereken bir ayrım.
 */

/** %20 lipid emülsiyon protokol katsayıları. */
const BOLUS_ML_KG = 1.5;
const IDAME_ML_KG_DK = 0.25;
/** Bolus + idame TOPLAMI bu değeri aşmaz. */
const KUMULATIF_TAVAN_ML_KG = 12;

/**
 * DOZLAMA AĞIRLIĞI TAVANLI. Birçok protokol 70 kg üzerini 70 kg gibi
 * dozluyor; tavansız hesap ağır hastada gereksiz yüksek hacim üretir.
 */
const DOZ_AGIRLIK_TAVANI = 70;

/* Makullük sınırı — klinik sınır değil. Bunun dışında sayı BASILMAZ. */
const KILO_ALT = 10, KILO_UST = 300;

const yuvarla = (n: number, b = 1) => Math.round(n * 10 ** b) / 10 ** b;

/**
 * MODÜL DÜZEYİNDE — sayfa içinde tanımlanırsa React her render'da kontrolü
 * söküp yeniden takar ve odak kaybolur (CI kapısı: ic-bilesen-denetim).
 */
function SayiAlani({
  id, etiket, birim, deger, ayarla, ipucu,
}: {
  id: string; etiket: string; birim: string; deger: string;
  ayarla: (v: string) => void; ipucu?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">
        {etiket}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-describedby={birim ? `${id}-birim` : undefined}
          type="text"
          inputMode="decimal"
          value={deger}
          onChange={(e) => ayarla(e.target.value)}
          placeholder={ipucu}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-20 text-xl font-black text-blue-900 focus:border-blue-900 outline-none"
        />
        <span id={`${id}-birim`} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">{birim}</span>
      </div>
    </div>
  );
}

function Kutu({ etiket, deger, alt, vurgu }: { etiket: string; deger: string; alt?: string; vurgu?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 border ${vurgu ? "bg-amber-500 border-amber-600" : "bg-blue-950/50 border-blue-800"}`}>
      <span className={`text-[9px] font-black uppercase tracking-widest block ${vurgu ? "text-slate-900" : "text-blue-300"}`}>
        {etiket}
      </span>
      <div className={`mt-1 text-3xl font-black ${vurgu ? "text-slate-900" : "text-white"}`}>{deger}</div>
      {alt && <p className={`mt-1 text-[10px] ${vurgu ? "text-slate-900" : "text-blue-300"}`}>{alt}</p>}
    </div>
  );
}

export default function LipidEmulsiyonSayfasi() {
  const [kilo, setKilo] = React.useState("");

  const kiloNum = parseLocaleNumber(kilo);
  const kiloTamam = sayiGirildiMi(kilo) && kiloNum >= KILO_ALT && kiloNum <= KILO_UST;

  const dozKilo = kiloTamam ? Math.min(kiloNum, DOZ_AGIRLIK_TAVANI) : null;
  const tavanUygulandi = kiloTamam && kiloNum > DOZ_AGIRLIK_TAVANI;

  const bolusMl = dozKilo !== null ? dozKilo * BOLUS_ML_KG : null;
  const idameMlDk = dozKilo !== null ? dozKilo * IDAME_ML_KG_DK : null;
  const idameMlSaat = idameMlDk !== null ? idameMlDk * 60 : null;
  const kumulatifMl = dozKilo !== null ? dozKilo * KUMULATIF_TAVAN_ML_KG : null;
  /** Bolus verildikten sonra tavanı doldurmaya kaç dakika kalıyor. */
  const kalanDakika =
    kumulatifMl !== null && bolusMl !== null && idameMlDk
      ? (kumulatifMl - bolusMl) / idameMlDk
      : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="lipid-emulsiyon" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🧴</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Lipid Emülsiyon (LAST)
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              %20 emülsiyon · bolus, idame ve kümülatif tavan
            </p>
          </div>
        </div>

        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">🛑</span>
          <div className="text-[12px] leading-relaxed text-rose-900 space-y-2">
            <p>
              <strong>İdame hızı DAKİKA başına yazılıdır, pompa SAAT başına
              kurulur.</strong> {IDAME_ML_KG_DK} mL/kg/dk sayısını doğrudan
              pompaya yazmak hastaya <strong>60 kat eksik</strong> vermek
              demektir. Aşağıda ikisi de basılıyor; pompaya gireceğin sayı
              işaretli.
            </p>
            <p>
              <strong>Propofol lipid emülsiyon yerine geçmez.</strong> Lipid
              içeriği çok düşük ve kendisi miyokard baskılayıcı — LAST&apos;te
              &ldquo;elimizde lipid var&rdquo; diye propofol vermek zarar verir.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <SayiAlani id="lip-kilo" etiket="Hasta ağırlığı" birim="kg" deger={kilo} ayarla={setKilo} ipucu="ör. 70" />
          {tavanUygulandi && (
            <p className="text-[11px] leading-relaxed text-slate-700 mt-3" role="status">
              <strong>Dozlama ağırlığı {DOZ_AGIRLIK_TAVANI} kg ile sınırlandı.</strong>{" "}
              Girilen {kiloNum} kg; protokoller bu eşiğin üzerini genellikle{" "}
              {DOZ_AGIRLIK_TAVANI} kg gibi dozluyor. Sayı sessizce kırpılmadı —
              hesabın hangi ağırlıkla yapıldığı burada yazıyor.
            </p>
          )}
        </div>

        {kiloTamam && bolusMl !== null && idameMlDk !== null ? (
          <>
            <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
              <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
                %20 lipid emülsiyon — {dozKilo} kg üzerinden
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Kutu etiket="Bolus" deger={`${yuvarla(bolusMl)} mL`} alt={`${BOLUS_ML_KG} mL/kg · 1 dakikada`} />
                <Kutu etiket="İdame — protokol" deger={`${yuvarla(idameMlDk, 2)} mL/dk`} alt={`${IDAME_ML_KG_DK} mL/kg/dk`} />
                <Kutu
                  etiket="İdame — POMPAYA"
                  deger={`${yuvarla(idameMlSaat!)} mL/saat`}
                  alt="pompaya girilecek sayı budur"
                  vurgu
                />
              </div>
              <p className="text-[11px] leading-relaxed text-blue-200">
                Yanıt alınamazsa bolus tekrarlanabilir ve idame hızı iki katına
                çıkarılabilir; her ikisi de kümülatif tavanın içinde kalmalı.
              </p>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-blue-900 uppercase tracking-widest font-sans mt-0">
                Kümülatif tavan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Toplam tavan</span>
                  <div className="mt-1 text-2xl font-black text-blue-900">{yuvarla(kumulatifMl!)} mL</div>
                  <p className="mt-1 text-[10px] text-slate-700">{KUMULATIF_TAVAN_ML_KG} mL/kg</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Bolus sonrası kalan</span>
                  <div className="mt-1 text-2xl font-black text-blue-900">{yuvarla(kumulatifMl! - bolusMl)} mL</div>
                  <p className="mt-1 text-[10px] text-slate-700">tavandan bolus düşülmüş</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Bu hızla süre</span>
                  <div className="mt-1 text-2xl font-black text-blue-900">
                    {kalanDakika !== null ? `${yuvarla(kalanDakika, 0)} dk` : "–"}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-700">tavana ulaşana kadar</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                <strong>Tavan TOPLAM üzerinden işler.</strong> Yalnızca idameye
                bakan bir hesap, tekrarlanan boluslarla tavanın çoktan
                dolduğunu geç fark eder. Süre sütunu tam bu yüzden var:
                başlangıç hızıyla tavana ne kadar zamanda ulaşıldığını
                gösteriyor.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[12px] font-black text-slate-600">
              Hasta ağırlığını girin ({KILO_ALT}–{KILO_UST} kg).
            </p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Lipid, temel resüsitasyonun yerine geçmez.</strong>{" "}
            LAST&apos;te ilk iş hava yolu, oksijenizasyon ve nöbetin durdurulması;
            lipid bunlarla EŞ ZAMANLI verilir, sıraya konmaz. Kardiyak arrest
            varsa göğüs kompresyonu kesilmez — lipidin dolaşması için zaten
            kompresyon gerekiyor.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Katsayılar erişkin, yaygın protokollerdir; kendi kurumunuzun
              protokolüyle karşılaştırın. Lipid, lokal anestezik dışı
              zehirlenmelerde (lipofilik ilaçlar) da denenmiştir ama kanıt
              düzeyi farklıdır — bu araç LAST protokolünü hesaplar, o
              endikasyonları değil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
