"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * DECAF skoru — KOAH alevlenmesiyle yatan hastada hastane içi mortalite (Steer ve ark., Thorax 2012).
 *   D  dispne (eMRCD): 1–4 → 0 · 5a (evden çıkamıyor, kendi yıkanıp giyinebiliyor) → 1 · 5b (yıkanma/giyinmede yardım gerekiyor) → 2
 *   E  eozinopeni < 0,05 × 10⁹/L → 1
 *   C  radyolojik konsolidasyon → 1
 *   A  asidemi pH < 7,30 → 1
 *   F  atriyal fibrilasyon (öykü ya da başvuru EKG'si) → 1
 *   0–1 düşük · 2 orta · 3–6 yüksek risk
 */
const eh: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 1 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "dispne", baslik: "D — Stabil dönemdeki dispne (genişletilmiş MRC)", secenekler: [
    { label: "eMRCD 1–4 — evden çıkabiliyor", pts: 0 },
    { label: "5a — nefes darlığından evden çıkamıyor, kendi yıkanıp giyinebiliyor", pts: 1 },
    { label: "5b — evden çıkamıyor, yıkanma ya da giyinmede yardım gerekiyor", pts: 2 },
  ] },
  { id: "eoz", baslik: "E — Eozinopeni: eozinofil < 0,05 × 10⁹/L (< 50/µL)", secenekler: eh },
  { id: "kons", baslik: "C — Akciğer grafisinde konsolidasyon", secenekler: eh },
  { id: "asidemi", baslik: "A — Asidemi: arteriyel pH < 7,30", secenekler: eh },
  { id: "af", baslik: "F — Atriyal fibrilasyon", aciklama: "Öyküde ya da başvurudaki EKG'de.", secenekler: eh },
];

const BANTLAR: Bant[] = [
  { aralik: "0–1", etiket: "Düşük risk", alt: "Hastane içi mortalite düşük — evde bakım ya da erken taburculuk adayı.", renk: "emerald" },
  { aralik: "2", etiket: "Orta risk", alt: "Klinik yargıyla yatış ya da erken taburculuk.", renk: "amber" },
  { aralik: "3–6", etiket: "Yüksek risk", alt: "Hastane içi mortalite yüksek — yakın izlem, NIV ve bakım hedefleri erken konuşulmalı.", renk: "rose" },
];

export default function DecafPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 1 ? BANTLAR[0] : skor === 2 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="decaf"
      ikon="🫁"
      baslik="DECAF Skoru"
      altBaslik="KOAH Alevlenmesinde Hastane İçi Mortalite · 0–6"
      paylasim={{ decaf: skor }}
      not={
        <p>
          Dispne, alevlenmeden ÖNCEKİ stabil dönemdeki duruma göre puanlanır (akut tabloya göre değil). Eozinofil ve pH başvurudaki ilk ölçümdür. Düşük
          riskli hastada evde bakım programıyla güvenli erken taburculuk gösterilmiştir. Steer J ve ark., Thorax 2012.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={6} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} bileşen yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
