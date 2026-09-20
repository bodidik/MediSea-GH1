"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * RAPID skoru — plevral enfeksiyonda (komplike parapnömonik efüzyon / ampiyem) 3 aylık mortalite riski
 * (Rahman ve ark., Chest 2014). 5 bileşen, 0–7.
 *   Renal: üre < 5 mmol/L 0 · 5–8 1 · > 8 2   (üre mg/dL ≈ mmol/L × 6; BUN mg/dL ≈ mmol/L × 2,8)
 *   Age: < 50 0 · 50–70 1 · > 70 2
 *   Purulence: pürülan sıvı 0 · pürülan OLMAYAN sıvı 1
 *   Infection source: toplum kökenli 0 · hastane kökenli 1
 *   Dietary: albümin ≥ 2,7 g/dL 0 · < 2,7 1
 *   0–2 düşük · 3–4 orta · 5–7 yüksek risk
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  { id: "ure", baslik: "R — Üre", secenekler: [
    { label: "< 30 mg/dL (BUN < 14; < 5 mmol/L)", pts: 0 },
    { label: "30–48 mg/dL (BUN 14–22; 5–8 mmol/L)", pts: 1 },
    { label: "> 48 mg/dL (BUN > 22; > 8 mmol/L)", pts: 2 },
  ] },
  { id: "yas", baslik: "A — Yaş", secenekler: [
    { label: "< 50", pts: 0 },
    { label: "50–70", pts: 1 },
    { label: "> 70", pts: 2 },
  ] },
  { id: "puru", baslik: "P — Plevral sıvının görünümü", secenekler: [
    { label: "Pürülan (ampiyem)", pts: 0 },
    { label: "Pürülan değil", pts: 1 },
  ] },
  { id: "kaynak", baslik: "I — Enfeksiyonun kaynağı", secenekler: [
    { label: "Toplum kökenli", pts: 0 },
    { label: "Hastane kökenli", pts: 1 },
  ] },
  { id: "alb", baslik: "D — Serum albümin", secenekler: [
    { label: "≥ 2,7 g/dL", pts: 0 },
    { label: "< 2,7 g/dL", pts: 1 },
  ] },
];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Düşük risk", alt: "3 aylık mortalite düşük.", renk: "emerald" },
  { aralik: "3–4", etiket: "Orta risk", alt: "3 aylık mortalite orta — yakın izlem.", renk: "amber" },
  { aralik: "5–7", etiket: "Yüksek risk", alt: "3 aylık mortalite yüksek — erken göğüs cerrahisi değerlendirmesi ve yoğun izlem.", renk: "rose" },
];

export default function RapidPlevralPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 2 ? BANTLAR[0] : skor <= 4 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="rapid-plevral"
      ikon="🧫"
      baslik="RAPID Skoru"
      altBaslik="Plevral Enfeksiyonda 3 Aylık Mortalite · 0–7"
      paylasim={{ rapid: skor }}
      not={
        <p>
          Skor tanı anında hesaplanır ve prognoz verir; göğüs tüpü, intraplevral tPA + DNaz ya da cerrahi kararını tek başına belirlemez. Pürülan
          OLMAYAN sıvının puan alması bilinçlidir: bu hastalarda mortalite daha yüksek bulunmuştur. Rahman NM ve ark., Chest 2014 (MIST1/MIST2
          kohortları).
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={7} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} bileşen yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
