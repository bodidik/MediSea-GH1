"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * DOSE indeksi — Jones RC ve ark., Am J Respir Crit Care Med 2009;180:1189–1195.
 * Dispne (mMRC) + Obstrüksiyon (FEV1 %) + Sigara (aktif içici) + Alevlenme (son 1 yıl) → 0–8.
 * ≥ 4: hastane yatışı (OR 8,3) ve solunum yetmezliği (OR 7,8) riski yüksek (özet).
 * Puan kesimleri resplab/dose (UBC) uygulamasıyla karşılaştırıldı.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  { id: "mmrc", baslik: "Dispne — mMRC derecesi", secenekler: [{ label: "mMRC 0–1", pts: 0 }, { label: "mMRC 2", pts: 1 }, { label: "mMRC 3", pts: 2 }, { label: "mMRC 4", pts: 3 }] },
  { id: "fev1", baslik: "FEV₁ (% beklenen)", secenekler: [{ label: "≥ %50", pts: 0 }, { label: "%30–49", pts: 1 }, { label: "< %30", pts: 2 }] },
  { id: "sigara", baslik: "Sigara", secenekler: [{ label: "İçmiyor / bırakmış", pts: 0 }, { label: "Halen içiyor", pts: 1 }] },
  { id: "alevlenme", baslik: "Son 1 yıldaki alevlenme sayısı", secenekler: [{ label: "0–1", pts: 0 }, { label: "2–3", pts: 1 }, { label: "≥ 4", pts: 2 }] },
];

const BANTLAR: Bant[] = [
  { aralik: "0–3", etiket: "Düşük–orta risk", alt: "Hastane yatışı ve solunum yetmezliği riski görece düşük.", renk: "emerald" },
  { aralik: "≥ 4", etiket: "Yüksek risk", alt: "Hastane yatışı (OR 8,3) ve solunum yetmezliği (OR 7,8) riski belirgin yüksek; sonraki yılda alevlenme olasılığı artmış.", renk: "rose" },
];

export default function DoseIndeksiPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor >= 4 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="dose-indeksi"
      ikon="🫁"
      baslik="KOAH DOSE İndeksi"
      altBaslik="KOAH · Dispne + Obstrüksiyon + Sigara + Alevlenme · 0–8"
      paylasim={{ dose: skor }}
      not={
        <p>
          Birinci basamakta geliştirildi, Hollanda, Japonya ve Birleşik Krallık örneklemlerinde doğrulandı. Sağlık durumu (CCQ), hastane yatışı ve
          sonraki yıldaki alevlenmeyle ilişkilidir; mortalite skoru değildir. Jones RC ve ark., Am J Respir Crit Care Med 2009;180:1189–1195.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={8} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
