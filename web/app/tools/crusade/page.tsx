"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * CRUSADE kanama skoru — NSTEMI'de hastane içi majör kanama (Subherwal ve ark., Circulation 2009). 1–100.
 * Aralık sınırları yayındaki tabloyu izliyor; kreatinin klirensi Cockcroft-Gault ile hesaplanır.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  {
    id: "hct", baslik: "Başvuru hematokriti (%)",
    secenekler: [
      { label: "< 31", pts: 9 }, { label: "31–33,9", pts: 7 }, { label: "34–36,9", pts: 3 }, { label: "37–39,9", pts: 2 }, { label: "≥ 40", pts: 0 },
    ],
  },
  {
    id: "crcl", baslik: "Kreatinin klirensi (mL/dk, Cockcroft-Gault)",
    secenekler: [
      { label: "≤ 15", pts: 39 }, { label: "> 15–30", pts: 35 }, { label: "> 30–60", pts: 28 }, { label: "> 60–90", pts: 17 }, { label: "> 90–120", pts: 7 }, { label: "> 120", pts: 0 },
    ],
  },
  {
    id: "nabiz", baslik: "Başvuru kalp hızı (/dk)",
    secenekler: [
      { label: "≤ 70", pts: 0 }, { label: "71–80", pts: 1 }, { label: "81–90", pts: 3 }, { label: "91–100", pts: 6 }, { label: "101–110", pts: 8 }, { label: "111–120", pts: 10 }, { label: "≥ 121", pts: 11 },
    ],
  },
  {
    id: "sks", baslik: "Başvuru sistolik kan basıncı (mmHg)",
    secenekler: [
      { label: "≤ 90", pts: 10 }, { label: "91–100", pts: 8 }, { label: "101–120", pts: 5 }, { label: "121–180", pts: 1 }, { label: "181–200", pts: 3 }, { label: "≥ 201", pts: 5 },
    ],
  },
  { id: "kadin", baslik: "Kadın cinsiyet", secenekler: eh(8) },
  { id: "ky", baslik: "Başvuruda kalp yetmezliği bulguları", secenekler: eh(7) },
  { id: "vaskuler", baslik: "Önceki vasküler hastalık", aciklama: "Periferik arter hastalığı ya da önceki inme.", secenekler: eh(6) },
  { id: "dm", baslik: "Diyabet", secenekler: eh(6) },
];

const BANTLAR: Bant[] = [
  { aralik: "≤ 20", etiket: "Çok düşük", alt: "Hastane içi majör kanama ~%3,1.", renk: "emerald" },
  { aralik: "21–30", etiket: "Düşük", alt: "Hastane içi majör kanama ~%5,5.", renk: "emerald" },
  { aralik: "31–40", etiket: "Orta", alt: "Hastane içi majör kanama ~%8,6.", renk: "amber" },
  { aralik: "41–50", etiket: "Yüksek", alt: "Hastane içi majör kanama ~%11,9 — radiyal erişim, doz ayarı, PPI.", renk: "orange" },
  { aralik: "> 50", etiket: "Çok yüksek", alt: "Hastane içi majör kanama ~%19,5 — kanama azaltıcı stratejileri önceliklendirin.", renk: "rose" },
];

function bantBul(s: number) {
  if (s <= 20) return BANTLAR[0];
  if (s <= 30) return BANTLAR[1];
  if (s <= 40) return BANTLAR[2];
  if (s <= 50) return BANTLAR[3];
  return BANTLAR[4];
}

export default function CrusadePage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;

  return (
    <OlcekKabugu
      slug="crusade"
      ikon="🩸"
      baslik="CRUSADE Kanama Skoru"
      altBaslik="NSTEMI · Hastane İçi Majör Kanama Riski"
      paylasim={{ crusade: skor }}
      not={
        <p>
          CRUSADE kaydında invaziv strateji uygulanan NSTEMI hastalarında geliştirilmiştir; STEMI ve yeni kuşak P2Y12 inhibitörleri döneminde ayırt ediciliği
          sınırlıdır. Kreatinin klirensi için Cockcroft-Gault aracını kullanabilirsiniz. Subherwal S ve ark., Circulation 2009.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} bantlar={BANTLAR} aktif={skor === null ? null : bantBul(skor)} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
