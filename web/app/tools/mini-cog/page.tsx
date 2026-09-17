"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Mini-Cog© — üç kelime hatırlama + saat çizme (Borson ve ark., 2000).
 * MMSE ve MoCA lisanslı olduğu için kütüphanede bilişsel tarama bunun üzerinden.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama: string; secenekler: Secenek[] }> = [
  {
    id: "hatirlama",
    baslik: "Kelime hatırlama",
    aciklama:
      "Başta üç ilgisiz kelime söylenir ve hastaya tekrarlatılır (ör. muz · gündoğumu · sandalye). Saat çizme testinden SONRA kelimeler ipucu verilmeden sorulur. Her doğru kelime 1 puan.",
    secenekler: [
      { label: "Hiçbirini hatırlamıyor", pts: 0 },
      { label: "1 kelime", pts: 1 },
      { label: "2 kelime", pts: 2 },
      { label: "3 kelime", pts: 3 },
    ],
  },
  {
    id: "saat",
    baslik: "Saat çizme",
    aciklama:
      "Hastadan bir daire içine saatin tüm rakamlarını yazması, sonra akrep ve yelkovanı \"on biri on geçe\" gösterecek şekilde çizmesi istenir. NORMAL: bütün rakamlar doğru sırada ve yaklaşık doğru konumda, ve akrep ile yelkovan istenen saati gösteriyor.",
    secenekler: [
      { label: "Anormal ya da çizmeyi reddediyor", pts: 0 },
      { label: "Normal", pts: 2 },
    ],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Tarama pozitif", alt: "Demans açısından anlamlı olasılık — ayrıntılı bilişsel değerlendirme gerekir.", renk: "rose" },
  { aralik: "3–5", etiket: "Tarama negatif", alt: "Demans olasılığı düşük; ama hafif bilişsel bozukluğu dışlamaz. Yakınma sürüyorsa ileri değerlendirme.", renk: "emerald" },
];

export default function MiniCogPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor <= 2 ? BANTLAR[0] : BANTLAR[1];

  return (
    <OlcekKabugu
      slug="mini-cog"
      ikon="🕰️"
      baslik="Mini-Cog"
      altBaslik="Üç Kelime Hatırlama + Saat Çizme · 0–5"
      paylasim={Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]]))}
      not={
        <p>
          Mini-Cog bir tarama testidir, tanı koydurmaz; eğitim düzeyi düşük ya da görme/motor sorunu olan hastada saat çizme yanıltıcı olabilir.
          Deliryum şüphesinde önce 4AT. Mini-Cog© S. Borson'un telif hakkıdır; klinik ve eğitim amaçlı, değiştirilmeden kullanılabilir.
          Borson S ve ark., Int J Geriatr Psychiatry 2000; mini-cog.com.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi
            key={m.id}
            id={m.id}
            baslik={m.baslik}
            aciklama={m.aciklama}
            secenekler={m.secenekler}
            secili={sel[m.id]}
            onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))}
          />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={5}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} bölüm yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
