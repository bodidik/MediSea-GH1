"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Hodgkin lenfoma Uluslararası Prognostik Skoru (IPS, Hasenclever) — ileri evre
 * (Hasenclever & Diehl, N Engl J Med 1998). 0–7, progresyonsuz sağkalım skor başına.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "albumin", baslik: "Albümin < 4 g/dL", secenekler: eh(1) },
  { id: "hb", baslik: "Hemoglobin < 10,5 g/dL", secenekler: eh(1) },
  { id: "erkek", baslik: "Erkek cinsiyet", secenekler: eh(1) },
  { id: "yas", baslik: "Yaş ≥ 45", secenekler: eh(1) },
  { id: "evre", baslik: "Ann Arbor evre IV", secenekler: eh(1) },
  { id: "lokosit", baslik: "Lökosit ≥ 15 × 10⁹/L", secenekler: eh(1) },
  { id: "lenfosit", baslik: "Lenfopeni", aciklama: "Lenfosit < 0,6 × 10⁹/L ya da lökositin < %8'i.", secenekler: eh(1) },
];

/** 5 yıllık progresyonsuz sağkalım (%) — skor 0..4 ve ≥ 5. */
const FFP = [84, 77, 67, 60, 51, 42];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Düşük risk", alt: "Skora özgü 5 yıllık progresyonsuz sağkalım aşağıda.", renk: "emerald" },
  { aralik: "≥ 3", etiket: "Yüksek risk", alt: "Skora özgü 5 yıllık progresyonsuz sağkalım aşağıda.", renk: "rose" },
];

export default function HodgkinIpsPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor >= 3 ? BANTLAR[1] : BANTLAR[0];
  const ffp = skor === null ? null : FFP[Math.min(skor, 5)];

  return (
    <OlcekKabugu
      slug="hodgkin-ips"
      ikon="🔬"
      baslik="Hodgkin IPS"
      altBaslik="İleri Evre Hodgkin Lenfoma · Hasenclever Skoru · 0–7"
      paylasim={{ ips: skor }}
      not={
        <>
          <p className="font-black text-slate-700">5 yıllık progresyonsuz sağkalım — skor: oran</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
            {FFP.map((f, i) => {
              const aktif = skor !== null && Math.min(skor, 5) === i;
              return (
                <li key={i} className={aktif ? "font-black text-blue-900" : ""}>
                  {i === 5 ? "≥ 5" : i}: %{f}{aktif ? " (bu hasta)" : ""}
                </li>
              );
            })}
          </ul>
          <p>
            Oranlar ABVD öncesi ve erken ABVD döneminin kohortuna aittir; güncel tedavilerle mutlak sonuçlar daha iyidir. Erken evre hastalık için
            EORTC/GHSG risk etkenleri kullanılır. Hasenclever D, Diehl V, N Engl J Med 1998.
          </p>
        </>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={7}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
        ek={ffp !== null ? <p className="text-[13px] font-black text-slate-800">5 yıllık progresyonsuz sağkalım ~%{ffp}</p> : null}
      />
    </OlcekKabugu>
  );
}
