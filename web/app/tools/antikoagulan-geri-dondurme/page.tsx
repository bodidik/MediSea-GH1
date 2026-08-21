"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Antikoagülan geri döndürme — ajanına göre doz, tavan ve zaman kuralı.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BU ARAÇTA ÜÇ AYRI DOZLAMA MANTIĞI YAN YANA DURUYOR VE KARIŞTIRILMALARI
 * GERÇEK BİR HATA KAYNAĞI:
 *
 *   protamin      VERİLEN HEPARİN MİKTARINA göre — ve ZAMANLA azalır
 *   PCC           kiloya VE INR'ye göre, tavanlı
 *   idarucizumab  SABİT 5 g — kiloya göre DEĞİL
 *
 * Protaminin zaman kuralı en kolay atlanan yer: heparinin yarı ömrü kısa
 * olduğu için 30 dakikadan eski doz için tam nötralizasyon gerekmiyor.
 * "1 mg / 100 Ü" kuralını zamandan bağımsız uygulamak AŞIRI protamin demek
 * ve protaminin kendisi hipotansiyon, bradikardi ve anafilaksi yapıyor —
 * yani aşırı doz kanamayı değil hastayı vuruyor.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ARAÇ GERİ DÖNDÜRME KARARI VERMEZ. Kararı kanamanın yeri ve ağırlığı,
 * son doz zamanı ve böbrek işlevi belirler; burada yalnızca aritmetik var.
 */

type Kip = "protamin-uf" | "protamin-dmah" | "pcc" | "k-vitamini" | "idarucizumab";

/** Protamin tek dozda bu miktarı aşmaz — aşırısı kendisi kanama ve şok yapar. */
const PROTAMIN_TAVAN_MG = 50;
/** 4 faktörlü PCC tek dozda yaygın olarak aşılmayan ünite. */
const PCC_TAVAN_U = 5000;
/** İdarucizumab sabit doz (2 × 2.5 g flakon). */
const IDARUCIZUMAB_G = 5;

/**
 * DMAH'ın zaman ölçeği heparinden BAŞKA — ve ikisini aynı seçiciye bağlamak
 * gerçek bir doz hatası olurdu. Standart heparinin yarı ömrü dakikalarla
 * ölçülür (0-30/30-60/60-120 dk); enoksaparininki saatlerle (<8 sa / 8-12 sa).
 * Bu yüzden iki ayrı liste var; ilk yazımda tek liste kullanılmıştı ve
 * "30-60 dakika" seçeneği enoksaparin için anlamsızdı.
 */
const DMAH_ZAMAN = [
  { slug: "8-alti", ad: "Son 8 saat içinde", oran: 1, not: "1 mg protamin / 1 mg enoksaparin." },
  { slug: "8-12", ad: "8–12 saat önce", oran: 0.5, not: "Doz yarıya iner: 0.5 mg / 1 mg." },
  { slug: "12-ustu", ad: "12 saatten eski", oran: 0, not: "Protamin genellikle ÖNERİLMEZ — ilaç büyük ölçüde temizlenmiştir ve protaminin kendi riski kalır." },
];

/** Heparinin son verilişinden geçen süreye göre nötralizasyon oranı. */
const ZAMAN_DILIMLERI = [
  { slug: "0-30", ad: "Son 30 dakika içinde", oran: 1, not: "Tam nötralizasyon: her 100 Ü için 1 mg." },
  { slug: "30-60", ad: "30–60 dakika önce", oran: 0.5, not: "Heparinin bir kısmı zaten temizlendi; doz yarıya iner." },
  { slug: "60+", ad: "60–120 dakika önce", oran: 0.375, not: "Doz üçte bir–dörtte bire iner. İki saatten eski bolus için protamin genellikle gereksizdir." },
];

/**
 * INR'ye göre 4F-PCC dozu (Ü/kg, faktör IX üzerinden).
 *
 * BASAMAK SINIRI EŞİK SAYISIYLA DEĞİL AÇIK KOŞULLA YAZILIYOR. İlk yazımda
 * "eşiğin altındaysa" biçiminde bir dizi kullanıldı ve ilk eşik 4 yerine 2
 * girildi: INR 3 olan hasta 25 yerine 35 Ü/kg alıyordu — %40 fazla PCC, yani
 * gereksiz tromboz riski. Ölçümde yakalandı (INR 3 ile INR 5 aynı dozu
 * veriyordu) ve etiket de kendisiyle çelişiyordu ("INR 3" girdisine "INR 4-6").
 * Açık koşul aynı zamanda sınır değerini de düzeltiyor: INR tam 6 artık
 * "INR 4-6" bandında (eşik dizisinde >6 bandına düşüyordu).
 */
const PCC_BASAMAK: { uygun: (i: number) => boolean; uKg: number; etiket: string }[] = [
  { uygun: (i) => i < 4, uKg: 25, etiket: "INR < 4" },
  { uygun: (i) => i <= 6, uKg: 35, etiket: "INR 4–6" },
  { uygun: () => true, uKg: 50, etiket: "INR > 6" },
];

/** Bu değerin altında varfarin geri döndürme genellikle endike değil. */
const INR_ANLAMLI_ALT = 1.5;

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
          type="text"
          inputMode="decimal"
          value={deger}
          onChange={(e) => ayarla(e.target.value)}
          placeholder={ipucu}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-20 text-xl font-black text-blue-900 focus:border-blue-900 outline-none"
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

const KIPLER: { slug: Kip; ad: string; ozet: string }[] = [
  { slug: "protamin-uf", ad: "Protamin — standart heparin", ozet: "Verilen üniteye ve GEÇEN SÜREYE göre" },
  { slug: "protamin-dmah", ad: "Protamin — DMAH (enoksaparin)", ozet: "Son doza ve geçen süreye göre" },
  { slug: "pcc", ad: "4F-PCC — varfarin", ozet: "Kiloya ve INR'ye göre, tavanlı" },
  { slug: "k-vitamini", ad: "K vitamini — varfarin", ozet: "Sabit doz, yola göre değişir" },
  { slug: "idarucizumab", ad: "İdarucizumab — dabigatran", ozet: "SABİT 5 g, kiloya göre değil" },
];

export default function AntikoagulanGeriDondurmeSayfasi() {
  const [kip, setKip] = React.useState<Kip>("protamin-uf");
  const [heparinU, setHeparinU] = React.useState("");
  const [enoksaparinMg, setEnoksaparinMg] = React.useState("");
  const [zaman, setZaman] = React.useState(ZAMAN_DILIMLERI[0].slug);
  const [dmahZaman, setDmahZaman] = React.useState(DMAH_ZAMAN[0].slug);
  const [kilo, setKilo] = React.useState("");
  const [inr, setInr] = React.useState("");

  const z = ZAMAN_DILIMLERI.find((x) => x.slug === zaman)!;
  const dz = DMAH_ZAMAN.find((x) => x.slug === dmahZaman)!;
  const kiloNum = parseLocaleNumber(kilo);
  const inrNum = parseLocaleNumber(inr);
  const heparinNum = parseLocaleNumber(heparinU);
  const enoksNum = parseLocaleNumber(enoksaparinMg);

  const kiloTamam = sayiGirildiMi(kilo) && kiloNum >= 20 && kiloNum <= 300;
  const inrTamam = sayiGirildiMi(inr) && inrNum >= 1 && inrNum <= 20;
  const heparinTamam = sayiGirildiMi(heparinU) && heparinNum > 0 && heparinNum <= 100000;
  const enoksTamam = sayiGirildiMi(enoksaparinMg) && enoksNum > 0 && enoksNum <= 500;

  /* ── protamin: standart heparin ─────────────────────────────────────── */
  const protaminHam = heparinTamam ? (heparinNum / 100) * z.oran : 0;
  const protaminTavanli = Math.min(protaminHam, PROTAMIN_TAVAN_MG);
  const protaminTavanUygulandi = heparinTamam && protaminHam > PROTAMIN_TAVAN_MG;

  /* ── protamin: DMAH ─────────────────────────────────────────────────── */
  const dmahHam = enoksTamam ? enoksNum * dz.oran : 0;
  const dmahTavanli = Math.min(dmahHam, PROTAMIN_TAVAN_MG);
  const dmahTavanUygulandi = enoksTamam && dmahHam > PROTAMIN_TAVAN_MG;

  /* ── PCC ────────────────────────────────────────────────────────────── */
  const pccBasamak = inrTamam ? PCC_BASAMAK.find((b) => b.uygun(inrNum))! : null;
  const pccHam = kiloTamam && pccBasamak ? kiloNum * pccBasamak.uKg : 0;
  const pccTavanli = Math.min(pccHam, PCC_TAVAN_U);
  const pccTavanUygulandi = kiloTamam && !!pccBasamak && pccHam > PCC_TAVAN_U;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="antikoagulan-geri-dondurme" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🩹</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Antikoagülan Geri Döndürme
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Protamin · 4F-PCC · K vitamini · idarucizumab
            </p>
          </div>
        </div>

        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">🛑</span>
          <div className="text-[12px] leading-relaxed text-rose-900 space-y-2">
            <p>
              <strong>Bu ekranda üç ayrı dozlama mantığı yan yana duruyor.</strong>{" "}
              Protamin verilen heparin MİKTARINA ve geçen SÜREYE, PCC kiloya ve
              INR&apos;ye, idarucizumab ise hiçbirine bağlı değil — sabit 5 g.
            </p>
            <p>
              <strong>Protaminin aşırısı hastayı vurur.</strong> Zaman kuralı
              atlanıp &ldquo;1 mg / 100 Ü&rdquo; zamandan bağımsız uygulanırsa fazla
              protamin verilir; protaminin kendisi hipotansiyon, bradikardi ve
              anafilaksi yapar. Tek doz {PROTAMIN_TAVAN_MG} mg&apos;ı aşmaz ve yavaş
              verilir.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3">
              Geri döndürülecek ajan
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {KIPLER.map((k) => (
                <button
                  key={k.slug}
                  type="button"
                  aria-pressed={kip === k.slug}
                  onClick={() => setKip(k.slug)}
                  className={`text-left px-4 py-3 rounded-2xl border-2 transition-all
                    ${kip === k.slug ? "bg-blue-900 border-blue-900 shadow-lg shadow-blue-900/20" : "bg-white border-slate-200 hover:border-blue-900/30"}`}
                >
                  <span className={`block text-[12px] font-black ${kip === k.slug ? "text-white" : "text-blue-900"}`}>
                    {k.ad}
                  </span>
                  <span className={`block text-[10px] mt-0.5 leading-snug ${kip === k.slug ? "text-blue-200" : "text-slate-600"}`}>
                    {k.ozet}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {(kip === "protamin-uf" || kip === "protamin-dmah") && (
            <div className="pt-4 border-t border-slate-100 space-y-5">
              {kip === "protamin-uf" ? (
                <SayiAlani id="gd-heparin" etiket="Verilen heparin" birim="Ü" deger={heparinU} ayarla={setHeparinU} ipucu="ör. 5000" />
              ) : (
                <SayiAlani id="gd-enoks" etiket="Son enoksaparin dozu" birim="mg" deger={enoksaparinMg} ayarla={setEnoksaparinMg} ipucu="ör. 60" />
              )}
              <div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                  Son dozdan geçen süre
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(kip === "protamin-uf" ? ZAMAN_DILIMLERI : DMAH_ZAMAN).map((t) => (
                    <button
                      key={t.slug}
                      type="button"
                      aria-pressed={(kip === "protamin-uf" ? zaman : dmahZaman) === t.slug}
                      onClick={() => (kip === "protamin-uf" ? setZaman(t.slug) : setDmahZaman(t.slug))}
                      className={`px-4 py-3 rounded-2xl border-2 text-[11px] font-black transition-all
                        ${(kip === "protamin-uf" ? zaman : dmahZaman) === t.slug ? "bg-blue-900 border-blue-900 text-white" : "bg-white border-slate-200 text-slate-700 hover:border-blue-900/30"}`}
                    >
                      {t.ad}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {kip === "pcc" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
              <SayiAlani id="gd-kilo" etiket="Ağırlık" birim="kg" deger={kilo} ayarla={setKilo} ipucu="ör. 70" />
              <SayiAlani id="gd-inr" etiket="INR" birim="" deger={inr} ayarla={setInr} ipucu="ör. 4.5" />
            </div>
          )}
        </div>

        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
            {KIPLER.find((k) => k.slug === kip)!.ad}
          </span>

          {kip === "protamin-uf" && (
            heparinTamam ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Kutu etiket="Protamin dozu" deger={`${yuvarla(protaminTavanli)} mg`} alt={`${z.ad.toLocaleLowerCase("tr")}`} />
                  <Kutu etiket="En kısa süre" deger="10 dakika" alt="hızlı verilirse hipotansiyon ve bradikardi" />
                </div>
                <p className="text-[11px] leading-relaxed text-blue-200">
                  {heparinNum} Ü heparin · {z.not} → {yuvarla(protaminHam)} mg.
                </p>
                {protaminTavanUygulandi && (
                  <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                    <strong>Tavan uygulandı.</strong> Hesap {yuvarla(protaminHam)} mg çıkıyor;
                    tek doz {PROTAMIN_TAVAN_MG} mg&apos;ı aşamayacağı için doz oraya
                    indirildi. Sayı sessizce kırpılmadı — hesabın kendisi yukarıda duruyor.
                  </p>
                )}
              </>
            ) : (
              <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
                Verilen heparin miktarını girin (Ü).
              </p>
            )
          )}

          {kip === "protamin-dmah" && (
            enoksTamam ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Kutu
                    etiket="Protamin dozu"
                    deger={dz.oran === 0 ? "önerilmez" : `${yuvarla(dmahTavanli)} mg`}
                    alt={`enoksaparin ${enoksNum} mg · ${dz.ad.toLocaleLowerCase("tr")}`}
                  />
                  <Kutu etiket="Nötralizasyon" deger="kısmi" alt="DMAH tam geri döndürülemez" />
                </div>
                <p className="text-[11px] leading-relaxed text-blue-200">
                  {dz.not} Protamin DMAH&apos;ın anti-Xa etkisini ancak KISMEN geri döndürür
                  (yaklaşık %60); tam nötralizasyon beklenmemelidir.
                </p>
                {dmahTavanUygulandi && dz.oran > 0 && (
                  <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                    <strong>Tavan uygulandı.</strong> Hesap {yuvarla(dmahHam)} mg çıkıyor;
                    tek doz {PROTAMIN_TAVAN_MG} mg ile sınırlı.
                  </p>
                )}
              </>
            ) : (
              <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
                Son enoksaparin dozunu girin (mg).
              </p>
            )
          )}

          {kip === "pcc" && (
            kiloTamam && inrTamam && pccBasamak ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Kutu etiket="4F-PCC" deger={`${Math.round(pccTavanli)} Ü`} alt={`${pccBasamak.uKg} Ü/kg · ${pccBasamak.etiket}`} />
                  <Kutu etiket="Ağırlık" deger={`${kiloNum} kg`} alt={`INR ${inrNum}`} />
                  <Kutu etiket="Yanında" deger="K vitamini" alt="PCC tek başına YETMEZ" />
                </div>
                <p className="text-[11px] leading-relaxed text-blue-200">
                  {kiloNum} kg × {pccBasamak.uKg} Ü/kg = {Math.round(pccHam)} Ü.
                </p>
                {pccTavanUygulandi && (
                  <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                    <strong>Tavan uygulandı.</strong> Hesap {Math.round(pccHam)} Ü çıkıyor;
                    tek doz {PCC_TAVAN_U} Ü ile sınırlı.
                  </p>
                )}
                {inrNum < INR_ANLAMLI_ALT && (
                  <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                    <strong>INR {inrNum} zaten hedefe yakın.</strong> Bu değerde varfarin
                    geri döndürme genellikle endike değildir; PCC vermek kanamayı
                    durdurmadan tromboz riskini geri getirir. Sayı yine de gösteriliyor,
                    çünkü kararı klinik verir — ama gerekçesi burada yok.
                  </p>
                )}
                <p className="text-[11px] leading-relaxed text-amber-200">
                  <strong>Dikkat:</strong> PCC&apos;nin etkisi saatler içinde biter,
                  varfarininki günlerce sürer. Yanında IV K vitamini VERİLMEZSE INR
                  yeniden yükselir — bu, geri döndürmenin en sık atlanan basamağı.
                </p>
              </>
            ) : (
              <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
                Ağırlık ve INR girin.
              </p>
            )
          )}

          {kip === "k-vitamini" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Kutu etiket="Ciddi kanama" deger="10 mg" alt="IV, 20–30 dakikada" />
                <Kutu etiket="Kanama yok, INR yüksek" deger="1–2 mg" alt="oral" />
                <Kutu etiket="Etki başlangıcı" deger="6–8 saat" alt="tam etki 24 saat" />
              </div>
              <p className="text-[11px] leading-relaxed text-blue-200">
                Doz kiloya göre değil, tabloya göre belirlenir. IV K vitamini yavaş
                verilir; hızlı uygulamada anafilaktoid reaksiyon bildirilmiştir. Etkisi
                saatler sonra başladığı için ciddi kanamada TEK BAŞINA yetmez ve PCC ile
                birlikte kullanılır.
              </p>
            </>
          )}

          {kip === "idarucizumab" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Kutu etiket="İdarucizumab" deger={`${IDARUCIZUMAB_G} g`} alt="2 × 2.5 g flakon" />
                <Kutu etiket="Dozlama" deger="SABİT" alt="kiloya göre değil" />
                <Kutu etiket="Etki" deger="dakikalar" alt="dabigatrana özgü" />
              </div>
              <p className="text-[11px] leading-relaxed text-blue-200">
                Yalnızca <strong>dabigatran</strong> için geçerlidir; faktör Xa
                inhibitörlerinde (rivaroksaban, apiksaban) etkisizdir. Doz kiloya göre
                değişmez. Nadiren, dokudan ilaç yeniden dağıldığı için tekrar doz
                gerekebilir.
              </p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Araç geri döndürme kararı vermez.</strong>{" "}
            Kararı kanamanın yeri ve ağırlığı, son doz zamanı ve böbrek işlevi belirler.
            Antikoagülanı geri döndürmek, altta yatan tromboz riskini geri getirir; bu
            denge burada hesaplanmaz. Aktif kanamada mekanik hemostaz, transfüzyon ve
            kaynağın durdurulması ilaçtan önce gelir.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Dozlar ve tavanlar erişkin, yaygın protokollerdir ve tek yerde duruyor;
              kendi kurumunuzun protokolüyle karşılaştırın. Andeksanet alfa (faktör Xa
              inhibitörleri için) bu araçta YOKTUR: dozu son alınan ilaca, miktarına ve
              üzerinden geçen süreye göre iki ayrı rejime bölünüyor ve ülkemizde
              erişimi sınırlı — yanlış rejimi uygulamak hiç uygulamamaktan kötü.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
