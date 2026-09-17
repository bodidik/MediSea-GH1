"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * ISAR — Identification of Seniors At Risk (McCusker ve ark., JAGS 1999).
 * Acil serviste ≥ 65 yaş; 6 soru, hasta ya da yakını yanıtlar.
 *
 * DİKKAT: 4. soruda puan "HAYIR" yanıtına verilir; öteki beşinde "EVET"e.
 * Şıklar bu yüzden her maddede ayrı yazıldı, ortak bir evet/hayır dizisi yok.
 */
const EVET_PUAN: Secenek[] = [
  { label: "Evet", pts: 1 },
  { label: "Hayır", pts: 0 },
];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  { id: "onceYardim", baslik: "1. Acile gelmesine yol açan hastalık/yaralanmadan ÖNCE, düzenli olarak birinin yardımına ihtiyaç duyuyor muydu?", secenekler: EVET_PUAN },
  { id: "sonraYardim", baslik: "2. Bu hastalık/yaralanmadan SONRA, kendi bakımı için her zamankinden fazla yardıma ihtiyaç duydu mu?", secenekler: EVET_PUAN },
  { id: "yatis", baslik: "3. Son 6 ayda bir ya da daha fazla gece hastanede yattı mı? (acil serviste kalış hariç)", secenekler: EVET_PUAN },
  {
    id: "gorme",
    baslik: "4. Genel olarak iyi görebiliyor mu?",
    secenekler: [
      { label: "Evet", pts: 0 },
      { label: "Hayır", pts: 1 },
    ],
  },
  { id: "bellek", baslik: "5. Genel olarak belleğiyle ilgili ciddi sorunları var mı?", secenekler: EVET_PUAN },
  { id: "ilac", baslik: "6. Her gün 3'ten fazla farklı ilaç kullanıyor mu?", secenekler: EVET_PUAN },
];

const BANTLAR: Bant[] = [
  { aralik: "0–1", etiket: "Düşük risk", alt: "Olumsuz sonuç (fonksiyon kaybı, yeniden başvuru, kurumsal bakım, ölüm) riski düşük.", renk: "emerald" },
  { aralik: "≥ 2", etiket: "Yüksek risk", alt: "Olumsuz sonuç riski yüksek — geriatrik değerlendirme ve taburculuk planlaması önerilir.", renk: "rose" },
];

export default function IsarPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor >= 2 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="isar"
      ikon="🚑"
      baslik="ISAR"
      altBaslik="Acil Serviste Risk Altındaki Yaşlı · ≥ 65 yaş · 0–6"
      paylasim={Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]]))}
      not={
        <p>
          Özgün çalışmada eşik ≥ 2 (6 ay içinde ölüm, kurumsal bakıma yerleşme ya da fonksiyonel kayıp); bazı merkezler özgüllüğü artırmak için ≥ 3 kullanır.
          Ayırt ediciliği orta düzeydedir — tek başına taburculuk kararı vermez. McCusker J ve ark., J Am Geriatr Soc 1999.
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
        payda={6}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} soru yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
