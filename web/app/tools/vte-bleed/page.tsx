"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * VTE-BLEED — venöz tromboembolide antikoagülasyonun ilk 30 gününden sonra majör kanama riski
 * (Klok ve ark., Eur Respir J 2016). Buçuklu puanlar; toplam 0–8, ≥ 2 yüksek risk.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "kanser", baslik: "Aktif kanser", aciklama: "Son 6 ayda tanı, metastatik hastalık ya da süren kemoterapi.", secenekler: eh(2) },
  { id: "ht", baslik: "Kontrolsüz hipertansiyonu olan erkek", aciklama: "Erkek ve başvuruda SKB ≥ 140 mmHg.", secenekler: eh(1) },
  { id: "anemi", baslik: "Anemi", aciklama: "Hb erkekte < 13, kadında < 12 g/dL.", secenekler: eh(1.5) },
  { id: "kanama", baslik: "Kanama öyküsü", aciklama: "Önceki majör ya da klinik olarak anlamlı majör olmayan kanama, rektal kanama, sık burun kanaması, hematüri.", secenekler: eh(1.5) },
  { id: "yas", baslik: "Yaş ≥ 60", secenekler: eh(1.5) },
  { id: "bobrek", baslik: "Böbrek işlev bozukluğu", aciklama: "Kreatinin klirensi 30–60 mL/dk.", secenekler: eh(1.5) },
];

const BANTLAR: Bant[] = [
  { aralik: "< 2", etiket: "Düşük risk", alt: "Uzun süreli antikoagülasyonda majör kanama riski düşük.", renk: "emerald" },
  { aralik: "≥ 2", etiket: "Yüksek risk", alt: "Majör kanama riski yüksek — uzatılmış antikoagülasyon kararında bu risk tromboz nüks riskiyle tartılmalı; düzeltilebilir etkenleri ele alın.", renk: "rose" },
];

export default function VteBleedPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor >= 2 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="vte-bleed"
      ikon="🩸"
      baslik="VTE-BLEED"
      altBaslik="VTE'de Antikoagülasyon Altında Majör Kanama Riski · ≥ 2 Yüksek"
      paylasim={{ vteBleed: skor }}
      not={
        <p>
          RE-COVER dabigatran/varfarin çalışmalarında geliştirilmiş, Hokusai-VTE ve kayıt verilerinde doğrulanmıştır. Yüksek skor tek başına antikoagülasyonu
          kesme gerekçesi değildir. Klok FA ve ark., Eur Respir J 2016.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={9} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
