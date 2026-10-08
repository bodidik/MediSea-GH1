"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Norton Bası Yarası Risk Ölçeği — Norton, McLaren, Exton-Smith 1962. 5 madde,
 * her biri 1–4; toplam 5–20. Puan DÜŞTÜKÇE risk artar.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  { id: "fiziksel", baslik: "Genel fiziksel durum", secenekler: [{ label: "İyi", pts: 4 }, { label: "Orta", pts: 3 }, { label: "Kötü", pts: 2 }, { label: "Çok kötü", pts: 1 }] },
  { id: "mental", baslik: "Mental durum", secenekler: [{ label: "Uyanık", pts: 4 }, { label: "Apatik", pts: 3 }, { label: "Konfüze", pts: 2 }, { label: "Stupor", pts: 1 }] },
  { id: "aktivite", baslik: "Aktivite", secenekler: [{ label: "Bağımsız yürüyor", pts: 4 }, { label: "Yardımla yürüyor", pts: 3 }, { label: "Tekerlekli sandalyeye bağımlı", pts: 2 }, { label: "Yatağa bağımlı", pts: 1 }] },
  { id: "hareket", baslik: "Hareket (mobilite)", secenekler: [{ label: "Tam", pts: 4 }, { label: "Hafif kısıtlı", pts: 3 }, { label: "Çok kısıtlı", pts: 2 }, { label: "Hareketsiz", pts: 1 }] },
  { id: "inkontinans", baslik: "İnkontinans", secenekler: [{ label: "Yok", pts: 4 }, { label: "Ara sıra", pts: 3 }, { label: "Genellikle idrar", pts: 2 }, { label: "İdrar ve dışkı", pts: 1 }] },
];

const BANTLAR: Bant[] = [
  { aralik: "> 14", etiket: "Düşük risk", alt: "Bası yarası riski düşük — rutin cilt bakımı ve periyodik yeniden değerlendirme.", renk: "emerald" },
  { aralik: "13–14", etiket: "Orta risk", alt: "Bası yarası riski var — pozisyon değişimi, cilt bakımı ve beslenme desteğini planlayın.", renk: "amber" },
  { aralik: "≤ 12", etiket: "Yüksek risk", alt: "Bası yarası riski yüksek — basınç azaltan yüzey, sık pozisyon değişimi ve günlük cilt muayenesi.", renk: "rose" },
];

export default function NortonPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor > 14 ? BANTLAR[0] : skor >= 13 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="norton"
      ikon="🛏️"
      baslik="Norton Ölçeği"
      altBaslik="Bası Yarası Riski · 5 Madde · 5–20"
      paylasim={{ norton: skor }}
      not={
        <p>
          Puan düştükçe risk artar; ≤ 14 risk eşiği olarak kullanılır. Braden ölçeği duyusal algı, nem ve sürtünmeyi ayrıca değerlendirir.
          Norton D, McLaren R, Exton-Smith AN. An investigation of geriatric nursing problems in hospital. 1962.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={20} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
