"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * Status epileptikus — yükleme dozları ve HIZ SINIRLARI.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ARACIN TAŞIDIĞI ASIL RİSK DOZDA DEĞİL HIZDA.
 *
 * Fenitoin dakikada 50 mg'ı aşarsa hipotansiyon ve aritmi yapar; yaşlıda ve
 * kalp hastasında sınır daha da düşüktür. 70 kiloluk bir hastada 20 mg/kg
 * yükleme 1400 mg eder ve bu doz EN AZ 28 DAKİKA sürmelidir. "Yükleme yap"
 * talimatı hızı söylemediği için, doz doğru olsa bile uygulama zarar
 * verebiliyor.
 *
 * Bu yüzden araç her ajan için üç şeyi birlikte veriyor: toplam doz, o dozun
 * hız sınırıyla EN AZ ne kadar sürmesi gerektiği ve pompa hızı.
 *
 * TAVANLAR SESSİZCE UYGULANMIYOR. Levetirasetam 4500 mg, valproat 3000 mg,
 * lorazepam 4 mg/doz gibi tavanlar var; uygulandığında ekran kiloya göre kaç
 * çıktığını ve tavanın ne olduğunu birlikte yazıyor (heparin ve tromboliz
 * araçlarıyla aynı karar).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ARAÇ TEDAVİ SIRASI ÖNERMİYOR. Hangi ajanın seçileceği eşlik eden hastalık,
 * ilaç etkileşimi ve yerel protokolle belirlenir; burada yalnızca aritmetik
 * ve hız sınırı var.
 */

type Ajan = {
  slug: string;
  ad: string;
  basamak: "birinci" | "ikinci";
  mgKg: number;
  /** Tek dozda aşılmayan miktar (mg). */
  tavanMg?: number;
  /** Dakikada verilebilecek en yüksek miktar (mg/dakika). null = sınır dozdan değil süreden geliyor. */
  maxMgDk: number | null;
  /** Hız sınırı yoksa önerilen en kısa süre (dakika). */
  enAzDakika?: number;
  birim: string;
  not: string;
};

const AJANLAR: Ajan[] = [
  {
    slug: "lorazepam",
    ad: "Lorazepam",
    basamak: "birinci",
    mgKg: 0.1,
    tavanMg: 4,
    maxMgDk: 2,
    birim: "mg",
    not: "İlk basamak. Yetersiz dozlanmak, status epileptikusun en sık tedavi hatasıdır — yarım doz benzodiazepin nöbeti durdurmaz ama solunumu baskılar. Yanıt yoksa 5-10 dakika sonra doz TEKRARLANIR.",
  },
  {
    slug: "midazolam",
    ad: "Midazolam (IM)",
    basamak: "birinci",
    mgKg: 0.2,
    tavanMg: 10,
    maxMgDk: null,
    enAzDakika: 0,
    birim: "mg",
    not: "Damar yolu yokken tercih edilir ve IM uygulamada IV lorazepam kadar etkilidir. Damar yolu arayarak geçen süre, nöbeti sürdürdüğü için asıl zarardır.",
  },
  {
    slug: "fenitoin",
    ad: "Fenitoin",
    basamak: "ikinci",
    mgKg: 20,
    /* Tavan bir dönem YOKTU ve 150 kg hastada ekran 3000 mg yazıyordu —
       standart üst sınırın iki katı. Dozların geldiği aynı kaynak (AES 2016)
       fenitoin ve fosfenitoin için doz başına 1500 mg / 1500 mg FE sınırı
       veriyor; levetirasetam 4500 ve valproat 3000 zaten oradan gelmişti.
       Yedi ajanın beşinde tavan vardı, bu ikisi dışarıda kalmıştı. */
    tavanMg: 1500,
    maxMgDk: 50,
    birim: "mg",
    not: "HIZ SINIRI 50 mg/dakika; yaşlıda ve kalp hastasında 20-25 mg/dakikaya indirilir. Dekstroz içeren sıvılarla ÇÖKELİR — yalnızca serum fizyolojikle verilir. Ekstravazasyonu ciddi doku hasarı (mor eldiven sendromu) yapar. İnfüzyon boyunca EKG ve kan basıncı izlenir.",
  },
  {
    slug: "fosfenitoin",
    ad: "Fosfenitoin",
    basamak: "ikinci",
    mgKg: 20,
    tavanMg: 1500, // mg FE — fenitoinle aynı üst sınır
    maxMgDk: 150,
    birim: "mg FE",
    not: "Doz FENİTOİN EŞDEĞERİ (mg FE) olarak yazılır — 'mg' yazmak karışıklık kaynağıdır. Hız sınırı fenitoinin üç katı olduğu için yükleme çok daha kısa sürer; dekstrozla da geçimlidir. Kaşıntı ve parestezi hıza bağlı ve geçicidir.",
  },
  {
    slug: "levetirasetam",
    ad: "Levetirasetam",
    basamak: "ikinci",
    mgKg: 60,
    tavanMg: 4500,
    maxMgDk: null,
    enAzDakika: 10,
    birim: "mg",
    not: "Etkileşimi az ve kardiyak izlem gerektirmez; bu yüzden çok tercih edilir. Böbrek yetmezliğinde İDAME dozu azaltılır, yükleme dozu değişmez.",
  },
  {
    slug: "valproat",
    ad: "Valproat",
    basamak: "ikinci",
    mgKg: 40,
    tavanMg: 3000,
    maxMgDk: null,
    enAzDakika: 10,
    birim: "mg",
    not: "Karaciğer hastalığında, mitokondriyal hastalıkta ve GEBELİKTE kaçınılır. Hiperamonyemik ensefalopati yapabilir — tedaviye rağmen bilinç açılmıyorsa amonyak bakılır.",
  },
  {
    slug: "lakosamid",
    ad: "Lakosamid",
    basamak: "ikinci",
    mgKg: 0,
    tavanMg: 400,
    maxMgDk: null,
    enAzDakika: 15,
    birim: "mg",
    not: "Kiloya göre DEĞİL sabit dozlanır (200-400 mg). PR aralığını uzatabilir; ileti bozukluğu olanda dikkat gerekir.",
  },
];

const yuvarla = (n: number, b = 1) => Math.round(n * 10 ** b) / 10 ** b;

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

/**
 * MODÜL DÜZEYİNDE — sayfa bileşeninin İÇİNDE tanımlanırsa her render'da yeni
 * bir bileşen kimliği oluşur, React kontrolü söküp yeniden takar ve odak
 * kaybolur. Bu depoda 19 araçta ölçülmüş ve düzeltilmiş kusur; kapandığı
 * değerler (hesapla, kiloNum) bu yüzden PROP olarak alınıyor.
 */
function KartListesi({ liste, hesapla, kiloNum }: {
  liste: Ajan[];
  hesapla: (a: Ajan) => { toplam: number; ham: number; tavanUygulandi: boolean; dakika: number; mgDk: number | null } | null;
  kiloNum: number;
}) {
  return (
    <div className="space-y-3">
      {liste.map((a) => {
        const h = hesapla(a);
        const sabitDozlu = a.mgKg === 0;
        return (
          <div key={a.slug} className="bg-blue-950/50 rounded-2xl p-5 border border-blue-800 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[13px] font-black text-white">{a.ad}</span>
              <span className="text-[10px] font-mono text-blue-300">
                {sabitDozlu ? "sabit doz" : `${a.mgKg} ${a.birim}/kg`}
                {a.tavanMg !== undefined ? ` · tavan ${a.tavanMg} ${a.birim}` : ""}
                {a.maxMgDk ? ` · en çok ${a.maxMgDk} ${a.birim}/dk` : ""}
              </span>
            </div>

            {!h ? (
              <p className="text-[11px] text-amber-300 font-bold">
                {sabitDozlu ? "Lakosamid dozunu girin (50-400 mg)." : "Ağırlığı girin."}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">Toplam</span>
                    <div className="text-2xl font-black text-white">
                      {h.toplam} {a.birim}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">En az süre</span>
                    <div className="text-2xl font-black text-white">
                      {h.dakika > 0 ? `${h.dakika} dk` : "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">Hız</span>
                    <div className="text-2xl font-black text-white">
                      {h.mgDk !== null ? `${h.mgDk}` : "—"}
                    </div>
                    <p className="text-[10px] text-blue-300">{h.mgDk !== null ? `${a.birim}/dk` : "IM, süre yok"}</p>
                  </div>
                </div>

                {h.tavanUygulandi && (
                  <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                    <strong>Tavan uygulandı.</strong> {kiloNum} kg × {a.mgKg} = {h.ham} {a.birim}{" "}
                    çıkıyor; tavan {a.tavanMg} {a.birim} olduğu için doz oraya indirildi.
                  </p>
                )}
              </>
            )}

            <p className="text-[11px] leading-relaxed text-blue-200">{a.not}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function StatusEpileptikusSayfasi() {
  const [kilo, setKilo] = React.useState("");
  const [lakosamidDoz, setLakosamidDoz] = React.useState("400");

  const kiloNum = parseLocaleNumber(kilo);
  const kiloMakul = kilo.trim() !== "" && kiloNum >= 20 && kiloNum <= 300;
  const lakoNum = parseLocaleNumber(lakosamidDoz);
  const lakoMakul = lakosamidDoz.trim() !== "" && lakoNum >= 50 && lakoNum <= 400;

  const hesapla = (a: Ajan) => {
    const sabitDozlu = a.mgKg === 0;
    if (sabitDozlu) {
      if (!lakoMakul) return null;
      const toplam = lakoNum;
      const dakika = a.enAzDakika ?? 0;
      return { toplam, ham: toplam, tavanUygulandi: false, dakika, mgDk: dakika > 0 ? yuvarla(toplam / dakika, 1) : null };
    }
    if (!kiloMakul) return null;
    const ham = yuvarla(kiloNum * a.mgKg, 1);
    const tavanUygulandi = a.tavanMg !== undefined && ham > a.tavanMg;
    const toplam = tavanUygulandi ? a.tavanMg! : ham;
    /* Süre iki kaynaktan gelebilir: hız sınırı ya da önerilen en kısa süre. */
    const dakika = a.maxMgDk ? Math.ceil(toplam / a.maxMgDk) : (a.enAzDakika ?? 0);
    return { toplam, ham, tavanUygulandi, dakika, mgDk: dakika > 0 ? yuvarla(toplam / dakika, 1) : null };
  };

  const birinci = AJANLAR.filter((a) => a.basamak === "birinci");
  const ikinci = AJANLAR.filter((a) => a.basamak === "ikinci");

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="status-epileptikus" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Status Epileptikus
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Yükleme dozları · hız sınırları · en az infüzyon süresi
            </p>
          </div>
        </div>

        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">🛑</span>
          <div className="text-[12px] leading-relaxed text-rose-900 space-y-2">
            <p>
              <strong>Asıl risk dozda değil HIZDA.</strong> Fenitoin dakikada 50
              mg&apos;ı aşarsa hipotansiyon ve aritmi yapar. &ldquo;Yükleme yap&rdquo;
              talimatı hızı söylemediği için, doz doğru olsa bile uygulama zarar
              verebilir.
            </p>
            <p>
              <strong>Fenitoin dekstrozla çökelir</strong> — yalnızca serum
              fizyolojikle verilir. Fosfenitoin dozu <strong>mg FE</strong> (fenitoin
              eşdeğeri) olarak yazılır; &ldquo;mg&rdquo; yazmak karışıklık kaynağıdır.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SayiAlani id="se-kilo" etiket="Ağırlık" birim="kg" deger={kilo} ayarla={setKilo} ipucu="ör. 70" />
            <SayiAlani
              id="se-lakosamid"
              etiket="Lakosamid dozu (sabit)"
              birim="mg"
              deger={lakosamidDoz}
              ayarla={setLakosamidDoz}
              ipucu="200–400"
            />
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            Lakosamid kiloya göre değil sabit dozlanır, o yüzden ayrı bir alanı var.
            Ötekilerin hepsi ağırlıktan hesaplanıyor.
          </p>
        </div>

        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
            1. Basamak — benzodiazepin
          </span>
          <KartListesi liste={birinci} hesapla={hesapla} kiloNum={kiloNum} />
        </div>

        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
            2. Basamak — yükleme
          </span>
          <KartListesi liste={ikinci} hesapla={hesapla} kiloNum={kiloNum} />
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Araç tedavi sırası önermez.</strong> Hangi
            ajanın seçileceği eşlik eden hastalık, ilaç etkileşimi ve yerel protokolle
            belirlenir. Nöbet 5 dakikayı aşıyorsa status kabul edilir ve tedavi
            gecikmeden başlar; en sık hata benzodiazepini YETERSİZ dozlamaktır.
          </p>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Aynı anda yapılacaklar:</strong> kan şekeri
            (hipoglisemi nöbeti sürdürür), elektrolitler, ateş, ilaç düzeyleri ve gebelik
            olasılığı. Nöbet durduktan sonra bilinç açılmıyorsa nonkonvülzif status
            akla gelir ve EEG gerekir. Dirençli statusta sürekli infüzyon (midazolam,
            propofol, ketamin) devreye girer — dozları sedasyon aracında.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Dozlar ve hız sınırları erişkin, yaygın protokollerdir ve tek yerde
              (AJANLAR bloğu) duruyor; kendi kurumunuzun protokolüyle karşılaştırın.
              Fenitoin hız sınırı yaşlıda ve kalp hastasında daha düşüktür — araç bu
              düşürmeyi kendiliğinden YAPMAZ, karar hekimindir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
