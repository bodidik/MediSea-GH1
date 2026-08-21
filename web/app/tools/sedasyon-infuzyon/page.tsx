"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * Yoğun bakım sedasyon ve analjezi infüzyonları — doz ile pompa hızı çevrimi.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ARACIN TAŞIDIĞI ASIL AYRIM: HER İLACIN DOZLAMA TABANI FARKLI.
 *
 *   propofol         mg/kg/SAAT
 *   ketamin          mg/kg/SAAT
 *   midazolam        mg/SAAT           (kilodan BAĞIMSIZ)
 *   morfin           mg/SAAT           (kilodan BAĞIMSIZ)
 *   fentanil         mcg/kg/SAAT
 *   remifentanil     mcg/kg/DAKİKA
 *   deksmedetomidin  mcg/kg/SAAT
 *
 * Bu tablo göründüğünden tehlikeli: mg ile mcg arasında 1000 kat, saat ile
 * dakika arasında 60 kat var ve ikisi aynı ekranda yan yana duruyor.
 * Remifentanili "mcg/kg/saat" sanmak dozu 60 kat AZALTIR; fentanili
 * "mcg/kg/dakika" sanmak 60 kat ARTIRIR.
 *
 * Araç her ilacın tabanını yazıyor, kilodan bağımsız ilaç seçildiğinde ağırlık
 * alanını PASİFLEŞTİRİP hesaba katmıyor ve sonucu hem hız hem saatlik toplam
 * doz olarak veriyor (vazoaktif infüzyon aracıyla aynı karar).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ARAÇ SEDASYON HEDEFİ BELİRLEMEZ. Hedef RASS ile konur ve günlük sedasyon
 * kesintisi ayrı bir karardır; burada yalnızca aritmetik var.
 */

type Ilac = {
  slug: string;
  ad: string;
  sinif: string;
  kiloyaGore: boolean;
  /** Doz birimi ekranda gösterilecek biçimde. */
  dozBirimi: string;
  /** Doz biriminden mikrograma çevirme çarpanı (mg -> 1000). */
  mikrogramCarpani: number;
  /** Doz zaman tabanı SAAT mi DAKİKA mı? */
  zaman: "saat" | "dakika";
  olagan: [number, number];
  varsayilanDoz: string;
  /** Yaygın torba: ilaç miktarı (mg) ve hacim (mL). */
  torbaMg: number;
  torbaMl: number;
  not: string;
};

const ILACLAR: Ilac[] = [
  {
    slug: "propofol",
    ad: "Propofol",
    sinif: "Sedatif",
    kiloyaGore: true,
    dozBirimi: "mg/kg/saat",
    mikrogramCarpani: 1000,
    zaman: "saat",
    olagan: [0.5, 4],
    varsayilanDoz: "1.5",
    torbaMg: 1000,
    torbaMl: 100,
    not: "Hazır %1 emülsiyon (10 mg/mL) olarak gelir ve sulandırılmaz. Uzun süreli yüksek doz propofol infüzyon sendromu riski taşır: metabolik asidoz, rabdomiyoliz, kardiyak yetmezlik. Ayrıca yağ yükü beslenmenin kalori hesabına KATILIR.",
  },
  {
    slug: "midazolam",
    ad: "Midazolam",
    sinif: "Sedatif",
    kiloyaGore: false,
    dozBirimi: "mg/saat",
    mikrogramCarpani: 1000,
    zaman: "saat",
    olagan: [1, 10],
    varsayilanDoz: "3",
    torbaMg: 100,
    torbaMl: 100,
    not: "Böbrek yetmezliğinde aktif metaboliti birikir ve uyanma günlerce gecikebilir. Uzun infüzyonda etki süresi ilacın yarı ömrüne değil, dokudaki birikime bağlıdır.",
  },
  {
    slug: "deksmedetomidin",
    ad: "Deksmedetomidin",
    sinif: "Sedatif",
    kiloyaGore: true,
    dozBirimi: "mcg/kg/saat",
    mikrogramCarpani: 1,
    zaman: "saat",
    olagan: [0.2, 1.4],
    varsayilanDoz: "0.5",
    torbaMg: 0.2,
    torbaMl: 50,
    not: "Solunum baskılaması yapmaz — bu üstünlük gibi görünse de hastanın apne olmadan derin sedasyonda kalabileceği anlamına gelir. Bradikardi ve hipotansiyon sık; yükleme dozu hipertansiyon yapabildiği için çoğu protokol yükleme kullanmaz.",
  },
  {
    slug: "ketamin",
    ad: "Ketamin",
    sinif: "Sedatif / analjezik",
    kiloyaGore: true,
    dozBirimi: "mg/kg/saat",
    mikrogramCarpani: 1000,
    zaman: "saat",
    olagan: [0.1, 1],
    varsayilanDoz: "0.3",
    torbaMg: 500,
    torbaMl: 100,
    not: "Solunumu ve kan basıncını görece korur; bronkospazmda ek yarar sağlar. Sekresyon artışı ve uyanma sırasında ajitasyon görülebilir.",
  },
  {
    slug: "fentanil",
    ad: "Fentanil",
    sinif: "Analjezik",
    kiloyaGore: true,
    dozBirimi: "mcg/kg/saat",
    mikrogramCarpani: 1,
    zaman: "saat",
    olagan: [0.5, 3],
    varsayilanDoz: "1",
    torbaMg: 2.5,
    torbaMl: 50,
    not: "Yağ dokusunda birikir: uzun infüzyondan sonra etki süresi belirgin uzar. Göğüs duvarı rijiditesi hızlı bolus uygulamasında görülür.",
  },
  {
    slug: "remifentanil",
    ad: "Remifentanil",
    sinif: "Analjezik",
    kiloyaGore: true,
    dozBirimi: "mcg/kg/dakika",
    mikrogramCarpani: 1,
    zaman: "dakika",
    olagan: [0.025, 0.2],
    varsayilanDoz: "0.05",
    torbaMg: 2,
    torbaMl: 50,
    not: "DOZ TABANI DAKİKADIR — bu listedeki tek ilaç. Plazma esterazlarıyla parçalandığı için birikim yapmaz ve kesildikten dakikalar sonra etkisi biter; bu yüzden infüzyon kesilmeden önce başka bir analjezi planı kurulmalıdır.",
  },
  {
    slug: "morfin",
    ad: "Morfin",
    sinif: "Analjezik",
    kiloyaGore: false,
    dozBirimi: "mg/saat",
    mikrogramCarpani: 1000,
    zaman: "saat",
    olagan: [1, 10],
    varsayilanDoz: "2",
    torbaMg: 100,
    torbaMl: 100,
    not: "Böbrek yetmezliğinde aktif metaboliti (M6G) birikir; solunum baskılaması gecikmeli ortaya çıkabilir. Histamin salınımına bağlı hipotansiyon görülebilir.",
  },
];

const yuvarla = (n: number, b = 2) => Math.round(n * 10 ** b) / 10 ** b;

/**
 * MODÜL DÜZEYİNDE — sayfa içinde tanımlanırsa React her render'da kontrolü
 * söküp yeniden takar ve odak kaybolur.
 */
function SayiAlani({
  id, etiket, birim, deger, ayarla, ipucu, pasif,
}: {
  id: string; etiket: string; birim: string; deger: string;
  ayarla: (v: string) => void; ipucu?: string; pasif?: boolean;
}) {
  return (
    <div className={pasif ? "opacity-50" : ""}>
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
          disabled={pasif}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-24 text-xl font-black text-blue-900 focus:border-blue-900 outline-none disabled:bg-slate-100"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">{birim}</span>
      </div>
    </div>
  );
}

export default function SedasyonInfuzyonSayfasi() {
  const [ilacSlug, setIlacSlug] = React.useState(ILACLAR[0].slug);
  const [kilo, setKilo] = React.useState("");
  const [doz, setDoz] = React.useState(ILACLAR[0].varsayilanDoz);
  const [torbaMg, setTorbaMg] = React.useState(String(ILACLAR[0].torbaMg));
  const [torbaMl, setTorbaMl] = React.useState(String(ILACLAR[0].torbaMl));

  const ilac = ILACLAR.find((x) => x.slug === ilacSlug)!;

  const ilacSec = (slug: string) => {
    const y = ILACLAR.find((x) => x.slug === slug)!;
    setIlacSlug(slug);
    setDoz(y.varsayilanDoz);
    setTorbaMg(String(y.torbaMg));
    setTorbaMl(String(y.torbaMl));
  };

  const kiloNum = parseLocaleNumber(kilo);
  const dozNum = parseLocaleNumber(doz);
  const torbaMgNum = parseLocaleNumber(torbaMg);
  const torbaMlNum = parseLocaleNumber(torbaMl);

  const kiloTamam = !ilac.kiloyaGore || (kilo.trim() !== "" && kiloNum >= 20 && kiloNum <= 300);
  const makul =
    kiloTamam &&
    doz.trim() !== "" && dozNum > 0 && dozNum <= 100 &&
    torbaMg.trim() !== "" && torbaMgNum > 0 && torbaMgNum <= 5000 &&
    torbaMl.trim() !== "" && torbaMlNum >= 5 && torbaMlNum <= 1000;

  /* Her şey MİKROGRAM/SAAT tabanına çevrilip oradan hıza dönüyor. */
  const mikrogramSaat = makul
    ? dozNum * ilac.mikrogramCarpani * (ilac.kiloyaGore ? kiloNum : 1) * (ilac.zaman === "dakika" ? 60 : 1)
    : 0;
  const derisimMikrogramMl = makul ? (torbaMgNum * 1000) / torbaMlNum : 0;
  const mlSaat = makul && derisimMikrogramMl > 0 ? yuvarla(mikrogramSaat / derisimMikrogramMl, 1) : 0;
  const mgSaat = makul ? yuvarla(mikrogramSaat / 1000, 2) : 0;
  const torbaSaat = makul && mlSaat > 0 ? yuvarla(torbaMlNum / mlSaat, 1) : 0;

  const aralikDisi = makul && (dozNum < ilac.olagan[0] || dozNum > ilac.olagan[1]);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="sedasyon-infuzyon" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">💤</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Sedasyon &amp; Analjezi
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Yoğun bakım infüzyonları — doz tabanı ilaca göre değişir
            </p>
          </div>
        </div>

        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">🛑</span>
          <div className="text-[12px] leading-relaxed text-rose-900 space-y-2">
            <p>
              <strong>Bu listede doz tabanı her ilaçta aynı değil.</strong> mg ile mcg
              arasında 1000 kat, saat ile dakika arasında 60 kat fark var ve ikisi aynı
              ekranda yan yana duruyor.
            </p>
            <p>
              <strong>Remifentanil bu listedeki tek dakika tabanlı ilaç.</strong> Onu
              &ldquo;mcg/kg/saat&rdquo; sanmak dozu 60 kat azaltır; fentanili
              &ldquo;mcg/kg/dakika&rdquo; sanmak 60 kat artırır.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3">İlaç</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ILACLAR.map((x) => (
                <button
                  key={x.slug}
                  type="button"
                  aria-pressed={ilacSlug === x.slug}
                  onClick={() => ilacSec(x.slug)}
                  className={`text-left px-4 py-3 rounded-2xl border-2 transition-all
                    ${ilacSlug === x.slug ? "bg-blue-900 border-blue-900 shadow-lg shadow-blue-900/20" : "bg-white border-slate-200 hover:border-blue-900/30"}`}
                >
                  <span className={`block text-[12px] font-black ${ilacSlug === x.slug ? "text-white" : "text-blue-900"}`}>
                    {x.ad}
                  </span>
                  <span className={`block text-[10px] mt-0.5 font-mono ${ilacSlug === x.slug ? "text-amber-300" : "text-slate-700"}`}>
                    {x.dozBirimi}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
            <SayiAlani
              id="sed-kilo"
              etiket={ilac.kiloyaGore ? "Ağırlık" : "Ağırlık (bu ilaçta kullanılmıyor)"}
              birim="kg"
              deger={kilo}
              ayarla={setKilo}
              ipucu="ör. 70"
              pasif={!ilac.kiloyaGore}
            />
            <SayiAlani
              id="sed-doz"
              etiket="Doz"
              birim={ilac.dozBirimi}
              deger={doz}
              ayarla={setDoz}
              ipucu={`${ilac.olagan[0]}–${ilac.olagan[1]}`}
            />
          </div>

          <div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">
              Torba karışımı
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <SayiAlani id="sed-torba-mg" etiket="İlaç miktarı" birim="mg" deger={torbaMg} ayarla={setTorbaMg} ipucu="ör. 1000" />
              <SayiAlani id="sed-torba-ml" etiket="Hacim" birim="mL" deger={torbaMl} ayarla={setTorbaMl} ipucu="ör. 100" />
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed mt-3">
              Varsayılanlar yaygın erişkin karışımlarıdır; kurumdan kuruma değişir.
              Propofol hazır emülsiyon olarak gelir ve sulandırılmaz.
            </p>
          </div>
        </div>

        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
            {ilac.ad} · {ilac.sinif}
          </span>

          {!makul ? (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              {ilac.kiloyaGore ? "Ağırlık, doz ve torba karışımını girin." : "Doz ve torba karışımını girin."}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">Pompa hızı</span>
                  <div className="mt-1 text-3xl font-black text-white">{mlSaat}</div>
                  <p className="mt-1 text-[10px] text-blue-300">mL/saat</p>
                </div>
                <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">Saatlik doz</span>
                  <div className="mt-1 text-3xl font-black text-white">{mgSaat}</div>
                  <p className="mt-1 text-[10px] text-blue-300">mg/saat</p>
                </div>
                <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">Torba ömrü</span>
                  <div className="mt-1 text-3xl font-black text-white">{torbaSaat}</div>
                  <p className="mt-1 text-[10px] text-blue-300">saat</p>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-blue-200">
                {ilac.kiloyaGore ? `${kiloNum} kg × ` : ""}{dozNum} {ilac.dozBirimi}
                {ilac.zaman === "dakika" ? " × 60 dakika" : ""} · torba {torbaMgNum} mg /{" "}
                {torbaMlNum} mL = {yuvarla(derisimMikrogramMl / 1000, 2)} mg/mL.
              </p>

              {aralikDisi && (
                <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                  <strong>Girilen doz olağan aralığın dışında.</strong> {ilac.ad} için
                  olağan aralık {ilac.olagan[0]}–{ilac.olagan[1]} {ilac.dozBirimi}. Hesap
                  yine yapıldı — aralık dışı kullanım meşru olabilir, ama bilerek
                  seçilmiş olmalı.
                </p>
              )}

              <p className="text-[11px] leading-relaxed text-blue-200 border-t border-blue-800 pt-4">
                {ilac.not}
              </p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Araç sedasyon hedefi belirlemez.</strong>{" "}
            Hedef derinlik RASS ile konur ve günümüzde tercih edilen yaklaşım hafif
            sedasyondur; günlük sedasyon kesintisi ve ağrının sedasyondan ÖNCE
            giderilmesi ayrı kararlardır. Derin sedasyon mekanik ventilasyon süresini
            ve deliryumu artırır.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Doz aralıkları ve torba varsayılanları erişkin, yaygın protokollerdir ve
              tek yerde (ILACLAR bloğu) duruyor; kendi kurumunuzun protokolüyle
              karşılaştırın. Nöromüsküler blokerler bu araçta YOKTUR — onlar sedasyon
              değildir ve yeterli sedasyon sağlanmadan kullanılmaları hastayı uyanık
              ama hareketsiz bırakır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
