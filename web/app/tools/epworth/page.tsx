"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Epworth Uykululuk Ölçeği (Johns, Sleep 1991). 8 durum × 0–3, toplam 0–24.
 *   0–5 düşük-normal · 6–10 yüksek-normal · 11–12 hafif · 13–15 orta · 16–24 ağır aşırı gündüz uykululuğu
 * Madde metinleri özgün ölçeğin birebir çevirisi değil, anlamı korunarak kısaltıldı.
 */
const SEC: Secenek[] = [
  { label: "Hiç uyuklamam", pts: 0 },
  { label: "Hafif olasılık", pts: 1 },
  { label: "Orta olasılık", pts: 2 },
  { label: "Yüksek olasılık", pts: 3 },
];

const DURUMLAR: ReadonlyArray<{ id: string; baslik: string }> = [
  { id: "okuma", baslik: "Oturup bir şey okurken" },
  { id: "tv", baslik: "Televizyon izlerken" },
  { id: "halka", baslik: "Toplu bir yerde hareketsiz otururken (toplantı, sinema)" },
  { id: "yolcu", baslik: "Ara vermeden bir saat arabada yolcu olarak giderken" },
  { id: "uzanma", baslik: "Koşullar uygunsa öğleden sonra dinlenmek için uzandığında" },
  { id: "konusma", baslik: "Oturup biriyle konuşurken" },
  { id: "yemek", baslik: "Alkolsüz bir öğle yemeğinden sonra sessizce otururken" },
  { id: "trafik", baslik: "Araba kullanırken trafikte birkaç dakika durduğunda" },
];

const BANTLAR: Bant[] = [
  { aralik: "0–5", etiket: "Düşük-normal", alt: "Gündüz uykululuğu olağan düzeyin altında.", renk: "emerald" },
  { aralik: "6–10", etiket: "Yüksek-normal", alt: "Olağan gündüz uykululuğu.", renk: "emerald" },
  { aralik: "11–12", etiket: "Hafif aşırı uykululuk", alt: "Aşırı gündüz uykululuğu — uyku süresi, ilaç ve uyku bozukluğu açısından değerlendirme.", renk: "amber" },
  { aralik: "13–15", etiket: "Orta aşırı uykululuk", alt: "OUA, narkolepsi, yetersiz uyku ya da ilaç etkisi araştırılmalı.", renk: "orange" },
  { aralik: "16–24", etiket: "Ağır aşırı uykululuk", alt: "Belirgin uykululuk — sürüş güvenliği konuşulmalı, uyku testi.", renk: "rose" },
];

export default function EpworthPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(DURUMLAR.map((d) => [d.id, null])));
  const yanitlanan = DURUMLAR.filter((d) => sel[d.id] !== null).length;
  const skor = yanitlanan === DURUMLAR.length ? DURUMLAR.reduce((t, d) => t + SEC[sel[d.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 5 ? BANTLAR[0] : skor <= 10 ? BANTLAR[1] : skor <= 12 ? BANTLAR[2] : skor <= 15 ? BANTLAR[3] : BANTLAR[4];

  return (
    <OlcekKabugu
      slug="epworth"
      ikon="🛌"
      baslik="Epworth Uykululuk Ölçeği"
      altBaslik="Aşırı Gündüz Uykululuğu · 8 Durum · 0–24"
      paylasim={{ ess: skor }}
      not={
        <p>
          Son dönemdeki olağan yaşamı düşünerek, her durumda uyuklama ya da uyuyakalma OLASILIĞI puanlanır (yalnızca yorgunluk değil). Durum yakın
          zamanda yaşanmadıysa hastanın nasıl etkileneceğini tahmin etmesi istenir. Skor OUA ağırlığıyla zayıf ilişkilidir; normal skor OUA'yı dışlamaz.
          Johns MW, Sleep 1991.
        </p>
      }
    >
      <div className="space-y-3">
        {DURUMLAR.map((d) => (
          <SecimMaddesi key={d.id} id={d.id} baslik={d.baslik} secenekler={SEC} secili={sel[d.id]} onSec={(s) => setSel((o) => ({ ...o, [d.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={24} bantlar={BANTLAR} aktif={bant} eksikMetni={`${DURUMLAR.length - yanitlanan} durum yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
