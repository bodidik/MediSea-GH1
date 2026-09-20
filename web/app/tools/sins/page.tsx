"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * SINS — Spinal Instability Neoplastic Score (Fisher ve ark., Spine 2010). 6 bileşen, 0–18.
 *   0–6 stabil · 7–12 belirsiz (olası instabilite) · 13–18 instabil
 * 7 ve üzeri cerrahi konsültasyonu gerektirir; skor tedavi kararını TEK BAŞINA vermez,
 * nörolojik durum (ESCC/Bilsky derecesi) ve tümör radyosensitivitesiyle birlikte değerlendirilir.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "yer", baslik: "Lokalizasyon", secenekler: [
    { label: "Rijit (T3–T10)", pts: 0 },
    { label: "Yarı rijit (T11–L5)", pts: 1 },
    { label: "Hareketli omurga (C3–C6, L2–L4)", pts: 2 },
    { label: "Bileşke (oksiput–C2, C7–T2, T11–L1, L5–S1)", pts: 3 },
  ] },
  { id: "agri", baslik: "Ağrı", aciklama: "Mekanik ağrı: yatınca geçen, ayakta durmakla ya da hareketle artan ağrı.", secenekler: [
    { label: "Ağrısız lezyon", pts: 0 },
    { label: "Ara ara olan, mekanik olmayan ağrı", pts: 1 },
    { label: "Yatmakla geçen / harekete bağlı mekanik ağrı", pts: 3 },
  ] },
  { id: "kemik", baslik: "Kemik lezyonunun tipi", secenekler: [
    { label: "Blastik", pts: 0 },
    { label: "Karışık (litik + blastik)", pts: 1 },
    { label: "Litik", pts: 2 },
  ] },
  { id: "dizilim", baslik: "Radyografik omurga dizilimi", secenekler: [
    { label: "Normal dizilim", pts: 0 },
    { label: "Yeni gelişen deformite (kifoz / skolyoz)", pts: 2 },
    { label: "Subluksasyon ya da translasyon", pts: 4 },
  ] },
  { id: "cokme", baslik: "Vertebra korpusunda çökme", secenekler: [
    { label: "Çökme yok, korpus tutulumu < %50", pts: 0 },
    { label: "Çökme yok ama korpusun > %50'si tutulmuş", pts: 1 },
    { label: "< %50 çökme", pts: 2 },
    { label: "> %50 çökme", pts: 3 },
  ] },
  { id: "posterolateral", baslik: "Posterolateral elemanların tutulumu", aciklama: "Faset, pedikül ya da kostovertebral eklemde kırık veya tümörle yer değiştirme.", secenekler: [
    { label: "Yok", pts: 0 },
    { label: "Tek taraflı", pts: 1 },
    { label: "İki taraflı", pts: 3 },
  ] },
];

const BANTLAR: Bant[] = [
  { aralik: "0–6", etiket: "Stabil", alt: "Cerrahi stabilizasyon genellikle gerekmez; radyoterapi ve sistemik tedavi planlanabilir.", renk: "emerald" },
  { aralik: "7–12", etiket: "Belirsiz", alt: "Olası instabilite — cerrahi konsültasyonu önerilir.", renk: "amber" },
  { aralik: "13–18", etiket: "İnstabil", alt: "İnstabilite — cerrahi stabilizasyon değerlendirmesi gerekir.", renk: "rose" },
];

export default function SinsPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 6 ? BANTLAR[0] : skor <= 12 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="sins"
      ikon="🦴"
      baslik="SINS Spinal İnstabilite Skoru"
      altBaslik="Neoplastik Omurga Tutulumunda Mekanik İnstabilite · 0–18"
      paylasim={{ sins: skor }}
      not={
        <p>
          Skor mekanik instabiliteyi ölçer; nörolojik bası (epidural spinal kord kompresyonu) AYRI bir acildir ve ilerleyici defisitte skordan bağımsız
          olarak acil görüntüleme, yüksek doz kortikosteroid ve cerrahi/radyoterapi değerlendirmesi gerektirir. 7 ve üzeri skorda cerrahi görüşü
          önerilir. Fisher CG ve ark., Spine 2010 (Spine Oncology Study Group).
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={18} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} bileşen yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
