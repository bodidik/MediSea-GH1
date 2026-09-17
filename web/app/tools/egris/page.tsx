"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * EGRIS — Erasmus GBS Respiratory Insufficiency Score (Walgaard ve ark., Ann Neurol 2010).
 * Başvuruda Guillain-Barré sendromlu hastada ilk 1 haftada mekanik ventilasyon riski. 0–7.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  {
    id: "gun",
    baslik: "Güçsüzlüğün başlangıcından hastaneye yatışa kadar geçen gün",
    secenekler: [
      { label: "> 7 gün", pts: 0 },
      { label: "4–7 gün", pts: 1 },
      { label: "≤ 3 gün", pts: 2 },
    ],
  },
  {
    id: "yuzBulber",
    baslik: "Yatışta yüz ve/veya bulber güçsüzlük",
    secenekler: [
      { label: "Yok", pts: 0 },
      { label: "Var", pts: 1 },
    ],
  },
  {
    id: "mrc",
    baslik: "Yatışta MRC toplam kas gücü skoru",
    aciklama: "6 kas grubu × 2 taraf, 0–60. Hesaplamak için MRC Toplam Kas Gücü aracını kullanabilirsiniz.",
    secenekler: [
      { label: "51–60", pts: 0 },
      { label: "41–50", pts: 1 },
      { label: "31–40", pts: 2 },
      { label: "21–30", pts: 3 },
      { label: "≤ 20", pts: 4 },
    ],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Düşük risk", alt: "İlk haftada mekanik ventilasyon riski ~%4.", renk: "emerald" },
  { aralik: "3–4", etiket: "Orta risk", alt: "İlk haftada mekanik ventilasyon riski ~%24 — solunum fonksiyonlarını (VC, MIP/MEP) yakın izleyin.", renk: "amber" },
  { aralik: "5–7", etiket: "Yüksek risk", alt: "İlk haftada mekanik ventilasyon riski ~%65 — yoğun bakım izlemi önerilir.", renk: "rose" },
];

export default function EgrisPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 2 ? BANTLAR[0] : skor <= 4 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="egris"
      ikon="🫁"
      baslik="EGRIS"
      altBaslik="Guillain-Barré · 1 Haftada Mekanik Ventilasyon Riski · 0–7"
      paylasim={{ egris: skor }}
      not={
        <p>
          Hollanda kohortunda geliştirilmiştir; skor yatışta hesaplanır. Düşük skor solunum izlemini gereksiz kılmaz — vital kapasite &lt; 20 mL/kg,
          MIP &lt; 30 cmH₂O ya da MEP &lt; 40 cmH₂O entübasyon riskine işaret eder. Walgaard C ve ark., Ann Neurol 2010.
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
