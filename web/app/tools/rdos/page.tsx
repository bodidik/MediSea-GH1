"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * RDOS — Solunum Sıkıntısı Gözlem Skalası (Campbell ve ark., J Palliat Med
 * 2010). Dispnesini kendisi bildiremeyen hastada (bilinç bozukluğu, ileri
 * demans, ölüm döneminde) 8 gözlem maddesi; toplam 0–16. Hasta 1 dakika gözlenir.
 *
 * Kalp ve solunum hızı ölçeğin KENDİ aralıklarıyla şık olarak soruluyor
 * (sayı girişi değil): puan aralığa bağlı, ham sayının başka bir işlevi yok.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  {
    id: "kalp",
    baslik: "1. Kalp hızı (atım/dk)",
    secenekler: [
      { label: "< 90", pts: 0 },
      { label: "90–109", pts: 1 },
      { label: "≥ 110", pts: 2 },
    ],
  },
  {
    id: "solunum",
    baslik: "2. Solunum hızı (1 dakika sayılır)",
    secenekler: [
      { label: "≤ 18", pts: 0 },
      { label: "19–30", pts: 1 },
      { label: "> 30", pts: 2 },
    ],
  },
  {
    id: "huzursuzluk",
    baslik: "3. Huzursuzluk (amaçsız hareketler)",
    secenekler: [
      { label: "Yok", pts: 0 },
      { label: "Ara sıra, hafif hareketler", pts: 1 },
      { label: "Sık hareketler", pts: 2 },
    ],
  },
  {
    id: "paradoks",
    baslik: "4. Paradoks solunum",
    aciklama: "İnspiryumda karın içeri çekiliyor.",
    secenekler: [
      { label: "Yok", pts: 0 },
      { label: "Var", pts: 2 },
    ],
  },
  {
    id: "yardimci",
    baslik: "5. Yardımcı solunum kası kullanımı",
    aciklama: "İnspiryumda klavikulanın yükselmesi.",
    secenekler: [
      { label: "Yok", pts: 0 },
      { label: "Hafif yükselme", pts: 1 },
      { label: "Belirgin yükselme", pts: 2 },
    ],
  },
  {
    id: "hirilti",
    baslik: "6. Ekspiryum sonu hırıltısı (grunting)",
    aciklama: "Ekspiryumun sonunda gırtlaktan gelen ses.",
    secenekler: [
      { label: "Yok", pts: 0 },
      { label: "Var", pts: 2 },
    ],
  },
  {
    id: "burun",
    baslik: "7. Burun kanadı solunumu",
    aciklama: "İnspiryumda burun deliklerinin istemsiz genişlemesi.",
    secenekler: [
      { label: "Yok", pts: 0 },
      { label: "Var", pts: 2 },
    ],
  },
  {
    id: "korku",
    baslik: "8. Korku ifadesi",
    aciklama: "Gözlerin iri açılması, yüz kaslarında gerginlik, kaşların kalkması, ağzın açık olması, dişlerin sıkılması.",
    secenekler: [
      { label: "Yok", pts: 0 },
      { label: "Var", pts: 2 },
    ],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Sıkıntı yok / minimal", alt: "Belirgin solunum sıkıntısı yok; değişiklikte yeniden değerlendirin.", renk: "emerald" },
  { aralik: "3–6", etiket: "Orta solunum sıkıntısı", alt: "Palyasyon gerekir (ör. opioid, pozisyon, ortam havalandırması); müdahaleden sonra yeniden puanlayın.", renk: "orange" },
  { aralik: "≥ 7", etiket: "Şiddetli solunum sıkıntısı", alt: "Hızlı ve yoğun palyasyon; sık yeniden değerlendirme.", renk: "rose" },
];

export default function RdosPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor <= 2 ? BANTLAR[0] : skor <= 6 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="rdos"
      ikon="🫁"
      baslik="RDOS"
      altBaslik="Solunum Sıkıntısı Gözlem Skalası · 0–16"
      paylasim={Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]]))}
      not={
        <p>
          RDOS, dispnesini kendisi bildiremeyen hastada solunum sıkıntısını gözlemle ölçer; konuşabilen hastada hastanın kendi
          bildirimi (ör. sayısal skala) esastır. Hasta 1 dakika gözlenir. Eşikler: &lt;3 sıkıntı yok/minimal, ≥3 orta, ≥7 şiddetli
          (Campbell ML ve ark., J Palliat Med 2010; Zhuang Q ve ark., 2019 eşik çalışması).
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
        payda={16}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
