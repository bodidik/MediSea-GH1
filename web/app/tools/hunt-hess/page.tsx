"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Hunt-Hess derecelendirmesi — anevrizmal subaraknoid kanama (Hunt & Hess, J Neurosurg 1968).
 *
 * Özgün tanımda ciddi sistemik hastalık (hipertansiyon, diyabet, ağır ateroskleroz,
 * KOAH) ya da anjiyografide ağır vazospazm varsa hasta BİR ÜST dereceye konur.
 * Güncel pratikte bu ek çoğu zaman uygulanmıyor — araç ikisini ayrı gösteriyor,
 * klinik derece ile düzeltilmiş dereceyi karıştırmıyor.
 */
const DERECELER = [
  { n: 1, tanim: "Belirtisiz ya da hafif baş ağrısı ve hafif ense sertliği" },
  { n: 2, tanim: "Orta–şiddetli baş ağrısı, ense sertliği; kranial sinir felci dışında nörolojik defisit yok" },
  { n: 3, tanim: "Uykuya eğilim, konfüzyon ya da hafif fokal defisit" },
  { n: 4, tanim: "Stupor, orta–ağır hemiparezi; erken deserebrasyon ve vejetatif bozukluklar olabilir" },
  { n: 5, tanim: "Derin koma, deserebre rijidite, moribund görünüm" },
] as const;

const BANTLAR: Bant[] = [
  { aralik: "1–2", etiket: "İyi klinik derece", alt: "Erken anevrizma onarımı için genellikle uygun; prognoz görece iyi.", renk: "emerald" },
  { aralik: "3", etiket: "Orta klinik derece", alt: "Yakın nörolojik izlem, vazospazm ve hidrosefali açısından dikkat.", renk: "amber" },
  { aralik: "4–5", etiket: "Kötü klinik derece", alt: "Yüksek mortalite; hidrosefali gibi düzeltilebilir nedenleri ekarte edin, yoğun bakım.", renk: "rose" },
];

const bantBul = (n: number) => (n <= 2 ? BANTLAR[0] : n === 3 ? BANTLAR[1] : BANTLAR[2]);

export default function HuntHessPage() {
  const [derece, setDerece] = React.useState<number | null>(null);
  const [ek, setEk] = React.useState(false);
  const duzeltilmis = derece === null ? null : Math.min(5, derece + (ek ? 1 : 0));

  return (
    <OlcekKabugu
      slug="hunt-hess"
      ikon="🩸"
      baslik="Hunt-Hess"
      altBaslik="Anevrizmal Subaraknoid Kanama · Klinik Derece 1–5"
      paylasim={{ derece, ek: ek ? 1 : 0 }}
      not={
        <p>
          Derece resüsitasyondan sonra ve olası hidrosefali düzeltildikten sonra yeniden değerlendirilmelidir. Gözlemciler arası uyumu WFNS'ten
          düşüktür; birçok merkez ikisini birlikte kullanır. Hunt WE, Hess RM, J Neurosurg 1968.
        </p>
      }
    >
      <div role="group" aria-labelledby="hh-baslik" className="space-y-2">
        <p id="hh-baslik" className="text-[11px] font-black text-slate-600 uppercase tracking-widest px-1">Klinik tabloya uyan dereceyi seçin</p>
        {DERECELER.map((d) => {
          const aktif = derece === d.n;
          return (
            <button
              key={d.n}
              type="button"
              aria-pressed={aktif}
              onClick={() => setDerece(aktif ? null : d.n)}
              className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all
                ${aktif ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"}`}
            >
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-black shrink-0 ${aktif ? "bg-amber-400 text-blue-900" : "bg-slate-100 text-blue-900"}`}>
                {d.n}
              </span>
              <span className={`text-[12px] leading-snug font-bold ${aktif ? "text-white" : "text-slate-700"}`}>{d.tanim}</span>
            </button>
          );
        })}
      </div>

      <label className="flex items-start gap-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm cursor-pointer min-h-[44px]">
        <input type="checkbox" checked={ek} onChange={() => setEk((v) => !v)} className="w-4 h-4 mt-0.5 accent-blue-900 shrink-0" />
        <span className="text-[12px] text-slate-700 leading-snug">
          <span className="font-black text-blue-900">Özgün tanımdaki ek (+1): </span>
          ciddi sistemik hastalık (hipertansiyon, diyabet, ağır ateroskleroz, KOAH) ya da anjiyografide ağır vazospazm
        </span>
      </label>

      <SkorPaneli
        skor={duzeltilmis}
        payda={5}
        skorBasligi="DERECE"
        bantlar={BANTLAR}
        aktif={duzeltilmis === null ? null : bantBul(duzeltilmis)}
        eksikMetni="Bir derece seçin"
        ek={ek && derece !== null ? <p className="text-[11px] font-bold text-slate-700">Klinik derece {derece} · sistemik hastalık/vazospazm ile {duzeltilmis}</p> : null}
      />
    </OlcekKabugu>
  );
}
