"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * AD8 Demans Tarama Görüşmesi — Galvin ve ark., Neurology 2005. Bilgi veren
 * (yakın) ya da hasta yanıtlar; son yıllarda düşünme/bellek nedeniyle DEĞİŞİM
 * olan her madde 1 puan. 0–8, ≥ 2 bilişsel bozukluk olası.
 */
const ed = (): Secenek[] => [{ label: "Değişiklik yok / bilmiyorum", pts: 0 }, { label: "Evet, değişti", pts: 1 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  { id: "yargi", baslik: "Karar verme ve muhakemede sorun (ör. dolandırıcılığa açık olma, kötü mali kararlar, başkalarını düşünmeyen hediyeler)", secenekler: ed() },
  { id: "ilgi", baslik: "Hobilere ve etkinliklere ilginin azalması", secenekler: ed() },
  { id: "tekrar", baslik: "Aynı şeyleri tekrar tekrar sorma, anlatma ya da söyleme", secenekler: ed() },
  { id: "alet", baslik: "Bir aleti, cihazı ya da ev eşyasını kullanmayı öğrenmede güçlük (TV kumandası, mikrodalga…)", secenekler: ed() },
  { id: "tarih", baslik: "Doğru ayı ya da yılı unutma", secenekler: ed() },
  { id: "mali", baslik: "Karmaşık mali işlerle uğraşmada güçlük (çek defteri, fatura, vergi)", secenekler: ed() },
  { id: "randevu", baslik: "Randevuları hatırlamada güçlük", secenekler: ed() },
  { id: "bellek", baslik: "Düşünme ve/veya bellekte günlük sorunlar", secenekler: ed() },
];

const BANTLAR: Bant[] = [
  { aralik: "0–1", etiket: "Normal", alt: "Bilişsel bozukluk lehine bulgu yok.", renk: "emerald" },
  { aralik: "≥ 2", etiket: "Bilişsel bozukluk olası", alt: "Bilişsel bozukluk olasılığı yüksek — ayrıntılı nörobilişsel değerlendirme önerilir.", renk: "rose" },
];

export default function Ad8Page() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 1 ? BANTLAR[0] : BANTLAR[1];

  return (
    <OlcekKabugu
      slug="ad8"
      ikon="🧠"
      baslik="AD8"
      altBaslik="Demans Tarama Görüşmesi · Bilgi Veren · 0–8"
      paylasim={{ ad8: skor }}
      not={
        <p>
          Sorular son birkaç yılda düşünme ya da bellek sorunları nedeniyle oluşan DEĞİŞİMİ sorar; tarama testidir, tanı koymaz.
          Tercihen hastayı iyi tanıyan bir yakın yanıtlar. Galvin JE ve ark., Neurology 2005;65:559–564.
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
