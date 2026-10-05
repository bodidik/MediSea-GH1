"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * ABBEY AĞRI SKALASI — sözel iletişim kuramayan demanslı hastada ağrı
 * (Abbey ve ark., Int J Palliat Nurs 2004). 6 gözlem maddesi, her biri
 * 0 yok · 1 hafif · 2 orta · 3 şiddetli; toplam 0–18.
 */
const SIDDET: Secenek[] = [
  { label: "Yok", pts: 0 },
  { label: "Hafif", pts: 1 },
  { label: "Orta", pts: 2 },
  { label: "Şiddetli", pts: 3 },
];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama: string }> = [
  { id: "vokalizasyon", baslik: "1. Vokalizasyon", aciklama: "Sızlanma, inleme, ağlama." },
  { id: "yuz", baslik: "2. Yüz ifadesi", aciklama: "Gergin görünme, kaş çatma, yüz buruşturma, korkmuş görünme." },
  { id: "beden", baslik: "3. Beden dilinde değişiklik", aciklama: "Kıpırdanma, sallanma, vücudun bir bölümünü koruma, içe kapanma." },
  { id: "davranis", baslik: "4. Davranış değişikliği", aciklama: "Artmış konfüzyon, yemeyi reddetme, alışılmış davranışlarda değişiklik." },
  { id: "fizyolojik", baslik: "5. Fizyolojik değişiklik", aciklama: "Normal sınır dışında ateş, nabız ya da kan basıncı; terleme, kızarma ya da solukluk." },
  { id: "fiziksel", baslik: "6. Fiziksel değişiklik", aciklama: "Deri yırtıkları, bası alanları, artrit, kontraktürler, önceki yaralanmalar." },
];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Ağrı yok", alt: "Gözlem sırasında ağrı bulgusu yok; değişiklikte yeniden değerlendirin.", renk: "emerald" },
  { aralik: "3–7", etiket: "Hafif ağrı", alt: "Nedeni araştırın; konfor önlemleri ve analjezi düşünün.", renk: "amber" },
  { aralik: "8–13", etiket: "Orta ağrı", alt: "Analjezi gerekir; ~1 saat sonra yeniden puanlayın.", renk: "orange" },
  { aralik: "≥ 14", etiket: "Şiddetli ağrı", alt: "Hızlı analjezik müdahale ve sık yeniden değerlendirme.", renk: "rose" },
];

export default function AbbeyPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + SIDDET[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor <= 2 ? BANTLAR[0] : skor <= 7 ? BANTLAR[1] : skor <= 13 ? BANTLAR[2] : BANTLAR[3];

  return (
    <OlcekKabugu
      slug="abbey"
      ikon="🕊️"
      baslik="Abbey Ağrı Skalası"
      altBaslik="Sözel İletişim Kuramayan Demans Hastasında Ağrı · 0–18"
      paylasim={Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]]))}
      not={
        <p>
          Abbey skalası ağrı DAVRANIŞINI ve bulgularını puanlar; düşük puan ağrıyı dışlamaz. Hastayı hareket ya da bakım sırasında
          gözleyin; analjezik verildikten ~1 saat sonra yeniden puanlayın. Özgün skalada ağrının akut/kronik ya da kronik üzerine
          akut olduğu ayrıca işaretlenir. Abbey J ve ark., Int J Palliat Nurs 2004.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi
            key={m.id}
            id={m.id}
            baslik={m.baslik}
            aciklama={m.aciklama}
            secenekler={SIDDET}
            secili={sel[m.id]}
            onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))}
          />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={18}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
