"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * IV magnezyum — endikasyona göre doz, sulandırma, süre ve pompa hızı.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ARACIN TAŞIDIĞI ASIL AYRIM: AYNI İLACIN ACİL VE REPLASMAN HIZLARI ZITTIR.
 *
 * Torsades'de magnezyum dakikalar içinde verilir — geciktirmek hastayı
 * kaybettirir. Replasmanda ise HIZLI VERMEK ETKİSİZDİR: serum düzeyi geçici
 * olarak yükselir, böbrek fazlasını hemen atar ve hücre içi açık kapanmaz.
 * Aynı 2 gram, endikasyona göre 2 dakikada ya da 2 saatte verilir.
 *
 * Bu yüzden araç tek bir "doz" basmıyor; endikasyonun kendi BASAMAKLARINI
 * (yükleme + idame) ayrı ayrı gösteriyor ve her basamağın süresini yazıyor.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Obstetrik protokoller (preeklampsi/eklampsi) BİLEREK KAPSAM DIŞI: yükleme
 * ve idame değerleri farklı, izlem obstetri kliniğinin sorumluluğunda ve
 * yanlış protokolü uygulamak hiç uygulamamaktan kötü.
 */

/** 1 g MgSO₄·7H₂O = 8.12 mEq = 4.06 mmol magnezyum. */
const MEQ_PER_G = 8.12;
const MMOL_PER_G = 4.06;

type Basamak = {
  ad: string;
  gram: number;
  /** Süre dakika cinsinden. */
  dakika: number;
  /** Varsayılan sulandırma hacmi (mL). */
  hacimMl: number;
  aciklama: string;
};

type Endikasyon = {
  slug: string;
  ad: string;
  ozet: string;
  basamaklar: Basamak[];
  /** Bu endikasyonda hız neden böyle — kullanıcı kararı doğrulayabilsin diye. */
  hizGerekce: string;
  uyari?: string;
};

const ENDIKASYONLAR: Endikasyon[] = [
  {
    slug: "torsades",
    ad: "Torsades de pointes",
    ozet: "Magnezyuma duyarlı polimorfik VT — düzey normal olsa bile verilir",
    basamaklar: [
      {
        ad: "Acil doz",
        gram: 2,
        dakika: 2,
        hacimMl: 10,
        aciklama:
          "Nabızsızsa sulandırılmadan hızlı puşe edilebilir. Nabız varsa 10 mL içinde 1–2 dakikada verilir; yanıt yoksa doz 5–15 dakika sonra tekrarlanır.",
      },
      {
        ad: "İdame (yanıt sonrası, gerekirse)",
        gram: 4,
        dakika: 360,
        hacimMl: 250,
        aciklama:
          "Tekrarlayan ataklarda sürekli infüzyon düşünülür (yaklaşık 3–20 mg/dk). Düzey ve derin tendon refleksleri izlenir.",
      },
    ],
    hizGerekce:
      "Burada hız BİLEREK yüksek: torsades'de gecikme aritmiyi sürdürür. Bu, aracın en hızlı uygulama basamağıdır ve yalnızca bu endikasyona aittir.",
    uyari:
      "Torsades'de magnezyum, serum magnezyumu NORMAL olsa bile verilir. Aynı anda QT uzatan ilaçlar kesilir ve potasyum 4.5–5 mEq/L hedefine çekilir.",
  },
  {
    slug: "agir-semptomatik",
    ad: "Ağır / semptomatik hipomagnezemi",
    ozet: "Tetani, nöbet, aritmi ya da Mg < 1 mg/dL",
    basamaklar: [
      {
        ad: "Yükleme",
        gram: 2,
        dakika: 30,
        hacimMl: 100,
        aciklama:
          "Semptom varsa 15–60 dakikada verilir. Nöbet ya da aritmi varsa süre kısaltılır.",
      },
      {
        ad: "İdame",
        gram: 6,
        dakika: 720,
        hacimMl: 500,
        aciklama:
          "Yüklemenin ardından 12–24 saate yayılan sürekli infüzyon. Toplam vücut açığı günler sürer; tek doz yeterli olmaz.",
      },
    ],
    hizGerekce:
      "İdame bilerek YAVAŞ: hızlı verilen magnezyumun büyük kısmı idrarla atılır ve hücre içi açık kapanmaz. Replasmanda süre, dozdan daha belirleyicidir.",
    uyari:
      "Dirençli hipokalemi ve hipokalsemi magnezyum düzeltilmeden düzelmez. Magnezyum ölçümü hücre içi açığı göstermez; normal düzey açık olmadığı anlamına gelmez.",
  },
  {
    slug: "hafif-orta",
    ad: "Asemptomatik / hafif-orta hipomagnezemi",
    ozet: "Semptom yok, hasta oral alabiliyorsa öncelik oral yoldur",
    basamaklar: [
      {
        ad: "Tek infüzyon",
        gram: 2,
        dakika: 120,
        hacimMl: 250,
        aciklama:
          "1–2 saatte verilir. Düzey ertesi gün kontrol edilir; açık kapanmadıysa tekrarlanır.",
      },
    ],
    hizGerekce:
      "Acil değil, o yüzden en yavaş basamak. Bir saatin altına inmek renal kaybı artırır, kazanç sağlamaz.",
    uyari:
      "Hasta oral alabiliyor ve emilim sorunu yoksa oral replasman tercih edilir; IV yol gereksiz damar yolu ve maliyet demektir. Oral magnezyumun sık yan etkisi ishaldir ve ishal açığı derinleştirir.",
  },
  {
    slug: "astim",
    ad: "Ağır astım atağı",
    ozet: "Standart tedaviye yanıtsız ağır atakta ek tedavi",
    basamaklar: [
      {
        ad: "Tek doz",
        gram: 2,
        dakika: 20,
        hacimMl: 100,
        aciklama:
          "20 dakikada tek doz. Bronkodilatör ve sistemik steroidin YERİNE değil, onlara EK olarak verilir.",
      },
    ],
    hizGerekce:
      "Yirmi dakika, çalışmalarda kullanılan süredir; daha hızlı vermek hipotansiyon riskini artırır ve ek yarar göstermemiştir.",
  },
];

const yuvarla = (n: number, b = 1) => Math.round(n * 10 ** b) / 10 ** b;

/**
 * MODÜL DÜZEYİNDE — sayfa içinde tanımlanırsa React her render'da <input>u
 * söküp yeniden takar ve kullanıcı her rakamdan sonra odağı kaybeder (bu
 * depoda ölçülmüş, 14 araçta düzeltilmiş bir kusur).
 */
function SayiAlani({
  id,
  etiket,
  birim,
  deger,
  ayarla,
  ipucu,
}: {
  id: string;
  etiket: string;
  birim: string;
  deger: string;
  ayarla: (v: string) => void;
  ipucu?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2"
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
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">
          {birim}
        </span>
      </div>
    </div>
  );
}

function sureYaz(dakika: number) {
  if (dakika < 60) return `${dakika} dakika`;
  const saat = dakika / 60;
  return Number.isInteger(saat) ? `${saat} saat` : `${yuvarla(saat, 1)} saat`;
}

export default function MagnezyumInfuzyonSayfasi() {
  const [secili, setSecili] = React.useState(ENDIKASYONLAR[0].slug);
  const [bobrek, setBobrek] = React.useState(false);
  const [ampulG, setAmpulG] = React.useState("1.5");

  const end = ENDIKASYONLAR.find((e) => e.slug === secili)!;

  /**
   * Böbrek yetmezliğinde doz yarıya iner. Magnezyum neredeyse tümüyle böbrekle
   * atılır; aynı doz burada çok daha yüksek ve daha uzun süren serum düzeyi
   * yapar.
   */
  const carpan = bobrek ? 0.5 : 1;

  const ampulNum = parseLocaleNumber(ampulG);
  const ampulMakul = ampulG.trim() !== "" && ampulNum > 0 && ampulNum <= 10;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="magnezyum-infuzyon" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">
                ☀️
              </span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Magnezyum İnfüzyonu
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Endikasyona göre doz, süre ve pompa hızı
            </p>
          </div>
        </div>

        {/* HER DURUMDA GÖRÜNÜR: hızın kendisi bir güvenlik parametresi */}
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">
            🛑
          </span>
          <p className="text-[12px] leading-relaxed text-rose-900">
            <strong>Magnezyumda doz kadar HIZ da izlenir.</strong> Hızlı verilen
            magnezyum hipotansiyon, yüz kızarması, derin tendon reflekslerinin
            kaybı ve solunum baskılanmasına yol açar. Refleks kaybı, ilerleyen
            toksisitenin ilk uyarısıdır — infüzyon durdurulur. Antidot IV
            kalsiyum glukonattır.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg" aria-hidden="true">
            ⚠️
          </span>
          <p className="text-[12px] leading-relaxed text-amber-900">
            <strong>Aynı ilacın acil ve replasman hızları zıttır.</strong>{" "}
            Torsades&apos;de 2 gram dakikalar içinde verilir; replasmanda aynı 2
            gram saatlere yayılır. Hızlı verilen magnezyumun büyük kısmı idrarla
            atılır ve hücre içi açık kapanmaz. Endikasyonu doğru seçmek, dozu
            doğru seçmekten önce gelir.
          </p>
        </div>

        {/* ── Endikasyon ────────────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3">
              Endikasyon
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ENDIKASYONLAR.map((e) => (
                <button
                  key={e.slug}
                  type="button"
                  aria-pressed={secili === e.slug}
                  onClick={() => setSecili(e.slug)}
                  className={`text-left px-4 py-3 rounded-2xl border-2 transition-all
                    ${
                      secili === e.slug
                        ? "bg-blue-900 border-blue-900 text-white shadow-lg shadow-blue-900/20"
                        : "bg-white border-slate-200 hover:border-blue-900/30"
                    }`}
                >
                  <span
                    className={`block text-[12px] font-black ${secili === e.slug ? "text-white" : "text-blue-900"}`}
                  >
                    {e.ad}
                  </span>
                  <span
                    className={`block text-[10px] mt-0.5 leading-snug ${secili === e.slug ? "text-blue-200" : "text-slate-600"}`}
                  >
                    {e.ozet}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
            <SayiAlani
              id="mg-ampul"
              etiket="Ampul içeriği"
              birim="g"
              deger={ampulG}
              ayarla={setAmpulG}
              ipucu="ör. 1.5"
            />
            <div className="flex items-end">
              <label className="flex items-start gap-3 cursor-pointer rounded-lg focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2 w-full">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={bobrek}
                  onChange={() => setBobrek((b) => !b)}
                />
                <div
                  aria-hidden="true"
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${bobrek ? "bg-blue-900 border-blue-900" : "border-slate-300 bg-white"}`}
                >
                  {bobrek && (
                    <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white">
                      <path d="M1 4l3 3 5-6" />
                    </svg>
                  )}
                </div>
                <span className="text-[12px] font-bold text-blue-900 leading-snug">
                  Böbrek yetmezliği var
                  <span className="block text-[10px] font-normal text-slate-600 mt-0.5">
                    Dozu yarıya indirir — magnezyum neredeyse tümüyle böbrekle atılır
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {bobrek && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4" role="status">
            <p className="text-[12px] leading-relaxed text-amber-900">
              <strong>Dozlar yarıya indirildi.</strong> Böbrek yetmezliğinde
              magnezyum birikir; düzey ve derin tendon refleksleri daha sık
              kontrol edilir. Ağır yetmezlikte replasman kararı ve miktarı
              nefroloji ile birlikte verilir — magnezyum diyalizle uzaklaştırılabilir.
            </p>
          </div>
        )}

        {/* ── Protokol ──────────────────────────────────── */}
        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
            {end.ad}
          </span>

          {end.basamaklar.map((b, i) => {
            const gram = yuvarla(b.gram * carpan, 2);
            const mEq = yuvarla(gram * MEQ_PER_G, 1);
            const mmol = yuvarla(gram * MMOL_PER_G, 1);
            const hizMlSaat = yuvarla((b.hacimMl / b.dakika) * 60, 0);
            const ampulSayisi = ampulMakul ? yuvarla(gram / ampulNum, 2) : null;
            return (
              <div
                key={b.ad}
                className="bg-blue-950/50 rounded-2xl p-5 border border-blue-800 space-y-3"
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">
                    {i + 1}. {b.ad}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">
                      Doz
                    </span>
                    <div className="text-3xl font-black text-white">{gram} g</div>
                    <p className="text-[10px] text-blue-300 mt-0.5">
                      {mEq} mEq · {mmol} mmol
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">
                      Sulandırma ve süre
                    </span>
                    <div className="text-3xl font-black text-white">{b.hacimMl} mL</div>
                    <p className="text-[10px] text-blue-300 mt-0.5">{sureYaz(b.dakika)} içinde</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">
                      Pompa hızı
                    </span>
                    <div className="text-3xl font-black text-white">{hizMlSaat}</div>
                    <p className="text-[10px] text-blue-300 mt-0.5">mL/saat</p>
                  </div>
                </div>

                {ampulSayisi !== null && (
                  <p className="text-[11px] text-blue-200">
                    {ampulNum} g&apos;lık ampulden <strong>{ampulSayisi} ampul</strong>.
                  </p>
                )}
                {!ampulMakul && (
                  <p className="text-[11px] text-amber-300">
                    Ampul içeriğini gram olarak girin — kaç ampul gerektiği o zaman yazılır.
                  </p>
                )}

                <p className="text-[11px] leading-relaxed text-blue-200">{b.aciklama}</p>
              </div>
            );
          })}

          <p className="text-[11px] leading-relaxed text-blue-200 border-t border-blue-800 pt-4">
            <strong className="text-white">Hız neden böyle:</strong> {end.hizGerekce}
          </p>

          {end.uyari && (
            <p className="text-[11px] leading-relaxed text-amber-200">
              <strong>Dikkat:</strong> {end.uyari}
            </p>
          )}
        </div>

        {/* ── Alt bilgi ─────────────────────────────────── */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { e: "1 g MgSO₄", v: `${MEQ_PER_G} mEq` },
              { e: "1 g MgSO₄", v: `${MMOL_PER_G} mmol` },
              { e: "Hedef serum", v: "1.8–2.4 mg/dL" },
            ].map((k) => (
              <div key={k.e + k.v} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">
                  {k.e}
                </span>
                <span className="text-base font-black text-blue-900">{k.v}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Birlikte bakılacaklar:</strong> dirençli
            hipokalemi ve hipokalsemi magnezyum düzeltilmeden düzelmez — sıra
            magnezyumdan başlar. Serum magnezyumu hücre içi açığı göstermez;
            normal bir düzey, açık olmadığı anlamına gelmez. Proton pompası
            inhibitörleri, diüretikler, aminoglikozidler, amfoterisin B,
            sisplatin ve kalsinörin inhibitörleri süregelen kayıp yapar; ilaç
            listesi gözden geçirilmeden replasman tekrarlayıp durur.
          </p>

          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>

          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">
              ⚠️
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Buradaki değerler erişkin, obstetrik olmayan yaygın protokollerdir;
              kendi kurumunuzun protokolüyle karşılaştırın.{" "}
              <strong className="text-blue-900">
                Preeklampsi ve eklampsi protokolleri kapsam dışıdır
              </strong>{" "}
              — yükleme ve idame değerleri farklıdır, izlem obstetri kliniğinin
              sorumluluğundadır. Hazır karışım kullanıyorsanız derişim sabittir;
              o zaman yalnızca süre ve hız geçerlidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
