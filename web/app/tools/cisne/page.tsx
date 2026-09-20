"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * CISNE — görünüşte STABİL solid tümörlü febril nötropeni hastasında komplikasyon riski
 * (Carmona-Bayonas ve ark., J Clin Oncol 2015). 6 madde, 0–8.
 *   ECOG ≥ 2  → 2 · Strese bağlı hiperglisemi → 2 · KOAH → 1 · Kardiyovasküler hastalık → 1
 *   NCI mukozit derece ≥ 2 → 1 · Monosit < 200/µL → 1
 *   0 düşük · 1–2 orta · ≥ 3 yüksek risk
 * MASCC'ten farkı: yalnızca STABİL hastada kullanılır ve düşük riski daha KESİN ayırır.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; puan: number }> = [
  { id: "ecog", baslik: "ECOG performans durumu ≥ 2", puan: 2 },
  { id: "hiperglisemi", baslik: "Strese bağlı hiperglisemi", aciklama: "Diyabeti olmayan hastada başvuruda glukoz > 250 mg/dL, ya da diyabetik hastada belirgin kontrolsüzlük.", puan: 2 },
  { id: "koah", baslik: "Kronik obstrüktif akciğer hastalığı", puan: 1 },
  { id: "kvh", baslik: "Kronik kardiyovasküler hastalık", puan: 1 },
  { id: "mukozit", baslik: "NCI ölçeğine göre derece ≥ 2 mukozit", puan: 1 },
  { id: "monosit", baslik: "Monosit < 200/µL", puan: 1 },
];

const BANTLAR: Bant[] = [
  { aralik: "0", etiket: "Düşük risk", alt: "Komplikasyon oranı düşük — uygun hastada ayaktan oral antibiyotik tedavisi düşünülebilir.", renk: "emerald" },
  { aralik: "1–2", etiket: "Orta risk", alt: "Komplikasyon riski ara düzeyde — ayaktan tedavi güvenli sayılmaz, gözlem/yatış.", renk: "amber" },
  { aralik: "≥ 3", etiket: "Yüksek risk", alt: "Komplikasyon riski yüksek — yatış ve intravenöz geniş spektrumlu antibiyotik.", renk: "rose" },
];

export default function CisnePage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + (sel[m.id] === 1 ? m.puan : 0), 0) : null;
  const bant = skor === null ? null : skor === 0 ? BANTLAR[0] : skor <= 2 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="cisne"
      ikon="🌡️"
      baslik="CISNE Skoru"
      altBaslik="Stabil Febril Nötropenide Komplikasyon Riski · 0–8"
      paylasim={{ cisne: skor }}
      not={
        <p>
          Yalnız solid tümörlü ve başvuruda KLİNİK OLARAK STABİL hastalarda geçerlidir; hemodinamik instabilite, akut organ yetmezliği, ağır enfeksiyon
          bulgusu, akut lösemi ya da kök hücre nakli varsa skor uygulanmaz — bu hastalar doğrudan yüksek risklidir. Ayaktan tedavi kararı sosyal koşullar,
          oral alım ve izlem olanağıyla birlikte verilir. Carmona-Bayonas A ve ark., J Clin Oncol 2015.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={eh(m.puan)} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={8} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
