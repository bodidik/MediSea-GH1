"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * Fomepizol dozlama — metanol ve etilen glikol zehirlenmesi.
 *
 * ─────────────────────────────────────────────────────────────────────
 * BU ARAÇ TEDAVİ KARARI VERMEZ. Fomepizol endikasyonu öykü, serum
 * metanol/etilen glikol düzeyi, ozmolar açık, metabolik asidoz ve klinik
 * gidişle belirlenir. Burada yalnızca karar verildikten SONRAKİ doz
 * aritmetiği yapılır.
 *
 * REJİMİN ÖZELLİĞİ — doz zamanla DEĞİŞİYOR. Fomepizol kendi metabolizmasını
 * indükliyor, bu yüzden 48 saatten sonra idame dozu yükseliyor. Ayrıca
 * hemodiyaliz fomepizolü uzaklaştırdığı için diyaliz sırasında aralık
 * kısalıyor. Bir "tek doz" hesaplayıcısı bu rejimi yanlış anlatırdı;
 * araç bütün basamakları birlikte gösteriyor.
 * ─────────────────────────────────────────────────────────────────────
 */

type Basamak = {
  ad: string;
  mgKg: number;
  aciklama: string;
};

/** Sabitler tek yerde ve okunur — gözden geçirilebilsin diye. */
const YUKLEME: Basamak = {
  ad: "Yükleme dozu",
  mgKg: 15,
  aciklama: "En az 100 mL sıvı içinde, 30 dakikada infüzyon.",
};

const IDAME_ILK: Basamak = {
  ad: "İdame — ilk 48 saat",
  mgKg: 10,
  aciklama: "12 saatte bir, toplam 4 doz. Her doz 30 dakikada.",
};

const IDAME_SONRA: Basamak = {
  ad: "İdame — 48 saatten sonra",
  mgKg: 15,
  aciklama: "12 saatte bir. Doz YÜKSELİR: fomepizol kendi metabolizmasını indükler.",
};

const DIYALIZ_NOT =
  "Hemodiyaliz fomepizolü uzaklaştırır: doz aralığı 12 saatten 4 saate iner " +
  "(ya da sürekli infüzyon uygulanır). Diyaliz bitiminde son dozun üzerinden " +
  "geçen süreye göre zamanlama yeniden kurulur.";

const yuvarla = (n: number, b = 0) => Math.round(n * 10 ** b) / 10 ** b;

/**
 * MODÜL DÜZEYİNDE — sayfa fonksiyonunun içinde DEĞİL. İçeride tanımlanırsa
 * React her render'da yeni bileşen kimliği görür, <input>u söküp yeniden
 * takar ve kullanıcı her rakamdan sonra odağı kaybeder (bu depoda ölçülmüş
 * ve düzeltilmiş bir kusur).
 */
function KiloAlani({
  deger, ayarla,
}: { deger: string; ayarla: (v: string) => void }) {
  return (
    <div>
      <label
        htmlFor="fomepizol-kilo"
        className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2"
      >
        Hasta ağırlığı
      </label>
      <div className="relative">
        <input
          id="fomepizol-kilo"
          type="text"
          inputMode="decimal"
          value={deger}
          onChange={(e) => ayarla(e.target.value)}
          placeholder="ör. 70"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-14 text-2xl font-black text-blue-900 focus:border-blue-900 outline-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
          kg
        </span>
      </div>
    </div>
  );
}

export default function FomepizolSayfasi() {
  const [kilo, setKilo] = React.useState("");
  const [diyaliz, setDiyaliz] = React.useState(false);

  const kiloNum = parseLocaleNumber(kilo);
  const makul = kilo.trim() !== "" && kiloNum >= 1 && kiloNum <= 400;

  const doz = (b: Basamak) => ({
    ...b,
    mg: yuvarla(kiloNum * b.mgKg, 0),
    gram: yuvarla((kiloNum * b.mgKg) / 1000, 2),
  });

  const basamaklar = [doz(YUKLEME), doz(IDAME_ILK), doz(IDAME_SONRA)];

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="fomepizol" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🧪</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Fomepizol Dozu
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
              Metanol · Etilen glikol zehirlenmesi
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg" aria-hidden="true">⚠️</span>
          <p className="text-[12px] leading-relaxed text-amber-900">
            <strong>Bu araç tedavi kararı vermez.</strong> Endikasyon öykü,
            serum düzeyi, ozmolar açık, asidoz ve klinik gidişle belirlenir.
            Burada yalnızca karar verildikten sonraki doz aritmetiği yapılır.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <KiloAlani deger={kilo} ayarla={setKilo} />

          <label className="flex items-start gap-3 cursor-pointer rounded-xl p-2 -m-2 focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2">
            <input
              type="checkbox"
              className="sr-only"
              checked={diyaliz}
              onChange={() => setDiyaliz((v) => !v)}
            />
            <span
              aria-hidden="true"
              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${diyaliz ? "bg-blue-900 border-blue-900" : "border-slate-300 bg-white"}`}
            >
              {diyaliz && (
                <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white"><path d="M1 4l3 3 5-6" /></svg>
              )}
            </span>
            <span className="text-sm font-bold text-blue-900 leading-snug">
              Hasta hemodiyalizde
            </span>
          </label>
        </div>

        {/* SONUÇ */}
        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-3">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block mb-2">
            Doz basamakları
          </span>

          {!makul ? (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              Hasta ağırlığını girin (1–400 kg).
            </p>
          ) : (
            basamaklar.map((b) => (
              <div key={b.ad} className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="text-[11px] font-black text-blue-200 uppercase tracking-widest">
                    {b.ad}
                  </span>
                  <span className="text-[10px] font-bold text-blue-300">{b.mgKg} mg/kg</span>
                </div>
                <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-black text-white">{b.mg} mg</span>
                  <span className="text-sm font-bold text-blue-300">({b.gram} g)</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-blue-200">{b.aciklama}</p>
              </div>
            ))
          )}

          {makul && diyaliz && (
            <div className="bg-amber-400/10 border border-amber-400/40 rounded-2xl p-4" role="status">
              <p className="text-[11px] leading-relaxed text-amber-200">
                <strong className="text-amber-100">Diyaliz sırasında:</strong> {DIYALIZ_NOT}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-blue-900">Tedavi sonlandırma</strong> ayrı bir
            karardır: metanol/etilen glikol düzeyinin güvenli sınırın altına
            inmesi, asidozun düzelmesi ve kliniğin toparlaması birlikte
            değerlendirilir. Metanolde folinik/folik asit, etilen glikolde
            tiamin ve piridoksin eşlik eden tedavilerdir.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Hesaplanan dozları uygulamadan önce kurumunuzun protokolü ve
              ilacın prospektüsüyle karşılaştırın. Zehir danışma merkezine
              başvurmak bu aracın yerini tutmaz — tersi de doğru.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
