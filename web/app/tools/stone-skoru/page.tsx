"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * STONE skoru — yan ağrısında komplike olmayan üreter taşı olasılığı (Moore ve ark., BMJ 2014). 0–13.
 * "Irk" maddesi özgün ABD kohortunun yapısını yansıtıyor; siyahi olmayan hasta 3 puan alır.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "cinsiyet", baslik: "S — Cinsiyet", secenekler: [{ label: "Kadın", pts: 0 }, { label: "Erkek", pts: 2 }] },
  {
    id: "sure", baslik: "T — Ağrının başlangıcından başvuruya süre",
    secenekler: [{ label: "> 24 saat", pts: 0 }, { label: "6–24 saat", pts: 1 }, { label: "< 6 saat", pts: 3 }],
  },
  { id: "irk", baslik: "O — Köken", aciklama: "Özgün kohortta siyahi olmayan hasta 3 puan alır.", secenekler: [{ label: "Siyahi", pts: 0 }, { label: "Siyahi değil", pts: 3 }] },
  {
    id: "bulanti", baslik: "N — Bulantı / kusma",
    secenekler: [{ label: "Yok", pts: 0 }, { label: "Yalnızca bulantı", pts: 1 }, { label: "Kusma", pts: 2 }],
  },
  { id: "hematuri", baslik: "E — İdrarda eritrosit (mikroskobik hematüri)", secenekler: [{ label: "Yok", pts: 0 }, { label: "Var", pts: 3 }] },
];

const BANTLAR: Bant[] = [
  { aralik: "0–5", etiket: "Düşük olasılık", alt: "Taş olasılığı ~%9 — alternatif tanıları (apandisit, divertikülit, AAA, pyelonefrit, over torsiyonu) araştırın.", renk: "amber" },
  { aralik: "6–9", etiket: "Orta olasılık", alt: "Taş olasılığı ~%51.", renk: "orange" },
  { aralik: "10–13", etiket: "Yüksek olasılık", alt: "Taş olasılığı ~%89 ve akut başka tanı olasılığı düşük — seçilmiş hastada BT yerine ultrason / düşük doz BT düşünülebilir.", renk: "rose" },
];

export default function StoneSkoruPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 5 ? BANTLAR[0] : skor <= 9 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="stone-skoru"
      ikon="🪨"
      baslik="STONE Skoru"
      altBaslik="Yan Ağrısında Üreter Taşı Olasılığı · 0–13"
      paylasim={{ stone: skor }}
      not={
        <p>
          Acil serviste yan ağrısıyla başvuran, travması ve bilinen başka bir nedeni olmayan erişkinlerde geliştirilmiştir. Skor taşı öngörür, BT
          gerekliliğini tek başına belirlemez: ateş, böbrek yetmezliği, tek böbrek, gebelik ya da enfeksiyon bulgusu ayrı değerlendirilir. Irk maddesi
          Türkiye popülasyonunda doğrulanmamıştır. Moore CL ve ark., BMJ 2014.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={13} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
