"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * IV fosfat replasmanı — doz, zorunlu ko-iyon yükü, süre ve pompa hızı.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ARACIN VARLIK SEBEBİ: FOSFATI TEK BAŞINA VEREMEZSİN.
 *
 * IV fosfat ya potasyum ya sodyum tuzu olarak gelir, yani her fosfat dozu
 * yanında ZORUNLU bir ko-iyon yükü taşır:
 *   potasyum fosfat: 1 mL = 3 mmol fosfat + 4.4 mEq K⁺
 *   sodyum fosfat:   1 mL = 3 mmol fosfat + 4.0 mEq Na⁺
 *
 * 35 mmol fosfat, potasyum tuzuyla verilirse yanında ~51 mEq POTASYUM gelir.
 * Bu, olağan bir potasyum replasman dozundan fazladır ve çoğu zaman fark
 * edilmez, çünkü istem "fosfat" diye yazılır.
 *
 * İKİNCİ VE DAHA SİNSİ SONUÇ — SINIRI FOSFAT DEĞİL POTASYUM BELİRLEYEBİLİR.
 * Potasyumun kendi hız ve derişim tavanları var (periferik 10 mEq/saat,
 * 40 mEq/L). Yüksek fosfat dozlarında bu tavanlar fosfatın kendi tavanından
 * ÖNCE devreye giriyor; yani infüzyon süresini ve gereken sulandırma
 * hacmini potasyum belirliyor. Araç hangi sınırın bağladığını açıkça yazıyor.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Tuz seçimi bir HASTA kararıdır: hiperkalemide potasyum tuzu, hipernatremi
 * ya da hacim yükünde sodyum tuzu uygun değildir. Araç seçmez, seçimin
 * sonucunu gösterir.
 */

type TuzSlug = "potasyum" | "sodyum";

const TUZLAR: Record<
  TuzSlug,
  {
    ad: string;
    kisa: string;
    koIyon: string;
    /** Konsantre çözeltide 1 mL'deki fosfat (mmol). */
    mmolPerMl: number;
    /** 1 mmol fosfat başına gelen ko-iyon (mEq). */
    koIyonPerMmol: number;
    not: string;
  }
> = {
  potasyum: {
    ad: "Potasyum fosfat",
    kisa: "K-fosfat",
    koIyon: "K⁺",
    mmolPerMl: 3,
    koIyonPerMmol: 4.4 / 3,
    not: "Hipofosfatemiye çoğu zaman hipokalemi eşlik ettiği için sık tercih edilir. Hiperkalemide, böbrek yetmezliğinde ve potasyum tutucu ilaç alan hastada uygun DEĞİLDİR.",
  },
  sodyum: {
    ad: "Sodyum fosfat",
    kisa: "Na-fosfat",
    koIyon: "Na⁺",
    mmolPerMl: 3,
    koIyonPerMmol: 4 / 3,
    not: "Potasyumun sakıncalı olduğu durumlarda seçilir. Hipernatremi, kalp yetmezliği ve hacim yükünde sodyum yükü göz önünde tutulur.",
  },
};

/** Potasyumun kendi tavanları — potasyum replasmanı aracıyla AYNI değerler. */
const K_SINIRLARI = {
  periferik: { derisimMeqL: 40, hizMeqSaat: 10 },
  santral: { derisimMeqL: 100, hizMeqSaat: 20 },
};

/** Fosfatın kendi hız tavanı (yaygın, korumacı değer). */
const FOSFAT_MAX_MMOL_SAAT = 7.5;

/** Tek dozda yaygın olarak aşılmayan fosfat miktarı — sessizce kırpılmıyor, söyleniyor. */
const TEK_DOZ_UYARI_MMOL = 45;

type Agirlik = {
  slug: string;
  ad: string;
  esik: string;
  mmolKg: number;
  aralik: [number, number];
};

const AGIRLIKLAR: Agirlik[] = [
  { slug: "hafif", ad: "Hafif", esik: "P 2.0–2.5 mg/dL", mmolKg: 0.16, aralik: [0.08, 0.24] },
  { slug: "orta", ad: "Orta", esik: "P 1.0–2.0 mg/dL", mmolKg: 0.32, aralik: [0.16, 0.48] },
  { slug: "agir", ad: "Ağır", esik: "P < 1.0 mg/dL", mmolKg: 0.64, aralik: [0.32, 0.8] },
];

const yuvarla = (n: number, b = 1) => Math.round(n * 10 ** b) / 10 ** b;

/**
 * MODÜL DÜZEYİNDE — sayfa içinde tanımlanırsa React her render'da <input>u
 * söküp yeniden takar ve kullanıcı her rakamdan sonra odağı kaybeder.
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
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-24 text-xl font-black text-blue-900 focus:border-blue-900 outline-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">
          {birim}
        </span>
      </div>
    </div>
  );
}

function Secim({
  etiket,
  secenekler,
  deger,
  ayarla,
}: {
  etiket: string;
  secenekler: { slug: string; ad: string; alt?: string }[];
  deger: string;
  ayarla: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">
        {etiket}
      </span>
      <div className="flex flex-wrap gap-2">
        {secenekler.map((s) => (
          <button
            key={s.slug}
            type="button"
            aria-pressed={deger === s.slug}
            onClick={() => ayarla(s.slug)}
            className={`text-left px-4 py-3 rounded-2xl border-2 transition-all flex-1 min-w-[8rem]
              ${
                deger === s.slug
                  ? "bg-blue-900 border-blue-900 shadow-lg shadow-blue-900/20"
                  : "bg-white border-slate-200 hover:border-blue-900/30"
              }`}
          >
            <span
              className={`block text-[12px] font-black ${deger === s.slug ? "text-white" : "text-blue-900"}`}
            >
              {s.ad}
            </span>
            {s.alt && (
              <span
                className={`block text-[10px] mt-0.5 leading-snug ${deger === s.slug ? "text-blue-200" : "text-slate-600"}`}
              >
                {s.alt}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FosfatReplasmanSayfasi() {
  const [kilo, setKilo] = React.useState("");
  const [agirlikSlug, setAgirlikSlug] = React.useState("orta");
  const [tuz, setTuz] = React.useState<TuzSlug>("potasyum");
  const [yol, setYol] = React.useState<"periferik" | "santral">("periferik");

  const derece = AGIRLIKLAR.find((a) => a.slug === agirlikSlug)!;
  const [mmolKg, setMmolKg] = React.useState(String(derece.mmolKg));
  const t = TUZLAR[tuz];

  const dereceSec = (slug: string) => {
    const d = AGIRLIKLAR.find((a) => a.slug === slug)!;
    setAgirlikSlug(slug);
    setMmolKg(String(d.mmolKg));
  };

  const kiloNum = parseLocaleNumber(kilo);
  const mmolKgNum = parseLocaleNumber(mmolKg);

  const makul =
    kilo.trim() !== "" &&
    kiloNum >= 20 &&
    kiloNum <= 300 &&
    mmolKg.trim() !== "" &&
    mmolKgNum > 0 &&
    mmolKgNum <= 2;

  // ── Doz ve ko-iyon ─────────────────────────────────────────────────
  const toplamMmol = makul ? yuvarla(kiloNum * mmolKgNum, 1) : 0;
  const konsantreMl = makul ? yuvarla(toplamMmol / t.mmolPerMl, 1) : 0;
  const koIyonMeq = makul ? yuvarla(toplamMmol * t.koIyonPerMmol, 1) : 0;

  // ── Sınırlar: fosfatınki mi, potasyumunki mi? ──────────────────────
  const k = K_SINIRLARI[yol];
  const potasyumTuzu = tuz === "potasyum";

  const fosfatSaat = makul ? toplamMmol / FOSFAT_MAX_MMOL_SAAT : 0;
  const potasyumSaat = makul && potasyumTuzu ? koIyonMeq / k.hizMeqSaat : 0;
  const baglayanSaat = Math.max(fosfatSaat, potasyumSaat);
  const potasyumBagliyor = potasyumTuzu && potasyumSaat > fosfatSaat;

  /** Potasyum derişim tavanı en az sulandırma hacmini belirliyor. */
  const enAzHacimMl = makul && potasyumTuzu ? Math.round((koIyonMeq / k.derisimMeqL) * 1000) : 0;
  const hacimMl = Math.max(enAzHacimMl, 100);
  const pompaMlSaat = makul && baglayanSaat > 0 ? Math.round(hacimMl / baglayanSaat) : 0;

  const dozAralikDisi = makul && (mmolKgNum < derece.aralik[0] || mmolKgNum > derece.aralik[1]);
  const tekDozYuksek = makul && toplamMmol > TEK_DOZ_UYARI_MMOL;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="fosfat-replasman" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🧬</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">
                ☀️
              </span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Fosfat Replasmanı
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Doz · zorunlu ko-iyon yükü · süreyi hangi sınır belirliyor
            </p>
          </div>
        </div>

        {/* HER DURUMDA GÖRÜNÜR */}
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">
            🛑
          </span>
          <div className="text-[12px] leading-relaxed text-rose-900 space-y-2">
            <p>
              <strong>Fosfatı tek başına veremezsin.</strong> IV fosfat ya
              potasyum ya sodyum tuzudur; her doz yanında zorunlu bir ko-iyon
              yükü taşır. İstem &ldquo;fosfat&rdquo; diye yazıldığı için bu yük
              çoğu zaman fark edilmez.
            </p>
            <p>
              <strong>
                Kalsiyum içeren sıvılarla aynı yoldan aynı anda verilmez
              </strong>{" "}
              — kalsiyum-fosfat çökeltisi oluşur. Ringer laktat kalsiyum içerir.
              Aynı yol kullanılacaksa arada serum fizyolojikle yıkanır.
            </p>
          </div>
        </div>

        {/* ── Girdiler ──────────────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <Secim
            etiket="Hipofosfateminin ağırlığı"
            deger={agirlikSlug}
            ayarla={dereceSec}
            secenekler={AGIRLIKLAR.map((a) => ({ slug: a.slug, ad: a.ad, alt: a.esik }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SayiAlani id="p-kilo" etiket="Ağırlık" birim="kg" deger={kilo} ayarla={setKilo} ipucu="ör. 70" />
            <SayiAlani
              id="p-mmolkg"
              etiket="Doz"
              birim="mmol/kg"
              deger={mmolKg}
              ayarla={setMmolKg}
              ipucu={`${derece.aralik[0]}–${derece.aralik[1]}`}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-5">
            <Secim
              etiket="Tuz — hasta kararı"
              deger={tuz}
              ayarla={(v) => setTuz(v as TuzSlug)}
              secenekler={(Object.keys(TUZLAR) as TuzSlug[]).map((s) => ({
                slug: s,
                ad: TUZLAR[s].ad,
                alt: `1 mL = ${TUZLAR[s].mmolPerMl} mmol + ${yuvarla(TUZLAR[s].mmolPerMl * TUZLAR[s].koIyonPerMmol, 1)} mEq ${TUZLAR[s].koIyon}`,
              }))}
            />
            <p className="text-[11px] text-slate-700 leading-relaxed">{t.not}</p>

            <Secim
              etiket="Uygulama yolu"
              deger={yol}
              ayarla={(v) => setYol(v as "periferik" | "santral")}
              secenekler={[
                { slug: "periferik", ad: "Periferik", alt: "K⁺ tavanı 40 mEq/L · 10 mEq/saat" },
                { slug: "santral", ad: "Santral", alt: "K⁺ tavanı 100 mEq/L · 20 mEq/saat" },
              ]}
            />
            {!potasyumTuzu && (
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Sodyum tuzunda potasyum tavanları geçerli değil; süreyi fosfatın
                kendi hız sınırı belirliyor. Yol seçimi yine de damar
                dayanıklılığı açısından önemlidir.
              </p>
            )}
          </div>
        </div>

        {/* ── Sonuç ─────────────────────────────────────── */}
        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
            {derece.ad} hipofosfatemi · {t.ad} · {yol === "periferik" ? "periferik" : "santral"}
          </span>

          {!makul ? (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              Hastanın ağırlığını ve mmol/kg dozunu girin.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">
                    Toplam fosfat
                  </span>
                  <div className="mt-1 text-3xl font-black text-white">{toplamMmol} mmol</div>
                  <p className="mt-1 text-[10px] text-blue-300">
                    konsantreden {konsantreMl} mL
                  </p>
                </div>
                <div
                  className={`rounded-2xl p-4 border ${potasyumTuzu ? "bg-amber-500/20 border-amber-400" : "bg-blue-950/50 border-blue-800"}`}
                >
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest block ${potasyumTuzu ? "text-amber-200" : "text-blue-300"}`}
                  >
                    Zorunlu {t.koIyon} yükü
                  </span>
                  <div className="mt-1 text-3xl font-black text-white">{koIyonMeq} mEq</div>
                  <p
                    className={`mt-1 text-[10px] ${potasyumTuzu ? "text-amber-200" : "text-blue-300"}`}
                  >
                    fosfatla birlikte gelir
                  </p>
                </div>
                <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">
                    En kısa süre
                  </span>
                  <div className="mt-1 text-3xl font-black text-white">
                    {yuvarla(baglayanSaat, 1)} saat
                  </div>
                  <p className="mt-1 text-[10px] text-blue-300">
                    en az {hacimMl} mL içinde · {pompaMlSaat} mL/saat
                  </p>
                </div>
              </div>

              {/* SÜREYİ HANGİ SINIR BELİRLİYOR — aracın asıl cevabı */}
              <div
                className={`rounded-2xl p-4 border-2 ${potasyumBagliyor ? "bg-amber-500/20 border-amber-400" : "bg-blue-950/50 border-blue-800"}`}
                role="status"
              >
                <span className="text-[9px] font-black uppercase tracking-widest block text-blue-200">
                  Süreyi hangi sınır belirliyor
                </span>
                {potasyumTuzu ? (
                  <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-blue-100">
                    <p>
                      Fosfat tavanı ({FOSFAT_MAX_MMOL_SAAT} mmol/saat) →{" "}
                      <strong className="text-white">{yuvarla(fosfatSaat, 1)} saat</strong>
                    </p>
                    <p>
                      Potasyum tavanı ({k.hizMeqSaat} mEq/saat) →{" "}
                      <strong className="text-white">{yuvarla(potasyumSaat, 1)} saat</strong>
                    </p>
                    <p className={potasyumBagliyor ? "text-amber-200 font-bold" : "text-blue-200"}>
                      {potasyumBagliyor
                        ? `Bağlayan sınır POTASYUM. Fosfatın kendi tavanına bakmak bu dozda yanıltıcı olur — infüzyon ${yuvarla(potasyumSaat, 1)} saatten kısa sürmemeli.`
                        : "Bağlayan sınır fosfat. Bu dozda potasyum tavanı aşılmıyor."}
                    </p>
                    <p className="text-blue-200">
                      Potasyum derişim tavanı ({k.derisimMeqL} mEq/L) en az{" "}
                      <strong className="text-white">{enAzHacimMl} mL</strong> sulandırma
                      gerektiriyor.
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] leading-relaxed text-blue-100">
                    Sodyum tuzunda potasyum tavanları geçerli değil; süreyi
                    fosfatın kendi hız sınırı ({FOSFAT_MAX_MMOL_SAAT} mmol/saat)
                    belirliyor →{" "}
                    <strong className="text-white">{yuvarla(fosfatSaat, 1)} saat</strong>.
                  </p>
                )}
              </div>

              <p className="text-[11px] leading-relaxed text-blue-200">
                {kiloNum} kg × {mmolKgNum} mmol/kg = {toplamMmol} mmol fosfat. Bunlar
                TAVAN değerleridir: daha yavaş ve daha seyreltik vermek her zaman
                güvenli yöndedir.
              </p>

              {dozAralikDisi && (
                <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                  <strong>Girilen doz bu ağırlık derecesi için olağan aralığın dışında.</strong>{" "}
                  {derece.ad} hipofosfatemide olağan aralık {derece.aralik[0]}–
                  {derece.aralik[1]} mmol/kg. Hesap yine yapıldı.
                </p>
              )}
              {tekDozYuksek && (
                <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                  <strong>Tek doz {toplamMmol} mmol.</strong> Pek çok protokol tek
                  seferde {TEK_DOZ_UYARI_MMOL} mmol üzerine çıkmaz ve dozu bölerek
                  ara ölçümle tekrarlar. Sayı sessizce kırpılmadı — kararı siz
                  verin.
                </p>
              )}
            </>
          )}
        </div>

        {/* ── Alt bilgi ─────────────────────────────────── */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Birlikte bakılacaklar:</strong> fosfat
            verirken serum <strong>kalsiyumu düşebilir</strong>; hipokalsemik
            hastada bu tetaniyi tetikleyebilir, kalsiyum önce düzeltilir.{" "}
            <strong className="text-blue-900">Böbrek yetmezliğinde</strong> fosfat
            atılımı bozuktur; aynı doz çok daha yüksek serum yanıtı verir ve doz
            azaltılır. Yeniden beslenme sendromunda hipofosfatemi beklenen bir
            bulgudur — orada replasman kadar beslenme hızını yavaşlatmak da
            tedavinin parçasıdır.
          </p>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Oral yol küçümsenmemeli:</strong> hasta
            oral alabiliyor ve fosfat 1 mg/dL üzerindeyse oral replasman çoğu
            zaman yeterlidir; IV yol gereksiz ko-iyon yükü demektir. Oral
            fosfatın sık yan etkisi ishaldir.
          </p>

          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>

          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">
              ⚠️
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              <strong className="text-blue-900">Tuz seçimini araç yapmaz.</strong>{" "}
              Hiperkalemide potasyum tuzu, hipernatremi ve hacim yükünde sodyum
              tuzu uygun değildir; karar hastanın kendi elektrolitlerine ve böbrek
              işlevine göre verilir. Doz aralıkları ve tavanlar erişkin, yaygın
              protokollerdir; kendi kurumunuzun protokolüyle karşılaştırın.
              Obezitede bazı protokoller düzeltilmiş vücut ağırlığı kullanır —
              hangi ağırlığın girileceği kurum kararıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
