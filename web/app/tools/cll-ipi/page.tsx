"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * CLL-IPI — kronik lenfositik lösemi uluslararası prognostik indeksi
 * (International CLL-IPI Working Group, Lancet Oncol 2016). 0–10.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "tp53", baslik: "TP53 bozukluğu", aciklama: "del(17p) ve/veya TP53 mutasyonu.", secenekler: eh(4) },
  { id: "ighv", baslik: "IGHV mutasyonsuz", secenekler: eh(2) },
  { id: "b2m", baslik: "β2-mikroglobulin > 3,5 mg/L", secenekler: eh(2) },
  { id: "evre", baslik: "Klinik evre Binet B/C ya da Rai I–IV", secenekler: eh(1) },
  { id: "yas", baslik: "Yaş > 65", secenekler: eh(1) },
];

const BANTLAR: Bant[] = [
  { aralik: "0–1", etiket: "Düşük", alt: "5 yıllık genel sağkalım ~%93 — tedavi gereksinimi yoksa izlem.", renk: "emerald" },
  { aralik: "2–3", etiket: "Orta", alt: "5 yıllık genel sağkalım ~%79.", renk: "amber" },
  { aralik: "4–6", etiket: "Yüksek", alt: "5 yıllık genel sağkalım ~%63.", renk: "orange" },
  { aralik: "7–10", etiket: "Çok yüksek", alt: "5 yıllık genel sağkalım ~%23 — tedavi gerekiyorsa kemoimmünoterapi yerine hedefe yönelik ajanlar.", renk: "rose" },
];

export default function CllIpiPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 1 ? BANTLAR[0] : skor <= 3 ? BANTLAR[1] : skor <= 6 ? BANTLAR[2] : BANTLAR[3];

  return (
    <OlcekKabugu
      slug="cll-ipi"
      ikon="🔬"
      baslik="CLL-IPI"
      altBaslik="Kronik Lenfositik Lösemi · Uluslararası Prognostik İndeks · 0–10"
      paylasim={{ cllIpi: skor }}
      not={
        <p>
          Sağkalım oranları kemoimmünoterapi döneminin kohortlarından alınmıştır; BTK ve BCL2 inhibitörleri çağında mutlak oranlar daha iyidir. Skor
          tedaviye başlama endikasyonu değildir — o karar iwCLL ölçütlerine göre verilir. International CLL-IPI Working Group, Lancet Oncol 2016.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={10} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
