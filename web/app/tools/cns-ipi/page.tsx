"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * CNS-IPI — diffüz büyük B hücreli lenfomada 2 yıllık santral sinir sistemi nüks riski
 * (Schmitz ve ark., J Clin Oncol 2016). IPI'nin 5 maddesi + böbrek/adrenal tutulumu, 0–6.
 */
const eh: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 1 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string }> = [
  { id: "yas", baslik: "Yaş > 60" },
  { id: "ldh", baslik: "LDH normalin üst sınırının üstünde" },
  { id: "ecog", baslik: "ECOG performans durumu > 1" },
  { id: "evre", baslik: "Ann Arbor evre III–IV" },
  { id: "ekstranodal", baslik: "Birden fazla ekstranodal tutulum" },
  { id: "bobrek", baslik: "Böbrek ve/veya adrenal tutulumu" },
];

const BANTLAR: Bant[] = [
  { aralik: "0–1", etiket: "Düşük risk", alt: "2 yıllık SSS nüksü ~%0,6.", renk: "emerald" },
  { aralik: "2–3", etiket: "Orta risk", alt: "2 yıllık SSS nüksü ~%3,4.", renk: "amber" },
  { aralik: "4–6", etiket: "Yüksek risk", alt: "2 yıllık SSS nüksü ~%10,2 — BOS sitolojisi/akım sitometrisi ve beyin MR; profilaksi kararı multidisipliner.", renk: "rose" },
];

export default function CnsIpiPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + eh[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 1 ? BANTLAR[0] : skor <= 3 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="cns-ipi"
      ikon="🧠"
      baslik="CNS-IPI"
      altBaslik="DBBHL'de 2 Yıllık Santral Sinir Sistemi Nüks Riski · 0–6"
      paylasim={{ cnsIpi: skor }}
      not={
        <p>
          R-CHOP benzeri tedavi alan DBBHL hastalarında geliştirilmiştir. Skordan bağımsız yüksek riskli durumlar: testis, meme, uterus ve böbrek üstü
          tutulumu, intravasküler lenfoma, MYC ve BCL2 yeniden düzenlenmesi (yüksek dereceli B hücreli lenfoma). Yüksek doz metotreksat profilaksisinin
          yararı tartışmalıdır. Schmitz N ve ark., J Clin Oncol 2016.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={eh} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={6} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
