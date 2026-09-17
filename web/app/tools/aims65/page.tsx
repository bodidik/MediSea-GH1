"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * AIMS65 — üst GİS kanamasında hastane mortalitesi (Saltzman ve ark., Gastrointest Endosc 2011). 0–5.
 * Glasgow-Blatchford müdahale gereksinimini, AIMS65 ölümü öngörür — ikisi farklı soruya yanıt verir.
 */
const eh: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 1 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string }> = [
  { id: "albumin", baslik: "A — Albümin < 3,0 g/dL" },
  { id: "inr", baslik: "I — INR > 1,5" },
  { id: "bilinc", baslik: "M — Bilinç değişikliği (GKS < 14, dezoryantasyon, letarji, stupor, koma)" },
  { id: "sks", baslik: "S — Sistolik kan basıncı ≤ 90 mmHg" },
  { id: "yas", baslik: "65 — Yaş ≥ 65" },
];

/** Hastane mortalitesi (%) — Saltzman 2011 doğrulama kohortu, skor 0..5. */
const MORTALITE = [0.3, 1.2, 5.3, 10.3, 16.5, 24.5];

const BANTLAR: Bant[] = [
  { aralik: "0–1", etiket: "Düşük risk", alt: "Skora özgü hastane mortalitesi aşağıda.", renk: "emerald" },
  { aralik: "≥ 2", etiket: "Yüksek risk", alt: "Skora özgü hastane mortalitesi aşağıda — yakın izlem, erken endoskopi.", renk: "rose" },
];

export default function Aims65Page() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + eh[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor >= 2 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="aims65"
      ikon="🩸"
      baslik="AIMS65"
      altBaslik="Üst GİS Kanamasında Hastane Mortalitesi · 0–5"
      paylasim={{ aims65: skor }}
      not={
        <>
          <p className="font-black text-slate-700">Hastane mortalitesi (%) — skor: oran</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
            {MORTALITE.map((m, i) => (
              <li key={i} className={skor === i ? "font-black text-blue-900" : ""}>
                {i}: %{String(m).replace(".", ",")}{skor === i ? " (bu hasta)" : ""}
              </li>
            ))}
          </ul>
          <p>
            Başvurudaki değerlerle hesaplanır. Ayaktan izlem kararında (ör. düşük riskli hastayı taburcu etmek) Glasgow-Blatchford skoru daha iyi
            ayırt edicidir. Saltzman JR ve ark., Gastrointest Endosc 2011.
          </p>
        </>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={eh} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={5}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
        ek={skor !== null ? <p className="text-[13px] font-black text-slate-800">Hastane mortalitesi ~%{String(MORTALITE[skor]).replace(".", ",")}</p> : null}
      />
    </OlcekKabugu>
  );
}
