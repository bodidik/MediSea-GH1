"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Revize Cenevre skoru — pulmoner emboli klinik olasılığı (Le Gal ve ark., Ann Intern Med 2006). 0–22.
 * Wells skorundan farkı: öznel "PE en olası tanı" maddesi yok, tamamen nesnel maddeler.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "yas", baslik: "Yaş > 65", secenekler: eh(1) },
  { id: "onceVte", baslik: "Önceki DVT ya da PE", secenekler: eh(3) },
  { id: "cerrahi", baslik: "Son 1 ayda genel anestezi altında cerrahi ya da alt ekstremite kırığı", secenekler: eh(2) },
  { id: "kanser", baslik: "Aktif malignite", aciklama: "Solid ya da hematolojik; aktif ya da son 1 yılda kür kabul edilmiş.", secenekler: eh(2) },
  { id: "tekBacak", baslik: "Tek taraflı alt ekstremite ağrısı", secenekler: eh(3) },
  { id: "hemoptizi", baslik: "Hemoptizi", secenekler: eh(2) },
  {
    id: "nabiz", baslik: "Kalp hızı",
    secenekler: [{ label: "< 75/dk", pts: 0 }, { label: "75–94/dk", pts: 3 }, { label: "≥ 95/dk", pts: 5 }],
  },
  { id: "palpasyon", baslik: "Alt ekstremitede derin ven boyunca palpasyonla ağrı ve tek taraflı ödem", secenekler: eh(4) },
];

const BANTLAR: Bant[] = [
  { aralik: "0–3", etiket: "Düşük olasılık", alt: "PE prevalansı ~%8 — D-dimer negatifse (yaşa göre ayarlı eşik) PE dışlanabilir.", renk: "emerald" },
  { aralik: "4–10", etiket: "Orta olasılık", alt: "PE prevalansı ~%28 — yüksek duyarlıklı D-dimer; pozitifse BT pulmoner anjiyografi.", renk: "amber" },
  { aralik: "≥ 11", etiket: "Yüksek olasılık", alt: "PE prevalansı ~%74 — D-dimer beklenmeden doğrudan görüntüleme; kanama riski düşükse ampirik antikoagülan.", renk: "rose" },
];

export default function RevizeCenevrePage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 3 ? BANTLAR[0] : skor <= 10 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="revize-cenevre"
      ikon="🫁"
      baslik="Revize Cenevre Skoru"
      altBaslik="Pulmoner Emboli Klinik Olasılığı · 0–22"
      paylasim={{ cenevre: skor }}
      not={
        <p>
          Hemodinamik olarak stabil, PE şüphesi olan hastada kullanılır; şok ya da hipotansiyon varsa skor beklenmeden yatak başı ekokardiyografi/BT anjiyografi
          yapılır. İki düzeyli kullanımda ≤ 5 "PE olası değil", ≥ 6 "PE olası" kabul edilir. Le Gal G ve ark., Ann Intern Med 2006; ESC PE kılavuzu 2019.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={22}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
        ek={skor !== null ? <p className="text-[11px] font-bold text-slate-700">İki düzeyli: {skor <= 5 ? "PE olası değil (≤ 5)" : "PE olası (≥ 6)"}</p> : null}
      />
    </OlcekKabugu>
  );
}
