"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * BISAP — Bedside Index for Severity in Acute Pancreatitis (Wu ve ark., Gut 2008).
 * İlk 24 saatteki değerler. 0–5; hastane mortalitesi skor başına.
 */
const eh: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 1 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string }> = [
  { id: "bun", baslik: "B — BUN > 25 mg/dL", aciklama: "Üre > 53,5 mg/dL'ye karşılık gelir (üre ≈ BUN × 2,14)." },
  { id: "bilinc", baslik: "I — Bilinç bozukluğu", aciklama: "GKS < 15." },
  {
    id: "sirs", baslik: "S — SIRS",
    aciklama: "Şunlardan ≥ 2'si: ateş > 38 °C ya da < 36 °C · nabız > 90/dk · solunum > 20/dk ya da PaCO₂ < 32 mmHg · lökosit > 12 000 ya da < 4 000/mm³ ya da > %10 çomak.",
  },
  { id: "yas", baslik: "A — Yaş > 60" },
  { id: "plevral", baslik: "P — Plevral efüzyon", aciklama: "Görüntülemede." },
];

/** Hastane mortalitesi (%) — Wu 2008, skor 0..5. */
const MORTALITE = [0.1, 0.4, 1.6, 3.6, 7.4, 9.5];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Düşük risk", alt: "Skora özgü mortalite aşağıda.", renk: "emerald" },
  { aralik: "3–5", etiket: "Yüksek risk", alt: "Skora özgü mortalite aşağıda — organ yetmezliği ve nekroz riski artmış; yakın izlem, yoğun bakım değerlendirmesi.", renk: "rose" },
];

export default function BisapPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + eh[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor >= 3 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="bisap"
      ikon="🥞"
      baslik="BISAP"
      altBaslik="Akut Pankreatitte Yatak Başı Şiddet İndeksi · İlk 24 Saat · 0–5"
      paylasim={{ bisap: skor }}
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
            Ranson'ın aksine 48 saat beklemez; ilk gün hesaplanır. Şiddetin kesin sınıflaması revize Atlanta ölçütleriyle (organ yetmezliğinin 48 saati aşması)
            yapılır. Wu BU ve ark., Gut 2008.
          </p>
        </>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={eh} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
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
