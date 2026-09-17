"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * SOF kırılganlık indeksi — Ensrud ve ark., Arch Intern Med 2008.
 * Fried fenotipinin üç bileşenli sadeleştirmesi; ölçüm aleti gerektirmez.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama: string; secenekler: Secenek[] }> = [
  {
    id: "kilo",
    baslik: "Kilo kaybı",
    aciklama: "İstemli ya da istemsiz, vücut ağırlığının ≥ %5'i kadar kayıp (özgün çalışmada yaklaşık 3 yıllık izlemde).",
    secenekler: [
      { label: "Yok", pts: 0 },
      { label: "Var", pts: 1 },
    ],
  },
  {
    id: "sandalye",
    baslik: "Sandalyeden kalkma",
    aciklama: "Kollarını kullanmadan sandalyeden art arda 5 kez kalkabiliyor mu?",
    secenekler: [
      { label: "Kalkabiliyor", pts: 0 },
      { label: "Kalkamıyor", pts: 1 },
    ],
  },
  {
    id: "enerji",
    baslik: "Enerji azlığı",
    aciklama: "\"Kendinizi enerji dolu hissediyor musunuz?\" (Geriatrik Depresyon Ölçeği sorusu)",
    secenekler: [
      { label: "Evet", pts: 0 },
      { label: "Hayır", pts: 1 },
    ],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "0", etiket: "Sağlam", alt: "Kırılganlık bileşeni yok.", renk: "emerald" },
  { aralik: "1", etiket: "Kırılganlık öncesi", alt: "Ara evre (pre-frail) — izlem ve önleyici girişim.", renk: "amber" },
  { aralik: "2–3", etiket: "Kırılgan", alt: "Düşme, kırık, yeti yitimi ve ölüm riski artmış — kapsamlı geriatrik değerlendirme.", renk: "rose" },
];

export default function SofPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor === 0 ? BANTLAR[0] : skor === 1 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="sof-kirilganlik"
      ikon="🪑"
      baslik="SOF Kırılganlık İndeksi"
      altBaslik="Study of Osteoporotic Fractures · 3 Bileşen · 0–3"
      paylasim={Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]]))}
      not={
        <p>
          SOF indeksi, düşme, kırık, yeti yitimi ve ölümü öngörmede Fried fenotipine benzer ayırt edicilik gösterir ama el dinamometresi ve
          yürüme süresi ölçümü gerektirmez. Ensrud KE ve ark., Arch Intern Med 2008.
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
        payda={3}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} bileşen yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
