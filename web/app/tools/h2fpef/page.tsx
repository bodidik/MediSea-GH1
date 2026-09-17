"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * H₂FPEF — korunmuş ejeksiyon fraksiyonlu kalp yetmezliği olasılığı
 * (Reddy ve ark., Circulation 2018). Açıklanamayan nefes darlığı ve EF ≥ %50 olan hastada. 0–9.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "obez", baslik: "H — Obezite: BKİ > 30 kg/m²", secenekler: eh(2) },
  { id: "antihipertansif", baslik: "H — Hipertansiyon: ≥ 2 antihipertansif ilaç", secenekler: eh(1) },
  { id: "af", baslik: "F — Atriyal fibrilasyon (paroksismal ya da persistan)", secenekler: eh(3) },
  { id: "ph", baslik: "P — Pulmoner hipertansiyon: ekokardiyografide PASP > 35 mmHg", secenekler: eh(1) },
  { id: "yas", baslik: "E — Yaş > 60", secenekler: eh(1) },
  { id: "dolum", baslik: "F — Dolum basıncı: ekokardiyografide E/e' > 9", secenekler: eh(1) },
];

const BANTLAR: Bant[] = [
  { aralik: "0–1", etiket: "Düşük olasılık", alt: "HFpEF olasılığı düşük — nefes darlığının başka nedenlerini araştırın.", renk: "emerald" },
  { aralik: "2–5", etiket: "Ara olasılık", alt: "Tanı belirsiz — egzersiz ekokardiyografisi ya da invaziv hemodinamik değerlendirme önerilir.", renk: "amber" },
  { aralik: "6–9", etiket: "Yüksek olasılık", alt: "HFpEF olasılığı > %90 — ek test olmadan tanı kabul edilebilir.", renk: "rose" },
];

export default function H2fpefPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 1 ? BANTLAR[0] : skor <= 5 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="h2fpef"
      ikon="💓"
      baslik="H₂FPEF Skoru"
      altBaslik="Korunmuş EF'li Kalp Yetmezliği Olasılığı · 0–9"
      paylasim={{ h2fpef: skor }}
      not={
        <p>
          Yalnızca açıklanamayan nefes darlığı ve sol ventrikül EF ≥ %50 olan hastada kullanılır. Yayında skor başına sürekli bir olasılık eğrisi verilmiştir;
          buradaki üç grup o eğrinin klinik kullanımdaki özetidir. Alternatif algoritma: HFA-PEFF (ESC). Reddy YNV ve ark., Circulation 2018.
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
