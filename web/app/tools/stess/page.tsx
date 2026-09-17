"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * STESS — Status Epilepticus Severity Score (Rossetti ve ark., Neurology 2006; J Neurol 2008).
 * 0–6. Hastanede ölüm olasılığını öngörür; ≥ 3 olumsuz.
 *
 * "Önceki nöbet öyküsü" maddesinde puan YOKLUĞA verilir (bilinmiyorsa da 1).
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  {
    id: "bilinc",
    baslik: "Bilinç (en kötü durum)",
    secenekler: [
      { label: "Uyanık ya da uykulu/konfüze", pts: 0 },
      { label: "Stupor ya da koma", pts: 1 },
    ],
  },
  {
    id: "nobet",
    baslik: "En kötü nöbet tipi",
    secenekler: [
      { label: "Basit parsiyel, kompleks parsiyel, absans, miyoklonik (idiyopatik jeneralize epilepside)", pts: 0 },
      { label: "Jeneralize konvülsif", pts: 1 },
      { label: "Komada nonkonvülsif status", pts: 2 },
    ],
  },
  {
    id: "yas",
    baslik: "Yaş",
    secenekler: [
      { label: "< 65", pts: 0 },
      { label: "≥ 65", pts: 2 },
    ],
  },
  {
    id: "oyku",
    baslik: "Önceki nöbet öyküsü",
    aciklama: "Puan öykü YOKSA ya da bilinmiyorsa verilir.",
    secenekler: [
      { label: "Var", pts: 0 },
      { label: "Yok ya da bilinmiyor", pts: 1 },
    ],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Olumlu", alt: "Hastanede sağkalım olasılığı yüksek (özgün seride ≤ 2 için negatif öngörü değeri ~%97).", renk: "emerald" },
  { aralik: "3–6", etiket: "Olumsuz", alt: "Ölüm riski artmış — agresif tedavi ve yoğun bakım değerlendirmesi; etiyoloji prognozu belirleyen başlıca etken.", renk: "rose" },
];

export default function StessPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor >= 3 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="stess"
      ikon="⚡"
      baslik="STESS"
      altBaslik="Status Epileptikus Şiddet Skoru · 0–6"
      paylasim={{ stess: skor }}
      not={
        <p>
          STESS yüksek negatif öngörü değerine sahiptir: düşük skor sağkalımı iyi öngörür, yüksek skor ise ölümü tek başına öngörmez. Etiyolojiyi
          içermez; anoksik ensefalopati gibi etiyolojiler prognozu skordan bağımsız belirler (bu amaçla EMSE geliştirilmiştir). Tedavi kararlarını
          sınırlamak için kullanılmamalıdır. Rossetti AO ve ark., J Neurol 2008.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={6} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
