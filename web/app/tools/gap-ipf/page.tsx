"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * GAP indeksi ve evresi — idiyopatik pulmoner fibrozda mortalite (Ley ve ark., Ann Intern Med 2012).
 *   Gender: kadın 0 · erkek 1
 *   Age: ≤ 60 0 · 61–65 1 · > 65 2
 *   Physiology: FVC %beklenen > 75 0 · 50–75 1 · < 50 2
 *               DLCO %beklenen > 55 0 · 36–55 1 · ≤ 35 2 · yapılamıyor 3
 *   Toplam 0–8 · Evre I 0–3 · II 4–5 · III 6–8
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  { id: "cins", baslik: "G — Cinsiyet", secenekler: [{ label: "Kadın", pts: 0 }, { label: "Erkek", pts: 1 }] },
  { id: "yas", baslik: "A — Yaş", secenekler: [{ label: "≤ 60", pts: 0 }, { label: "61–65", pts: 1 }, { label: "> 65", pts: 2 }] },
  { id: "fvc", baslik: "P — FVC (% beklenen)", secenekler: [{ label: "> 75", pts: 0 }, { label: "50–75", pts: 1 }, { label: "< 50", pts: 2 }] },
  { id: "dlco", baslik: "P — DLCO (% beklenen)", secenekler: [
    { label: "> 55", pts: 0 },
    { label: "36–55", pts: 1 },
    { label: "≤ 35", pts: 2 },
    { label: "Test yapılamıyor", pts: 3 },
  ] },
];

const BANTLAR: Bant[] = [
  { aralik: "0–3", etiket: "Evre I", alt: "Mortalite 1 yıl %5,6 · 2 yıl %10,9 · 3 yıl %16,3.", renk: "emerald" },
  { aralik: "4–5", etiket: "Evre II", alt: "Mortalite 1 yıl %16,2 · 2 yıl %29,9 · 3 yıl %42,1.", renk: "amber" },
  { aralik: "6–8", etiket: "Evre III", alt: "Mortalite 1 yıl %39,2 · 2 yıl %62,1 · 3 yıl %76,8 — akciğer nakli değerlendirmesi ve palyatif bakım.", renk: "rose" },
];

export default function GapIpfPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 3 ? BANTLAR[0] : skor <= 5 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="gap-ipf"
      ikon="🫁"
      baslik="GAP İndeksi"
      altBaslik="İdiyopatik Pulmoner Fibroz · Evre ve Mortalite · 0–8"
      paylasim={{ gap: skor }}
      not={
        <p>
          İPF için geliştirilmiş ve doğrulanmıştır; öteki interstisyel akciğer hastalıklarında (ILD-GAP) ek bir tanı değişkeni gerekir. DLCO, hasta testi
          fizyolojik nedenle tamamlayamıyorsa "yapılamıyor" olarak puanlanır (3 puan). Antifibrotik tedavi dönemindeki kohortlarda mortalite daha düşük
          olabilir. Ley B ve ark., Ann Intern Med 2012.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={8} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} bileşen yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
