"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * PAINAD — ileri demansta ağrı değerlendirmesi (Warden ve ark., J Am Med Dir
 * Assoc 2003). Kendini sözel ifade edemeyen hastada 5 gözlem maddesi, her biri
 * 0–2; toplam 0–10. Hasta ~5 dakika gözlenir (tercihen hareket/bakım sırasında).
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  {
    id: "solunum",
    baslik: "1. Solunum (vokalizasyondan bağımsız)",
    secenekler: [
      { label: "Normal", pts: 0 },
      { label: "Ara sıra zorlu solunum, kısa süreli hiperventilasyon", pts: 1 },
      { label: "Gürültülü zorlu solunum, uzun süreli hiperventilasyon, Cheyne-Stokes solunumu", pts: 2 },
    ],
  },
  {
    id: "vokalizasyon",
    baslik: "2. Olumsuz vokalizasyon",
    secenekler: [
      { label: "Yok", pts: 0 },
      { label: "Ara sıra inleme ya da sızlanma; olumsuz/onaylamayan nitelikte alçak sesle konuşma", pts: 1 },
      { label: "Tekrarlayan sıkıntılı seslenme, yüksek sesle inleme ya da sızlanma, ağlama", pts: 2 },
    ],
  },
  {
    id: "yuz",
    baslik: "3. Yüz ifadesi",
    secenekler: [
      { label: "Gülümseyen ya da ifadesiz", pts: 0 },
      { label: "Üzgün, korkmuş, kaşları çatık", pts: 1 },
      { label: "Yüzünü buruşturuyor (grimas)", pts: 2 },
    ],
  },
  {
    id: "beden",
    baslik: "4. Beden dili",
    secenekler: [
      { label: "Rahat", pts: 0 },
      { label: "Gergin, sıkıntılı ileri geri yürüme, kıpırdanma", pts: 1 },
      { label: "Katı; yumruklar sıkılı, dizler yukarı çekili; çekiştirme ya da itme, vurma", pts: 2 },
    ],
  },
  {
    id: "teselli",
    baslik: "5. Teselli edilebilirlik",
    secenekler: [
      { label: "Teselliye gerek yok", pts: 0 },
      { label: "Ses ya da dokunuşla dikkati dağıtılabiliyor / rahatlatılabiliyor", pts: 1 },
      { label: "Teselli edilemiyor, dikkati dağıtılamıyor, rahatlatılamıyor", pts: 2 },
    ],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "0", etiket: "Ağrı belirtisi yok", alt: "Gözlem sırasında ağrı davranışı saptanmadı; değişiklikte yeniden değerlendirin.", renk: "emerald" },
  { aralik: "1–3", etiket: "Hafif ağrı", alt: "Nedeni araştırın; konfor önlemleri ve basamak 1 analjezik düşünülebilir.", renk: "amber" },
  { aralik: "4–6", etiket: "Orta ağrı", alt: "Analjezi gerekir; tedaviden sonra yeniden puanlayın.", renk: "orange" },
  { aralik: "7–10", etiket: "Şiddetli ağrı", alt: "Hızlı analjezik müdahale ve sık yeniden değerlendirme gerekir.", renk: "rose" },
];

export default function PainadPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor === 0 ? BANTLAR[0] : skor <= 3 ? BANTLAR[1] : skor <= 6 ? BANTLAR[2] : BANTLAR[3];

  return (
    <OlcekKabugu
      slug="painad"
      ikon="🕊️"
      baslik="PAINAD"
      altBaslik="İleri Demansta Ağrı Değerlendirmesi · 0–10"
      paylasim={Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]]))}
      not={
        <p>
          PAINAD kendini sözel ifade edemeyen hastada ağrı DAVRANIŞINI ölçer; sıfır puan ağrının olmadığını kanıtlamaz.
          Hastayı ~5 dakika, tercihen hareket ya da bakım sırasında gözleyin; aynı hastada seri ölçüm en değerli kullanımdır.
          Bant eşikleri yaygın klinik kullanımdır, özgün çalışma kesin kesim noktası vermez. Warden V ve ark., J Am Med Dir Assoc 2003.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi
            key={m.id}
            id={m.id}
            baslik={m.baslik}
            secenekler={m.secenekler}
            secili={sel[m.id]}
            onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))}
          />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={10}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
