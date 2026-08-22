"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Digoksin toksisitesi — antidot (Fab) flakon sayısı.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ÜÇ AYRI FORMÜL, ÜÇÜ DE FARKLI GİRDİYE DAYANIYOR VE KARIŞTIRILMALARI
 * DOĞRUDAN DOZ HATASI:
 *
 *   düzey biliniyor   flakon = (ng/mL × kg) / 100
 *   alınan miktar     flakon = (mg × 0.8) / 0.5
 *   hiçbiri yok       ampirik — akut ve kronik zehirlenmede FARKLI
 *
 * Ampirik dozun akut ve kronik hâli birbirinin katı: akut aşırı alımda
 * 10-20 flakon, kronik toksisitede 3-6. Kronik hastaya akut dozu vermek
 * gereksiz, akut hastaya kronik dozu vermek YETERSİZ.
 *
 * FLAKON YUKARI YUVARLANIR. Yarım flakon diye bir şey yok; 4.2 hesabı
 * 5 flakon demektir. Aşağı yuvarlamak eksik nötralizasyon demek.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * FAB VERİLDİKTEN SONRA SERUM DİGOKSİN DÜZEYİ YORUMLANAMAZ: ölçüm bağlı
 * digoksini de sayıyor, TOPLAM düzey fırlıyor ama serbest düzey düşüyor.
 * "Düzey hâlâ yüksek" diye ikinci doz vermek bu yüzden yanlış — karar
 * klinik tabloya ve potasyuma bakar.
 */

type Kip = "duzey" | "miktar" | "ampirik";

/** Bir flakon bu kadar digoksini bağlar (mg). */
const FLAKON_BAGLAMA_MG = 0.5;
/** Ağızdan alınan digoksinin yaklaşık emilen oranı. */
const BIYOYARARLANIM = 0.8;
/** Düzey formülünün paydası (Vd ve birim dönüşümünü taşır). */
const DUZEY_PAYDA = 100;

/* Makullük sınırları — klinik sınır değil. Bunların dışında sayı BASILMAZ. */
const KILO_ALT = 20, KILO_UST = 300;
const DUZEY_ALT = 0.5, DUZEY_UST = 50;
const MIKTAR_ALT = 0.1, MIKTAR_UST = 100;

const KIPLER: { slug: Kip; ad: string; ozet: string }[] = [
  { slug: "duzey", ad: "Serum düzeyi biliniyor", ozet: "ng/mL ve kiloya göre" },
  { slug: "miktar", ad: "Alınan miktar biliniyor", ozet: "mg üzerinden, kilodan bağımsız" },
  { slug: "ampirik", ad: "Hiçbiri bilinmiyor", ozet: "ampirik — akut ve kronikte FARKLI" },
];

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

function AcKapa({
  id, etiket, aciklama, acik, degistir,
}: {
  id: string; etiket: string; aciklama: string; acik: boolean; degistir: (v: boolean) => void;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-pressed={acik}
      onClick={() => degistir(!acik)}
      className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition-all ${
        acik ? "bg-blue-900 border-blue-900" : "bg-white border-slate-200 hover:border-blue-900/30"
      }`}
    >
      <span className={`block text-[12px] font-black ${acik ? "text-white" : "text-blue-900"}`}>{etiket}</span>
      <span className={`block text-[10px] mt-0.5 leading-snug ${acik ? "text-blue-200" : "text-slate-600"}`}>
        {aciklama}
      </span>
    </button>
  );
}

export default function DigoksinToksisitesiSayfasi() {
  const [kip, setKip] = React.useState<Kip>("duzey");
  const [kilo, setKilo] = React.useState("");
  const [duzey, setDuzey] = React.useState("");
  const [miktar, setMiktar] = React.useState("");
  const [akut, setAkut] = React.useState(true);

  const kiloNum = parseLocaleNumber(kilo);
  const duzeyNum = parseLocaleNumber(duzey);
  const miktarNum = parseLocaleNumber(miktar);

  const kiloTamam = sayiGirildiMi(kilo) && kiloNum >= KILO_ALT && kiloNum <= KILO_UST;
  const duzeyTamam = sayiGirildiMi(duzey) && duzeyNum >= DUZEY_ALT && duzeyNum <= DUZEY_UST;
  const miktarTamam = sayiGirildiMi(miktar) && miktarNum >= MIKTAR_ALT && miktarNum <= MIKTAR_UST;

  /** Flakon YUKARI yuvarlanır ve en az 1 olur — yarım flakon yok. */
  const flakon = (ham: number) => Math.max(1, Math.ceil(ham));

  const duzeyHam = kiloTamam && duzeyTamam ? (duzeyNum * kiloNum) / DUZEY_PAYDA : null;
  const miktarHam = miktarTamam ? (miktarNum * BIYOYARARLANIM) / FLAKON_BAGLAMA_MG : null;

  const hazir =
    kip === "duzey" ? duzeyHam !== null : kip === "miktar" ? miktarHam !== null : true;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="digoksin-toksisitesi" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🫀</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Digoksin Toksisitesi
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Fab antidot flakon sayısı — üç ayrı formül
            </p>
          </div>
        </div>

        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">🛑</span>
          <div className="text-[12px] leading-relaxed text-rose-900 space-y-2">
            <p>
              <strong>Fab verildikten sonra serum digoksin düzeyi YORUMLANAMAZ.</strong>{" "}
              Ölçüm bağlı digoksini de sayar: toplam düzey fırlar, serbest düzey
              düşer. &ldquo;Düzey hâlâ yüksek&rdquo; diye ikinci doz vermek bu
              yüzden yanlıştır — karar klinik tabloya ve potasyuma bakar.
            </p>
            <p>
              <strong>Fab sonrası hipokalemi beklenir.</strong> Digoksin
              bağlanınca potasyum hücre içine geri döner; tedavi öncesi yüksek olan
              potasyum hızla düşebilir. Potasyum izlenir, ampirik kalsiyum
              verilmez.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3">
              Elinizde hangi bilgi var?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {KIPLER.map((k) => (
                <button
                  key={k.slug}
                  type="button"
                  aria-pressed={kip === k.slug}
                  onClick={() => setKip(k.slug)}
                  className={`text-left px-4 py-3 rounded-2xl border-2 transition-all ${
                    kip === k.slug ? "bg-blue-900 border-blue-900" : "bg-white border-slate-200 hover:border-blue-900/30"
                  }`}
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

          {kip === "duzey" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
              <SayiAlani id="dg-duzey" etiket="Serum digoksin" birim="ng/mL" deger={duzey} ayarla={setDuzey} ipucu="ör. 4.5" />
              <SayiAlani id="dg-kilo" etiket="Ağırlık" birim="kg" deger={kilo} ayarla={setKilo} ipucu="ör. 70" />
            </div>
          )}

          {kip === "miktar" && (
            <div className="pt-4 border-t border-slate-100">
              <SayiAlani id="dg-miktar" etiket="Alınan toplam digoksin" birim="mg" deger={miktar} ayarla={setMiktar} ipucu="ör. 5" />
              <p className="text-[11px] text-slate-700 leading-relaxed mt-3">
                Bu formül kilodan bağımsızdır — alınan miktar zaten toplam vücut
                yükünü veriyor. Miktar tahminî ise sonucu ALT SINIR say; şüphede
                ampirik doza geç.
              </p>
            </div>
          )}

          {kip === "ampirik" && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <AcKapa
                id="dg-akut"
                etiket={akut ? "Akut aşırı alım" : "Kronik toksisite"}
                aciklama={
                  akut
                    ? "Tek seferde yüksek doz — genellikle genç, kalbi sağlam hasta"
                    : "Birikerek gelişmiş — genellikle yaşlı, böbrek işlevi bozulmuş hasta"
                }
                acik={akut}
                degistir={setAkut}
              />
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Bu iki durumun ampirik dozu birbirinin katı. Ayrım yaşa değil
                ÖYKÜYE dayanır: tek seferlik yüksek alım mı, yoksa günlerdir
                süren birikme mi?
              </p>
            </div>
          )}
        </div>

        {hazir ? (
          <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
              {KIPLER.find((k) => k.slug === kip)!.ad}
            </span>

            {kip === "duzey" && duzeyHam !== null && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Kutu etiket="Fab" deger={`${flakon(duzeyHam)} flakon`} alt="yukarı yuvarlandı" />
                  <Kutu etiket="Ham hesap" deger={duzeyHam.toFixed(2)} alt={`(${duzeyNum} × ${kiloNum}) / ${DUZEY_PAYDA}`} />
                  <Kutu etiket="Sonrası" deger="düzey ölçme" alt="Fab sonrası yorumlanamaz" />
                </div>
                <p className="text-[11px] leading-relaxed text-blue-200">
                  Düzey, son dozdan en az 6 saat sonra alınmış olmalı. Erken alınan
                  örnek dağılım tamamlanmadan ölçüldüğü için OLDUĞUNDAN YÜKSEK
                  çıkar ve gereksiz fazla flakon hesaplatır.
                </p>
              </>
            )}

            {kip === "miktar" && miktarHam !== null && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Kutu etiket="Fab" deger={`${flakon(miktarHam)} flakon`} alt="yukarı yuvarlandı" />
                  <Kutu etiket="Ham hesap" deger={miktarHam.toFixed(2)} alt={`(${miktarNum} × ${BIYOYARARLANIM}) / ${FLAKON_BAGLAMA_MG}`} />
                  <Kutu etiket="Kilo" deger="gerekmez" alt="miktar toplam yükü verir" />
                </div>
                <p className="text-[11px] leading-relaxed text-blue-200">
                  Emilen oran {BIYOYARARLANIM}, bir flakonun bağladığı miktar{" "}
                  {FLAKON_BAGLAMA_MG} mg olarak alınmıştır.
                </p>
              </>
            )}

            {kip === "ampirik" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Kutu
                    etiket="Fab"
                    deger={akut ? "10–20 flakon" : "3–6 flakon"}
                    alt={akut ? "akut aşırı alım" : "kronik toksisite"}
                  />
                  <Kutu etiket="Kardiyak arrest" deger="20 flakon" alt="durum ne olursa olsun" />
                  <Kutu etiket="Yeniden değerlendir" deger="30–60 dk" alt="yanıt yoksa tekrar" />
                </div>
                <p className="text-[11px] leading-relaxed text-blue-200">
                  Ampirik doz, düzey ya da miktar bilinmediğinde kullanılır.
                  Stabil hastada alt sınırdan başlayıp klinik yanıta göre
                  tekrarlamak, bütün dozu peşin vermekten yaygın bir yaklaşımdır.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[12px] font-black text-slate-600">
              {kip === "duzey"
                ? `Serum digoksin (${DUZEY_ALT}–${DUZEY_UST} ng/mL) ve ağırlık girin.`
                : `Alınan toplam miktarı girin (${MIKTAR_ALT}–${MIKTAR_UST} mg).`}
            </p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Antidot kararı sayıyla verilmez.</strong>{" "}
            Fab endikasyonu hayatı tehdit eden aritmi, hemodinamik bozukluk ve
            toksisiteye bağlı hiperkalemidir; yüksek bir düzey tek başına yeterli
            değildir. Bu araç yalnızca endikasyon konduktan sonraki aritmetiği
            yapar.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Katsayılar erişkin, yaygın protokollerdir; kendi kurumunuzun
              protokolüyle karşılaştırın. Ürünler arasında flakon başına bağlama
              kapasitesi değişebilir — elinizdeki ürünün prospektüsünü doğrulayın,
              çünkü bu sayı doğrudan flakon adedini belirliyor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
