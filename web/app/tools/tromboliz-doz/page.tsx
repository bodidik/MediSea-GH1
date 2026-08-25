"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * Alteplaz (rt-PA) doz hesaplayıcı — endikasyona göre.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ARACIN VARLIK SEBEBİ: AYNI İLAÇ, ENDİKASYONA GÖRE TÜMDEN FARKLI REJİM.
 *
 *   akut iskemik inme : 0.9 mg/kg · TAVAN 90 mg · %10 bolus + kalanı 60 dk
 *   masif pulmoner emboli : 100 mg SABİT · 2 saat (kiloya göre DEĞİL)
 *
 * "Alteplaz 100 mg" inmede ölümcül bir aşırı doz, "0.9 mg/kg" ise masif
 * embolide eksik doz olur. Araç önce endikasyonu sorar, dozu ondan sonra
 * hesaplar.
 *
 * İKİNCİ RİSK — TAVAN. İnmede 100 kilonun üstündeki her hastada hesap 90 mg'ı
 * aşıyor ve tavan uygulanmazsa doz sessizce yükseliyor. Tavan uygulandığında
 * ekran kiloya göre kaç çıktığını ve tavanın ne olduğunu BİRLİKTE yazıyor;
 * sessizce kırpmak hesabı doğrulamayı imkânsız kılardı (heparin nomogramıyla
 * aynı karar).
 *
 * ARAÇ ENDİKASYON YA DA KONTRENDİKASYON KARARI VERMEZ. Tromboliz kararı
 * görüntüleme, zaman penceresi, kanama riski ve kılavuzla verilir; burada
 * yalnızca ARİTMETİK var. Bu, ekranda da yazılı.
 * ─────────────────────────────────────────────────────────────────────────
 */

type Rejim = {
  slug: string;
  ad: string;
  ozet: string;
  /** Kiloya göre mi dozlanıyor? */
  kiloyaGore: boolean;
  mgKg?: number;
  tavanMg?: number;
  sabitMg?: number;
  /** Toplamın yüzde kaçı bolus olarak veriliyor (0 = bolus yok). */
  bolusYuzde: number;
  bolusDakika: number;
  infuzyonDakika: number;
  aciklama: string;
  uyari: string;
};

const REJIMLER: Rejim[] = [
  {
    slug: "inme",
    ad: "Akut iskemik inme",
    ozet: "0.9 mg/kg · tavan 90 mg",
    kiloyaGore: true,
    mgKg: 0.9,
    tavanMg: 90,
    bolusYuzde: 10,
    bolusDakika: 1,
    infuzyonDakika: 60,
    aciklama:
      "Toplam dozun %10'u 1 dakikada bolus, kalan %90'ı 60 dakikada infüzyon. Bolus ile infüzyon arasında gecikme olmamalı.",
    uyari:
      "Zaman penceresi, görüntüleme bulguları ve kanama ölçütleri bu araçta DEĞERLENDİRİLMEZ. İnfüzyon sırasında ve sonrasında sık nörolojik muayene ve kan basıncı izlemi gerekir; ani nörolojik kötüleşmede infüzyon durdurulup görüntüleme tekrarlanır.",
  },
  {
    slug: "pe",
    ad: "Masif pulmoner emboli",
    ozet: "100 mg sabit · 2 saat",
    kiloyaGore: false,
    sabitMg: 100,
    bolusYuzde: 0,
    bolusDakika: 0,
    infuzyonDakika: 120,
    aciklama:
      "Doz KİLOYA GÖRE DEĞİL: 100 mg, 2 saatte infüzyon. Kardiyak arrest sırasında bazı protokoller 50 mg bolus kullanır; o ayrı bir karardır ve burada hesaplanmaz.",
    uyari:
      "Yalnızca hemodinamik olarak anlamlı (masif) emboli için geçerlidir. Submasif embolide tromboliz kararı tartışmalıdır ve bu araç o kararı vermez.",
  },
];

/** 50 mg'lık flakon yaygın sunum; kaç flakon gerektiği ekranda yazılıyor. */
const FLAKON_MG = 50;

const yuvarla = (n: number, b = 1) => Math.round(n * 10 ** b) / 10 ** b;

/**
 * MODÜL DÜZEYİNDE — sayfa içinde tanımlanırsa React her render'da kontrolü
 * söküp yeniden takar ve odak kaybolur (bu depoda 19 araçta ölçülmüş kusur).
 */
function SayiAlani({
  id,
  etiket,
  birim,
  deger,
  ayarla,
  ipucu,
  pasif,
}: {
  id: string;
  etiket: string;
  birim: string;
  deger: string;
  ayarla: (v: string) => void;
  ipucu?: string;
  pasif?: boolean;
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
          disabled={pasif}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-16 text-xl font-black text-blue-900 focus:border-blue-900 outline-none disabled:bg-slate-100"
        />
        <span id={`${id}-birim`} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">{birim}</span>
      </div>
    </div>
  );
}

function Kutu({ etiket, deger, alt }: { etiket: string; deger: string; alt?: string }) {
  return (
    <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
      <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">{etiket}</span>
      <div className="mt-1 text-3xl font-black text-white">{deger}</div>
      {alt && <p className="mt-1 text-[10px] text-blue-300">{alt}</p>}
    </div>
  );
}

export default function TrombolizDozSayfasi() {
  const [rejimSlug, setRejimSlug] = React.useState(REJIMLER[0].slug);
  const [kilo, setKilo] = React.useState("");

  const r = REJIMLER.find((x) => x.slug === rejimSlug)!;
  const kiloNum = parseLocaleNumber(kilo);
  const kiloMakul = kilo.trim() !== "" && kiloNum >= 20 && kiloNum <= 300;
  const hazir = r.kiloyaGore ? kiloMakul : true;

  const hamToplam = r.kiloyaGore ? (hazir ? kiloNum * r.mgKg! : 0) : r.sabitMg!;
  const tavanUygulandi = r.tavanMg !== undefined && hamToplam > r.tavanMg;
  const toplam = hazir ? yuvarla(tavanUygulandi ? r.tavanMg! : hamToplam, 1) : 0;

  const bolus = hazir ? yuvarla((toplam * r.bolusYuzde) / 100, 1) : 0;
  const kalan = hazir ? yuvarla(toplam - bolus, 1) : 0;
  const infuzyonHizMlSaat = hazir && r.infuzyonDakika > 0 ? yuvarla((kalan / r.infuzyonDakika) * 60, 1) : 0;
  const flakon = hazir ? yuvarla(toplam / FLAKON_MG, 2) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="tromboliz-doz" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🧠</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">
                ☀️
              </span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Tromboliz Dozu
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Alteplaz (rt-PA) — endikasyona göre rejim, bolus ve infüzyon
            </p>
          </div>
        </div>

        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">
            🛑
          </span>
          <div className="text-[12px] leading-relaxed text-rose-900 space-y-2">
            <p>
              <strong>Aynı ilaç, endikasyona göre tümden farklı rejim.</strong> İnmede
              doz kiloya göre hesaplanır ve 90 mg&apos;ı aşamaz; masif embolide 100 mg
              sabittir. &ldquo;Alteplaz 100 mg&rdquo; inmede ölümcül aşırı doz,
              &ldquo;0.9 mg/kg&rdquo; ise masif embolide eksik doz olur.
            </p>
            <p>
              <strong>Bu araç tromboliz kararı vermez.</strong> Zaman penceresi,
              görüntüleme ve kanama ölçütleri burada değerlendirilmez; yalnızca
              aritmetik yapılır.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3">
              Endikasyon
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REJIMLER.map((x) => (
                <button
                  key={x.slug}
                  type="button"
                  aria-pressed={rejimSlug === x.slug}
                  onClick={() => setRejimSlug(x.slug)}
                  className={`text-left px-4 py-3 rounded-2xl border-2 transition-all
                    ${rejimSlug === x.slug ? "bg-blue-900 border-blue-900 shadow-lg shadow-blue-900/20" : "bg-white border-slate-200 hover:border-blue-900/30"}`}
                >
                  <span className={`block text-[12px] font-black ${rejimSlug === x.slug ? "text-white" : "text-blue-900"}`}>
                    {x.ad}
                  </span>
                  <span className={`block text-[10px] mt-0.5 ${rejimSlug === x.slug ? "text-blue-200" : "text-slate-600"}`}>
                    {x.ozet}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <SayiAlani
              id="tr-kilo"
              etiket={r.kiloyaGore ? "Ağırlık" : "Ağırlık (bu rejimde kullanılmıyor)"}
              birim="kg"
              deger={kilo}
              ayarla={setKilo}
              ipucu="ör. 70"
              pasif={!r.kiloyaGore}
            />
            {!r.kiloyaGore && (
              <p className="text-[11px] text-slate-700 leading-relaxed mt-3">
                Bu rejimde doz <strong>sabittir</strong>; ağırlık alanı bilerek
                pasifleştirildi ve hesaba katılmıyor.
              </p>
            )}
          </div>
        </div>

        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">{r.ad}</span>

          {!hazir ? (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              Hastanın ağırlığını girin.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Kutu
                  etiket="Toplam doz"
                  deger={`${toplam} mg`}
                  alt={`${FLAKON_MG} mg flakondan ${flakon} flakon`}
                />
                {r.bolusYuzde > 0 ? (
                  <Kutu etiket={`Bolus (%${r.bolusYuzde})`} deger={`${bolus} mg`} alt={`${r.bolusDakika} dakikada`} />
                ) : (
                  <Kutu etiket="Bolus" deger="yok" alt="bu rejimde bolus verilmez" />
                )}
                <Kutu
                  etiket="İnfüzyon"
                  deger={`${kalan} mg`}
                  alt={`${r.infuzyonDakika} dakikada · ${infuzyonHizMlSaat} mg/saat`}
                />
              </div>

              {tavanUygulandi && (
                <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                  <strong>Tavan uygulandı.</strong> {kiloNum} kg × {r.mgKg} mg/kg ={" "}
                  {yuvarla(hamToplam, 1)} mg çıkıyor; rejimin tavanı {r.tavanMg} mg olduğu
                  için toplam {r.tavanMg} mg&apos;a indirildi. Sayı sessizce kırpılmadı —
                  hesabı doğrulayabilesiniz diye ikisi de yazılıyor.
                </p>
              )}

              <p className="text-[11px] leading-relaxed text-blue-200 border-t border-blue-800 pt-4">
                {r.aciklama}
              </p>
              <p className="text-[11px] leading-relaxed text-amber-200">
                <strong>Dikkat:</strong> {r.uyari}
              </p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Uygulama notları:</strong> alteplaz kendi
            sulandırıcısıyla hazırlanır ve çalkalanmaz — köpürme protein kaybına yol
            açar. Aynı damar yolundan başka ilaç verilmez. Bolus ile infüzyon arasında
            beklenmez. İnfüzyon bitince hat, içinde kalan ilacı vermek için serum
            fizyolojikle yıkanır; yıkanmazsa hattaki ilaç hastaya hiç ulaşmaz.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">
              ⚠️
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Rejimler erişkin, yaygın protokollerdir ve tek yerde (REJIMLER bloğu)
              duruyor; kendi kurumunuzun protokolüyle karşılaştırın. Tenekteplaz farklı
              bir ilaçtır ve dozu burada hesaplanmaz. Miyokart enfarktüsünde kullanılan
              alteplaz rejimi de ayrıdır ve kapsam dışıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
