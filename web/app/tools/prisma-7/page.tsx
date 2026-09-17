"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * PRISMA-7 — Raîche ve ark., Arch Gerontol Geriatr 2008.
 *
 * DİKKAT: 6. soruda puan "HAYIR" yanıtına verilir (güvenebileceği biri YOKSA).
 * Öteki altısında "EVET"e. Şıklar bu yüzden madde başına yazıldı.
 */
const EVET_PUAN: Secenek[] = [
  { label: "Evet", pts: 1 },
  { label: "Hayır", pts: 0 },
];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  { id: "yas", baslik: "1. 85 yaşından büyük mü?", secenekler: EVET_PUAN },
  { id: "erkek", baslik: "2. Erkek mi?", secenekler: EVET_PUAN },
  { id: "kisit", baslik: "3. Genel olarak, etkinliklerini kısıtlamasını gerektiren sağlık sorunları var mı?", secenekler: EVET_PUAN },
  { id: "yardim", baslik: "4. Düzenli olarak birinin yardımına ihtiyaç duyuyor mu?", secenekler: EVET_PUAN },
  { id: "ev", baslik: "5. Genel olarak, evde kalmasını gerektiren sağlık sorunları var mı?", secenekler: EVET_PUAN },
  {
    id: "yakin",
    baslik: "6. İhtiyaç durumunda yakınındaki birine güvenebilir mi?",
    secenekler: [
      { label: "Evet", pts: 0 },
      { label: "Hayır", pts: 1 },
    ],
  },
  { id: "arac", baslik: "7. Hareket etmek için düzenli olarak baston, yürüteç ya da tekerlekli sandalye kullanıyor mu?", secenekler: EVET_PUAN },
];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Tarama negatif", alt: "Belirgin kırılganlık riski saptanmadı.", renk: "emerald" },
  { aralik: "≥ 3", etiket: "Kırılganlık riski", alt: "Tarama pozitif — kapsamlı geriatrik değerlendirme önerilir.", renk: "rose" },
];

export default function Prisma7Page() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor >= 3 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="prisma-7"
      ikon="📋"
      baslik="PRISMA-7"
      altBaslik="Toplum Temelli Kırılganlık Taraması · 7 Soru · 0–7"
      paylasim={Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]]))}
      not={
        <p>
          PRISMA-7 hasta tarafından doldurulabilen ya da telefonla uygulanabilen kısa bir tarama anketidir; eşik ≥ 3.
          Pozitif sonuç tanı değil, ileri değerlendirme gerekçesidir. Raîche M ve ark., Arch Gerontol Geriatr 2008.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi
            key={m.id}
            id={m.id}
            baslik={m.baslik}
            secenekler={m.secenekler}
            secili={sel[m.id]}
            onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))}
          />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={7}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} soru yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
