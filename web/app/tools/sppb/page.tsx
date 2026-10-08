"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * SPPB — Short Physical Performance Battery (Guralnik ve ark., J Gerontol 1994).
 * Denge (0–4) + 4 m yürüme hızı (0–4) + 5 kez sandalyeden kalkma (0–4) = 0–12.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  {
    id: "yanyana",
    baslik: "Denge 1 — ayaklar yan yana, 10 sn",
    secenekler: [{ label: "< 10 sn ya da yapamadı", pts: 0 }, { label: "10 sn tuttu", pts: 1 }],
  },
  {
    id: "yaritandem",
    baslik: "Denge 2 — yarı tandem duruş, 10 sn",
    secenekler: [{ label: "< 10 sn ya da yapamadı", pts: 0 }, { label: "10 sn tuttu", pts: 1 }],
  },
  {
    id: "tandem",
    baslik: "Denge 3 — tam tandem duruş",
    secenekler: [{ label: "< 3 sn ya da yapamadı", pts: 0 }, { label: "3–9,99 sn", pts: 1 }, { label: "10 sn tuttu", pts: 2 }],
  },
  {
    id: "yurume",
    baslik: "4 metre yürüme süresi (iki denemenin iyisi)",
    secenekler: [
      { label: "Yapamadı", pts: 0 },
      { label: "> 8,70 sn", pts: 1 },
      { label: "6,21–8,70 sn", pts: 2 },
      { label: "4,82–6,20 sn", pts: 3 },
      { label: "< 4,82 sn", pts: 4 },
    ],
  },
  {
    id: "sandalye",
    baslik: "5 kez sandalyeden kalkma süresi (kollar göğüste)",
    secenekler: [
      { label: "Yapamadı ya da > 60 sn", pts: 0 },
      { label: "≥ 16,70 sn", pts: 1 },
      { label: "13,70–16,69 sn", pts: 2 },
      { label: "11,20–13,69 sn", pts: 3 },
      { label: "≤ 11,19 sn", pts: 4 },
    ],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "10–12", etiket: "İyi performans", alt: "Fiziksel performans iyi.", renk: "emerald" },
  { aralik: "7–9", etiket: "Orta performans", alt: "Orta düzey kısıtlılık — düşme, yeti yitimi ve kırılganlık açısından izleyin. 7–8 puan EWGSOP2'nin ağır sarkopeni ölçütünü (SPPB ≤ 8) de karşılar.", renk: "amber" },
  { aralik: "0–6", etiket: "Düşük performans", alt: "Düşük fiziksel performans — EWGSOP2 ağır sarkopeni ölçütünü (SPPB ≤ 8) karşılar; düşme ve yeti yitimi riski yüksek.", renk: "rose" },
];

export default function SppbPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor >= 10 ? BANTLAR[0] : skor >= 7 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="sppb"
      ikon="🚶"
      baslik="SPPB"
      altBaslik="Kısa Fiziksel Performans Bataryası · 0–12"
      paylasim={{ sppb: skor }}
      not={
        <p>
          Yarı tandemde 10 sn tutamayan hastada tam tandem denenmez (0 puan). Yürüme hızı eşikleri 4 m parkur içindir.
          Guralnik JM ve ark., J Gerontol 1994;49:M85–M94; Cruz-Jentoft AJ ve ark. (EWGSOP2), Age Ageing 2019.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={12} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
