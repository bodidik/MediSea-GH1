"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Naloksan infüzyonu — saatlik hız UYANDIRAN BOLUS dozundan türetilir.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BU ARACIN TAŞIDIĞI ASIL BİLGİ: ANTİDOT ZEHİRDEN ÖNCE BİTİYOR.
 *
 * Naloksanın etkisi 30-90 dakikada sönüyor; opioidlerin çoğu daha uzun
 * sürüyor, metadon ve uzatılmış salınımlı ürünler ÇOK daha uzun. Yani hasta
 * uyandıktan sonra YENİDEN solunum baskılanmasına girer ve bu bir sürpriz
 * değil, BEKLENEN gidiştir. İnfüzyon tam bu yüzden var.
 *
 * "Bolus verdik, uyandı, taburcu edelim" bu araçtaki en tehlikeli akıl
 * yürütme; antikoagülan geri döndürmedeki "PCC verdik, INR düştü" ile
 * aynı şekil.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * SAATLİK HIZ = UYANDIRAN TOPLAM BOLUSUN ÜÇTE İKİSİ. Türetilmiş bir sayı
 * olduğu için ham hesap da ekranda duruyor; nereden geldiği görünmezse
 * yanlış bolusla kurulan bir infüzyon fark edilmez.
 *
 * HEDEF BİLİNÇ AÇIKLIĞI DEĞİL, YETERLİ SOLUNUM. Tam uyandırmaya çalışmak
 * akut yoksunluk, ajitasyon ve pulmoner ödem riski getiriyor — özellikle
 * bağımlı hastada.
 */

/** Saatlik infüzyon, uyandıran bolusun bu oranı kadar. */
const SAATLIK_ORAN = 2 / 3;

/* Makullük sınırları — klinik sınır değil. Bunların dışında sayı BASILMAZ. */
const BOLUS_ALT = 0.04, BOLUS_UST = 20;
const TORBA_ALT = 50, TORBA_UST = 1000;
const AMPUL_ALT = 0.1, AMPUL_UST = 10;

type Opioid = {
  slug: string;
  ad: string;
  sure: string;
  /** Naloksana göre ne kadar uzun sürdüğü — izlem süresini bu belirliyor. */
  izlem: string;
  not: string;
};

/**
 * İZLEM SÜRESİ OPIOIDE GÖRE DEĞİŞİR ve bu, aracın ikinci ayrımı.
 * Eşik dizisi yok; her kayıt kendi süresini taşıyor.
 */
const OPIOIDLER: Opioid[] = [
  {
    slug: "kisa",
    ad: "Kısa etkili (morfin, fentanil)",
    sure: "2–4 saat",
    izlem: "en az 4–6 saat",
    not: "Naloksan (30–90 dk) bunlardan da kısa. Tek bolusla bırakılan hasta uyanık gitse bile yeniden baskılanabilir.",
  },
  {
    slug: "uzun",
    ad: "Uzun etkili (metadon, buprenorfin)",
    sure: "24–48 saat",
    izlem: "en az 24 saat, çoğu zaman daha uzun",
    not: "Metadon naloksandan onlarca kat uzun sürüyor. Burada infüzyon kural, seçenek değil. Buprenorfin reseptöre sıkı bağlandığı için daha YÜKSEK naloksan gerekebilir.",
  },
  {
    slug: "salinim",
    ad: "Uzatılmış salınımlı tablet",
    sure: "12–24 saat",
    izlem: "en az 12–24 saat",
    not: "Tablet bağırsakta salınmaya devam ediyor; zehir hâlâ EMİLİYOR. Uyanan hasta iyileşmiş değil, henüz zirveye çıkmamış olabilir.",
  },
];

const yuvarla = (n: number, b = 2) => Math.round(n * 10 ** b) / 10 ** b;

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
          type="text"
          inputMode="decimal"
          value={deger}
          onChange={(e) => ayarla(e.target.value)}
          placeholder={ipucu}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-24 text-xl font-black text-blue-900 focus:border-blue-900 outline-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">{birim}</span>
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

export default function NaloksanInfuzyonSayfasi() {
  const [bolus, setBolus] = React.useState("");
  /*
   * VARSAYILAN "0.4" GERÇEK BİR KUSUR ÜRETİYORDU — ölçümle bulundu.
   * 0.4 bir AMPUL gücü; torbaya konan toplam değil. 250 mL'de 0.4 mg ile
   * derişim 0.0016 mg/mL oluyor ve 0.8 mg/saat için pompa hızı 500 mL/saat
   * çıkıyordu — günde 12 litre, fiziksel olarak saçma bir sayı.
   * Varsayılan gerçek bir torbaya çevrildi: 10 ampul = 4 mg / 250 mL.
   * Belgedeki "düzeltmeyi doğrularken VARSAYILAN durumu da ölç" kuralı.
   */
  const [ampul, setAmpul] = React.useState("4");
  const [torba, setTorba] = React.useState("250");
  const [opioid, setOpioid] = React.useState(OPIOIDLER[0].slug);

  const bolusNum = parseLocaleNumber(bolus);
  const ampulNum = parseLocaleNumber(ampul);
  const torbaNum = parseLocaleNumber(torba);

  const bolusTamam = sayiGirildiMi(bolus) && bolusNum >= BOLUS_ALT && bolusNum <= BOLUS_UST;
  const ampulTamam = sayiGirildiMi(ampul) && ampulNum >= AMPUL_ALT && ampulNum <= AMPUL_UST;
  const torbaTamam = sayiGirildiMi(torba) && torbaNum >= TORBA_ALT && torbaNum <= TORBA_UST;

  const secili = OPIOIDLER.find((o) => o.slug === opioid)!;

  const saatlikMg = bolusTamam ? bolusNum * SAATLIK_ORAN : null;
  /** Torbadaki derişim (mg/mL) — ampul ve hacim birlikte belirliyor. */
  const derisim = ampulTamam && torbaTamam ? ampulNum / torbaNum : null;
  const hizHam = saatlikMg !== null && derisim ? saatlikMg / derisim : null;
  /*
   * MAKUL OLMAYAN HIZ BASILMAZ. Torba içeriği yanlış girilirse (ör. ampul
   * gücü yazılırsa) hesap fiziksel olarak imkânsız bir hız veriyor. Sayıyı
   * göstermek, kullanıcının üzerine karar kurduğu yanlış bir varsayım üretir
   * — "çöp girdiden klinik etiket basma" kuralının pompa tarafındaki hâli.
   */
  const HIZ_TAVAN_ML_SAAT = 250;
  const hizMakul = hizHam !== null && hizHam > 0 && hizHam <= HIZ_TAVAN_ML_SAAT;
  const hizMlSaat = hizMakul ? hizHam : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="naloksan-infuzyon" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">💊</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Naloksan İnfüzyonu
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Saatlik hız, uyandıran bolustan türetilir
            </p>
          </div>
        </div>

        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">🛑</span>
          <div className="text-[12px] leading-relaxed text-rose-900 space-y-2">
            <p>
              <strong>Antidot zehirden ÖNCE bitiyor.</strong> Naloksanın etkisi
              30–90 dakikada sönüyor; opioidlerin çoğu daha uzun sürüyor. Hasta
              uyandıktan sonra yeniden solunum baskılanmasına girer — bu bir
              sürpriz değil, <strong>beklenen gidiştir</strong>. İnfüzyon tam bu
              yüzden var.
            </p>
            <p>
              <strong>Hedef bilinç açıklığı değil, YETERLİ SOLUNUM.</strong> Tam
              uyandırmaya çalışmak akut yoksunluk, ajitasyon ve pulmoner ödem
              riski getirir; özellikle bağımlı hastada.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <SayiAlani
            id="nx-bolus"
            etiket="Uyandıran TOPLAM bolus"
            birim="mg"
            deger={bolus}
            ayarla={setBolus}
            ipucu="ör. 1.2"
          />
          <p className="text-[11px] text-slate-700 leading-relaxed -mt-2">
            Tek bir bolusun değil, yeterli solunumu sağlayana kadar verilen
            <strong> toplamın</strong> miktarı. Saatlik hız bu sayıdan
            türetiliyor; yanlış girilirse infüzyon baştan yanlış kurulur.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
            <SayiAlani id="nx-ampul" etiket="Torbaya konan naloksan" birim="mg" deger={ampul} ayarla={setAmpul} ipucu="ör. 4" />
            <SayiAlani id="nx-torba" etiket="Torba hacmi" birim="mL" deger={torba} ayarla={setTorba} ipucu="ör. 250" />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3">
              Alınan opioid — izlem süresini bu belirler
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {OPIOIDLER.map((o) => (
                <button
                  key={o.slug}
                  type="button"
                  aria-pressed={opioid === o.slug}
                  onClick={() => setOpioid(o.slug)}
                  className={`text-left px-4 py-3 rounded-2xl border-2 transition-all ${
                    opioid === o.slug ? "bg-blue-900 border-blue-900" : "bg-white border-slate-200 hover:border-blue-900/30"
                  }`}
                >
                  <span className={`block text-[12px] font-black ${opioid === o.slug ? "text-white" : "text-blue-900"}`}>
                    {o.ad}
                  </span>
                  <span className={`block text-[10px] mt-0.5 leading-snug ${opioid === o.slug ? "text-blue-200" : "text-slate-600"}`}>
                    etki {o.sure}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {saatlikMg !== null ? (
          <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
              Saatlik infüzyon
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Kutu etiket="Naloksan" deger={`${yuvarla(saatlikMg)} mg/saat`} alt={`${bolusNum} × 2/3`} />
              <Kutu
                etiket="Pompa hızı"
                deger={hizMlSaat !== null ? `${yuvarla(hizMlSaat, 1)} mL/saat` : "–"}
                alt={
                  hizMlSaat !== null
                    ? `${yuvarla(derisim!, 4)} mg/mL karışım`
                    : hizHam !== null
                      ? "torba içeriği makul değil"
                      : "torba bilgisi girin"
                }
              />
              <Kutu etiket="İzlem" deger={secili.izlem} alt={secili.ad.split(" (")[0]} />
            </div>
            {hizHam !== null && !hizMakul && (
              <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                <strong>Pompa hızı basılmadı.</strong> Bu karışımla hesap{" "}
                {yuvarla(hizHam, 0)} mL/saat çıkıyor — fiziksel olarak makul
                değil. Genellikle sebep &ldquo;torbaya konan naloksan&rdquo;
                alanına AMPUL GÜCÜNÜN yazılmasıdır; oraya torbadaki TOPLAM
                miktar girilir (ör. 10 ampul = 4 mg).
              </p>
            )}
            <p className="text-[11px] leading-relaxed text-blue-200">{secili.not}</p>
            <p className="text-[11px] leading-relaxed text-amber-200">
              <strong>Hız sabit değildir.</strong> Solunum sayısına göre yukarı
              ya da aşağı ayarlanır; yoksunluk belirtileri çıkarsa azaltılır.
              İnfüzyon kesildikten sonra hasta en az {secili.izlem.replace("en az ", "")}{" "}
              daha izlenir — naloksan biterken opioid hâlâ etkili olabilir.
            </p>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[12px] font-black text-slate-600">
              Uyandıran toplam bolus miktarını girin ({BOLUS_ALT}–{BOLUS_UST} mg).
            </p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">İnfüzyon kararı sayıyla verilmez.</strong>{" "}
            Tek bolusla düzelen ve kısa etkili bir opioid almış hastada infüzyon
            gerekmeyebilir; metadon ya da uzatılmış salınımlı tablet almış hastada
            uyanıklık tek başına güven vermez. Karar, alınan maddeye ve solunumun
            zaman içindeki gidişine bakar.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Katsayı ve süreler erişkin, yaygın protokollerdir; kendi kurumunuzun
              protokolüyle karşılaştırın. Bağımlı hastada tam geri döndürme
              hedeflenmez: amaç solunumu güvenli aralığa getirmek, hastayı
              yoksunluğa sokmak değil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
