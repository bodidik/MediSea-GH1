"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * ORBIT kanama skoru — atriyal fibrilasyonda oral antikoagülasyon altında majör kanama
 * (O'Brien ve ark., Eur Heart J 2015). 0–7.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "yas", baslik: "O — Yaş ≥ 75", secenekler: eh(1) },
  {
    id: "hb", baslik: "R — Düşük hemoglobin / hematokrit ya da anemi öyküsü",
    aciklama: "Hb erkekte < 13, kadında < 12 g/dL · Hct erkekte < %40, kadında < %36.", secenekler: eh(2),
  },
  { id: "kanama", baslik: "B — Kanama öyküsü", aciklama: "Gastrointestinal, intrakraniyal ya da hemorajik inme dahil.", secenekler: eh(2) },
  { id: "bobrek", baslik: "I — Böbrek işlevi yetersiz: eGFR < 60 mL/dk/1,73 m²", secenekler: eh(1) },
  { id: "antiplatelet", baslik: "T — Antiplatelet tedavi", secenekler: eh(1) },
];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Düşük risk", alt: "Majör kanama ~2,4 / 100 hasta-yılı.", renk: "emerald" },
  { aralik: "3", etiket: "Orta risk", alt: "Majör kanama ~4,7 / 100 hasta-yılı.", renk: "amber" },
  { aralik: "4–7", etiket: "Yüksek risk", alt: "Majör kanama ~8,1 / 100 hasta-yılı — düzeltilebilir risk etkenlerini ele alın.", renk: "rose" },
];

export default function OrbitPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 2 ? BANTLAR[0] : skor === 3 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="orbit"
      ikon="🩸"
      baslik="ORBIT Kanama Skoru"
      altBaslik="Atriyal Fibrilasyonda Antikoagülasyon · Majör Kanama Riski · 0–7"
      paylasim={{ orbit: skor }}
      not={
        <p>
          Yüksek kanama skoru antikoagülasyonu kesme gerekçesi değildir; düzeltilebilir etkenleri (anemi, gereksiz antiplatelet, böbrek işlevi)
          belirlemek ve izlemi sıklaştırmak içindir. ORBIT-AF kaydında geliştirilmiş, ROCKET-AF'ta doğrulanmıştır; HAS-BLED ile karşılaştırılabilir
          ayırt edicilik gösterir. O&apos;Brien EC ve ark., Eur Heart J 2015.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={7} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
