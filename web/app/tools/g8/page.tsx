"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * G8 — onkogeriatri taraması (Bellera ve ark., Ann Oncol 2012).
 * İlk yedi madde MNA'dan türetilmiştir; sekizincisi yaş.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  {
    id: "besin",
    baslik: "A — Besin alımı",
    aciklama: "Son 3 ayda iştahsızlık, sindirim sorunu, çiğneme ya da yutma güçlüğü nedeniyle besin alımı azaldı mı?",
    secenekler: [
      { label: "Ciddi azalma", pts: 0 },
      { label: "Orta düzeyde azalma", pts: 1 },
      { label: "Azalma yok", pts: 2 },
    ],
  },
  {
    id: "kilo",
    baslik: "B — Kilo kaybı (son 3 ay)",
    secenekler: [
      { label: "> 3 kg", pts: 0 },
      { label: "Bilmiyor", pts: 1 },
      { label: "1–3 kg", pts: 2 },
      { label: "Kilo kaybı yok", pts: 3 },
    ],
  },
  {
    id: "mobilite",
    baslik: "C — Hareketlilik",
    secenekler: [
      { label: "Yatak ya da sandalyeye bağımlı", pts: 0 },
      { label: "Yataktan/sandalyeden kalkabiliyor ama dışarı çıkmıyor", pts: 1 },
      { label: "Dışarı çıkabiliyor", pts: 2 },
    ],
  },
  {
    id: "noropsikolojik",
    baslik: "E — Nöropsikolojik sorunlar",
    secenekler: [
      { label: "Ağır demans ya da depresyon", pts: 0 },
      { label: "Hafif demans ya da depresyon", pts: 1 },
      { label: "Psikolojik sorun yok", pts: 2 },
    ],
  },
  {
    id: "bki",
    baslik: "F — Beden kitle indeksi (kg/m²)",
    secenekler: [
      { label: "< 19", pts: 0 },
      { label: "19 – < 21", pts: 1 },
      { label: "21 – < 23", pts: 2 },
      { label: "≥ 23", pts: 3 },
    ],
  },
  {
    id: "ilac",
    baslik: "H — Günde 3'ten fazla reçeteli ilaç kullanıyor mu?",
    secenekler: [
      { label: "Evet", pts: 0 },
      { label: "Hayır", pts: 1 },
    ],
  },
  {
    id: "saglik",
    baslik: "P — Sağlık algısı",
    aciklama: "Hasta, aynı yaştaki başka insanlarla karşılaştırıldığında kendi sağlığını nasıl değerlendiriyor?",
    secenekler: [
      { label: "Onlar kadar iyi değil", pts: 0 },
      { label: "Bilmiyor", pts: 0.5 },
      { label: "Onlar kadar iyi", pts: 1 },
      { label: "Daha iyi", pts: 2 },
    ],
  },
  {
    id: "yas",
    baslik: "Yaş",
    secenekler: [
      { label: "> 85", pts: 0 },
      { label: "80–85", pts: 1 },
      { label: "< 80", pts: 2 },
    ],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "≤ 14", etiket: "Anormal", alt: "Geriatrik açıdan kırılganlık bulgusu — onkoloji tedavisi öncesi kapsamlı geriatrik değerlendirme önerilir.", renk: "rose" },
  { aralik: "> 14", etiket: "Normal", alt: "Standart onkolojik değerlendirme ile devam edilebilir.", renk: "emerald" },
];

export default function G8Page() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor <= 14 ? BANTLAR[0] : BANTLAR[1];

  return (
    <OlcekKabugu
      slug="g8"
      ikon="🎗️"
      baslik="G8 Tarama Aracı"
      altBaslik="Onkogeriatri · Kapsamlı Geriatrik Değerlendirme Gereksinimi · 0–17"
      paylasim={Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]]))}
      not={
        <p>
          G8, kanser tanılı yaşlı hastada hangi hastanın kapsamlı geriatrik değerlendirmeye (KGD) ihtiyaç duyduğunu seçmek içindir; KGD'nin yerini tutmaz.
          SIOG ve ASCO geriatrik onkoloji kılavuzları tarafından önerilmektedir. Bellera CA ve ark., Ann Oncol 2012.
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
        payda={17}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
