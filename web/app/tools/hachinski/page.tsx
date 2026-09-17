"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Hachinski İskemik Skoru — Hachinski ve ark., Arch Neurol 1975. 13 madde, 0–18.
 * Maddelerin ağırlığı farklı (1 ya da 2); şıkların rozetinde görünüyor.
 */
const yok = (p: number): Secenek[] => [{ label: "Yok", pts: 0 }, { label: "Var", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  { id: "ani", baslik: "Ani başlangıç", secenekler: yok(2) },
  { id: "basamak", baslik: "Basamaklı kötüleşme", secenekler: yok(1) },
  { id: "dalgali", baslik: "Dalgalı seyir", secenekler: yok(2) },
  { id: "gece", baslik: "Gece konfüzyonu", secenekler: yok(1) },
  { id: "kisilik", baslik: "Kişiliğin görece korunması", secenekler: yok(1) },
  { id: "depresyon", baslik: "Depresyon", secenekler: yok(1) },
  { id: "somatik", baslik: "Somatik yakınmalar", secenekler: yok(1) },
  { id: "duygusal", baslik: "Duygusal inkontinans", secenekler: yok(1) },
  { id: "ht", baslik: "Hipertansiyon öyküsü", secenekler: yok(1) },
  { id: "inme", baslik: "İnme öyküsü", secenekler: yok(2) },
  { id: "ateroskleroz", baslik: "Eşlik eden ateroskleroz bulgusu", secenekler: yok(1) },
  { id: "fokalBelirti", baslik: "Fokal nörolojik belirtiler", secenekler: yok(2) },
  { id: "fokalBulgu", baslik: "Fokal nörolojik bulgular", secenekler: yok(2) },
];

const BANTLAR: Bant[] = [
  { aralik: "0–4", etiket: "Primer dejeneratif", alt: "Alzheimer tipi (dejeneratif) demans lehine.", renk: "emerald" },
  { aralik: "5–6", etiket: "Belirsiz / mikst", alt: "Ayrım yapılamıyor — mikst demans olası; görüntüleme belirleyici.", renk: "amber" },
  { aralik: "≥ 7", etiket: "Vasküler", alt: "Vasküler (multi-infarkt) demans lehine.", renk: "rose" },
];

export default function HachinskiPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 4 ? BANTLAR[0] : skor <= 6 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="hachinski"
      ikon="🧩"
      baslik="Hachinski İskemik Skoru"
      altBaslik="Vasküler ve Dejeneratif Demans Ayrımı · 13 Madde · 0–18"
      paylasim={{ hachinski: skor }}
      not={
        <p>
          Görüntüleme öncesi döneme ait klinik bir ayırıcıdır; mikst demansı ayırmada zayıftır ve beyin MR'ının yerini tutmaz. Demans tanısı konmuş
          hastada etiyoloji ipucu olarak kullanılır. Hachinski VC ve ark., Arch Neurol 1975.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={18} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
