"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Burch-Wartofsky Puan Skalası (BWPS) — tiroid fırtınası olasılığı (Burch & Wartofsky, Endocrinol Metab Clin 1993).
 * Ateş aralıkları özgün tabloda °F; burada °C karşılıklarıyla yazıldı (37,2–37,7 = 99–99,9 °F …).
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  {
    id: "ates", baslik: "Vücut sıcaklığı",
    secenekler: [
      { label: "< 37,2 °C", pts: 0 }, { label: "37,2–37,7 °C", pts: 5 }, { label: "37,8–38,2 °C", pts: 10 },
      { label: "38,3–38,8 °C", pts: 15 }, { label: "38,9–39,3 °C", pts: 20 }, { label: "39,4–39,9 °C", pts: 25 }, { label: "≥ 40 °C", pts: 30 },
    ],
  },
  {
    id: "mss", baslik: "Santral sinir sistemi etkilenmesi",
    secenekler: [
      { label: "Yok", pts: 0 }, { label: "Hafif (ajitasyon)", pts: 10 },
      { label: "Orta (deliryum, psikoz, belirgin letarji)", pts: 20 }, { label: "Ağır (nöbet, koma)", pts: 30 },
    ],
  },
  {
    id: "gis", baslik: "Gastrointestinal-hepatik bozukluk",
    secenekler: [
      { label: "Yok", pts: 0 }, { label: "Orta (ishal, bulantı/kusma, karın ağrısı)", pts: 10 }, { label: "Ağır (açıklanamayan sarılık)", pts: 20 },
    ],
  },
  {
    id: "nabiz", baslik: "Kalp hızı (/dk)",
    secenekler: [
      { label: "< 90", pts: 0 }, { label: "90–109", pts: 5 }, { label: "110–119", pts: 10 }, { label: "120–129", pts: 15 },
      { label: "130–139", pts: 20 }, { label: "≥ 140", pts: 25 },
    ],
  },
  {
    id: "ky", baslik: "Kalp yetmezliği",
    secenekler: [
      { label: "Yok", pts: 0 }, { label: "Hafif (pedal ödem)", pts: 5 }, { label: "Orta (bibaziler raller)", pts: 10 }, { label: "Ağır (akciğer ödemi)", pts: 15 },
    ],
  },
  { id: "af", baslik: "Atriyal fibrilasyon", secenekler: [{ label: "Yok", pts: 0 }, { label: "Var", pts: 10 }] },
  {
    id: "tetik", baslik: "Tetikleyici olay öyküsü", aciklama: "Enfeksiyon, cerrahi, travma, iyot yükü, doğum, tedavinin kesilmesi vb.",
    secenekler: [{ label: "Yok", pts: 0 }, { label: "Var", pts: 10 }],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "< 25", etiket: "Fırtına olası değil", alt: "Tiroid fırtınası olası değil — tirotoksikozu tedavi edin, izlemi sürdürün.", renk: "emerald" },
  { aralik: "25–44", etiket: "Yaklaşan fırtına", alt: "Tiroid fırtınasını düşündürür — klinik karara göre fırtına gibi tedavi edin.", renk: "orange" },
  { aralik: "≥ 45", etiket: "Tiroid fırtınası", alt: "Tiroid fırtınası çok olası — yoğun bakım: beta bloker, tiyonamid, (1 saat sonra) iyot, glukokortikoid, tetikleyicinin tedavisi.", renk: "rose" },
];

export default function BurchWartofskyPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor < 25 ? BANTLAR[0] : skor < 45 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="burch-wartofsky"
      ikon="🔥"
      baslik="Burch-Wartofsky Skalası"
      altBaslik="Tiroid Fırtınası Olasılığı · 0–140"
      paylasim={{ bwps: skor }}
      not={
        <p>
          Skor tirotoksikozu olan hastada uygulanır; tiroid hormon düzeyleri fırtınayı tirotoksikozdan ayırmaz. Duyarlılığı yüksek, özgüllüğü düşüktür —
          25–44 arasında klinik yargı belirleyicidir. Japon Tiroid Derneği (JTA) kriterleri alternatif bir tanı sistemidir. Burch HB, Wartofsky L,
          Endocrinol Metab Clin North Am 1993.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={140} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
