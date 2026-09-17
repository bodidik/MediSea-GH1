"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * PLASMIC skoru — trombotik mikroanjiyopatide ağır ADAMTS13 eksikliği (TTP) olasılığı
 * (Bendapudi ve ark., Lancet Haematol 2017). 0–7.
 *
 * Maddelerin üçünde puan bir şeyin YOKLUĞUNA veriliyor (kanser yok, nakil yok) ya da eşiğin
 * ALTINDA kalmaya (MCV, INR, kreatinin). Şıklar bu yüzden "puan getiren durum" önce gelecek
 * şekilde değil, klinik okuma sırasıyla yazıldı ve rozet puanı gösteriyor.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "plt", baslik: "Trombosit sayısı", secenekler: [{ label: "< 30 × 10⁹/L", pts: 1 }, { label: "≥ 30 × 10⁹/L", pts: 0 }] },
  {
    id: "hemoliz", baslik: "Hemoliz bulgusu",
    aciklama: "Retikülosit > %2,5 ya da haptoglobin saptanamayacak kadar düşük ya da indirekt bilirubin > 2 mg/dL.",
    secenekler: [{ label: "Var", pts: 1 }, { label: "Yok", pts: 0 }],
  },
  { id: "kanser", baslik: "Aktif kanser", aciklama: "Son 1 yılda tedavi edilmiş.", secenekler: [{ label: "Yok", pts: 1 }, { label: "Var", pts: 0 }] },
  { id: "nakil", baslik: "Solid organ ya da kök hücre nakli öyküsü", secenekler: [{ label: "Yok", pts: 1 }, { label: "Var", pts: 0 }] },
  { id: "mcv", baslik: "MCV", secenekler: [{ label: "< 90 fL", pts: 1 }, { label: "≥ 90 fL", pts: 0 }] },
  { id: "inr", baslik: "INR", secenekler: [{ label: "< 1,5", pts: 1 }, { label: "≥ 1,5", pts: 0 }] },
  { id: "kreatinin", baslik: "Kreatinin", secenekler: [{ label: "< 2,0 mg/dL", pts: 1 }, { label: "≥ 2,0 mg/dL", pts: 0 }] },
];

const BANTLAR: Bant[] = [
  { aralik: "0–4", etiket: "Düşük olasılık", alt: "Ağır ADAMTS13 eksikliği olasılığı düşük (özgün seride ~%0–4) — diğer TMA nedenlerini araştırın.", renk: "emerald" },
  { aralik: "5", etiket: "Ara olasılık", alt: "Olasılık ~%5–24 — ADAMTS13 gönderin; klinik tabloya göre plazma değişimini tartışın.", renk: "amber" },
  { aralik: "6–7", etiket: "Yüksek olasılık", alt: "Olasılık ~%62–82 — ADAMTS13 örneğini alıp sonucu beklemeden plazma değişimi ve steroid; hematoloji acil.", renk: "rose" },
];

export default function PlasmicPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 4 ? BANTLAR[0] : skor === 5 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="plasmic"
      ikon="🧬"
      baslik="PLASMIC Skoru"
      altBaslik="Trombotik Mikroanjiyopatide TTP (ADAMTS13 < %10) Olasılığı · 0–7"
      paylasim={{ plasmic: skor }}
      not={
        <p>
          Mikroanjiyopatik hemolitik anemi ve trombositopenisi olan (şistositli) erişkinde kullanılır. Skor, ADAMTS13 sonucu gelene kadar ampirik
          plazma değişimi kararını destekler; ADAMTS13 düzeyi plazma değişiminden önce alınmalıdır. Bendapudi PK ve ark., Lancet Haematol 2017.
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
