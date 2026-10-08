"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * KOAH alevlenmesi şiddeti — Roma önerisi (Celli BR ve ark., Am J Respir Crit Care Med 2021;204:1251–1258), GOLD 2023'ten beri.
 *   Orta: 5 ölçütten ≥ 3'ü — dispne VAS ≥ 5 · SS ≥ 24/dk · nabız ≥ 95/dk · istirahat SaO₂ < %92 (oda havası / olağan O₂)
 *         ve/veya bazale göre > %3 düşüş · CRP ≥ 10 mg/L
 *   Ağır: kan gazında hiperkapni (PaCO₂ > 45 mmHg) VE asidoz (pH < 7,35)
 *   Hafif: orta/ağır ölçütü karşılanmıyor
 * Ölçüt metni Jacobson PK ve ark., Int J COPD 2023;18:2055 (GOLD 2023 aktarımı) ile karşılaştırıldı.
 */
const VY: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 1 }];
const OLCUTLER: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  { id: "vas", baslik: "Dispne VAS ≥ 5 (0–10)", secenekler: VY },
  { id: "ss", baslik: "Solunum sayısı ≥ 24/dk", secenekler: VY },
  { id: "nabiz", baslik: "Nabız ≥ 95/dk", secenekler: VY },
  { id: "sat", baslik: "İstirahat SaO₂ < %92 (oda havası ya da olağan oksijeniyle) ve/veya bazale göre > %3 düşüş", secenekler: VY },
  { id: "crp", baslik: "CRP ≥ 10 mg/L", secenekler: [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 1 }, { label: "Ölçülmedi", pts: 0 }] },
];
const KG: Secenek[] = [
  { label: "Yapılmadı", pts: 0 },
  { label: "Hiperkapni + asidoz yok", pts: 0 },
  { label: "PaCO₂ > 45 mmHg VE pH < 7,35", pts: 0 },
];

const BANTLAR: Bant[] = [
  { aralik: "< 3 ölçüt", etiket: "Hafif", alt: "Orta alevlenme ölçütü karşılanmıyor — genellikle ayaktan izlem.", renk: "emerald" },
  { aralik: "≥ 3 ölçüt", etiket: "Orta", alt: "Beş ölçütten en az üçü var. Kan gazında hipoksemi (PaO₂ ≤ 60 mmHg) ve/veya hiperkapni (PaCO₂ > 45 mmHg) olabilir, asidoz yok.", renk: "amber" },
  { aralik: "PaCO₂ > 45 · pH < 7,35", etiket: "Ağır", alt: "Hiperkapnik solunumsal asidoz — ventilatuar destek (NIV) değerlendirmesi gerekir.", renk: "rose" },
];

export default function RomaAlevlenmePage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(OLCUTLER.map((m) => [m.id, null])));
  const [kg, setKg] = React.useState<number | null>(null);
  const yanitlanan = OLCUTLER.filter((m) => sel[m.id] !== null).length + (kg !== null ? 1 : 0);
  const tamam = yanitlanan === OLCUTLER.length + 1;
  const sayi = OLCUTLER.reduce((t, m) => t + (sel[m.id] === null ? 0 : m.secenekler[sel[m.id] as number].pts), 0);
  const bant = !tamam ? null : kg === 2 ? BANTLAR[2] : sayi >= 3 ? BANTLAR[1] : BANTLAR[0];
  const crpYok = sel.crp === 2;

  return (
    <OlcekKabugu
      slug="roma-alevlenme"
      ikon="🌡️"
      baslik="Roma Alevlenme Şiddeti"
      altBaslik="KOAH Alevlenmesi · Hafif / Orta / Ağır · GOLD 2023+"
      paylasim={{ olcut: tamam ? sayi : null, kg }}
      not={
        <p>
          Alevlenme tanısı (≤ 14 gün içinde dispne ve/veya öksürük-balgam artışı) konduktan sonra şiddeti sınıflar; pnömoni, pulmoner emboli ve kalp
          yetersizliği gibi eşlik eden ya da karıştırılan durumlar ayrıca araştırılmalıdır. CRP ölçülmediyse kalan dört ölçütten üçü gerekir. Celli BR ve
          ark., Am J Respir Crit Care Med 2021;204:1251–1258; GOLD 2026.
        </p>
      }
    >
      <div className="space-y-3">
        {OLCUTLER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} rozetGizle />
        ))}
        <SecimMaddesi id="kg" baslik="Arter kan gazı" secenekler={KG} secili={kg} onSec={setKg} rozetGizle />
      </div>
      <SkorPaneli
        skor={tamam ? sayi : null}
        payda={crpYok ? 4 : 5}
        skorBasligi="ÖLÇÜT"
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${OLCUTLER.length + 1 - yanitlanan} soru yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
