"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * DIPSS — Dinamik Uluslararası Prognostik Skorlama Sistemi, primer miyelofibroz
 * (Passamonti ve ark., Blood 2010). Hastalığın herhangi bir zamanında uygulanabilir. 0–6.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "yas", baslik: "Yaş > 65", secenekler: eh(1) },
  { id: "lokosit", baslik: "Lökosit > 25 × 10⁹/L", secenekler: eh(1) },
  { id: "hb", baslik: "Hemoglobin < 10 g/dL", secenekler: eh(2) },
  { id: "blast", baslik: "Periferik blast ≥ %1", secenekler: eh(1) },
  { id: "konstitusyonel", baslik: "Konstitüsyonel semptomlar", aciklama: "Son 6 ayda > %10 kilo kaybı, gece terlemesi ya da açıklanamayan ateş (> 37,5 °C).", secenekler: eh(1) },
];

const BANTLAR: Bant[] = [
  { aralik: "0", etiket: "Düşük", alt: "Medyan sağkalım ulaşılmadı.", renk: "emerald" },
  { aralik: "1–2", etiket: "Orta-1", alt: "Medyan sağkalım ~14 yıl.", renk: "amber" },
  { aralik: "3–4", etiket: "Orta-2", alt: "Medyan sağkalım ~4 yıl — allojenik nakil uygunluğu değerlendirilmeli.", renk: "orange" },
  { aralik: "5–6", etiket: "Yüksek", alt: "Medyan sağkalım ~1,5 yıl — allojenik nakil uygunluğu değerlendirilmeli.", renk: "rose" },
];

export default function DipssPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor === 0 ? BANTLAR[0] : skor <= 2 ? BANTLAR[1] : skor <= 4 ? BANTLAR[2] : BANTLAR[3];

  return (
    <OlcekKabugu
      slug="dipss"
      ikon="🦴"
      baslik="DIPSS"
      altBaslik="Primer Miyelofibroz · Dinamik Prognostik Skor · 0–6"
      paylasim={{ dipss: skor }}
      not={
        <p>
          DIPSS-Plus bu skora trombositopeni (&lt; 100 × 10⁹/L), transfüzyon bağımlılığı ve olumsuz karyotipi ekler; genetik bilgi varsa MIPSS70 ve
          GIPSS daha ayrıntılı risk verir. Sekonder (post-PV/ET) miyelofibrozda MYSEC-PM kullanılır. Passamonti F ve ark., Blood 2010.
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
