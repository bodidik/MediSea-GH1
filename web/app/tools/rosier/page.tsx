"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * ROSIER — Recognition of Stroke in the Emergency Room (Nor ve ark., Lancet Neurol 2005).
 * −2 ile +5 arası. Hipoglisemi önce dışlanmalı (kan glukozu < 63 mg/dL / 3,5 mmol/L).
 */
const EKSI: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: -1 }];
const ARTI: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 1 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  { id: "bilinc", baslik: "Bilinç kaybı ya da senkop oldu mu?", secenekler: EKSI },
  { id: "nobet", baslik: "Nöbet aktivitesi oldu mu?", secenekler: EKSI },
  { id: "yuz", baslik: "Yeni akut başlangıçlı (ya da uyanırken fark edilen) asimetrik yüz güçsüzlüğü", secenekler: ARTI },
  { id: "kol", baslik: "Asimetrik kol güçsüzlüğü", secenekler: ARTI },
  { id: "bacak", baslik: "Asimetrik bacak güçsüzlüğü", secenekler: ARTI },
  { id: "konusma", baslik: "Konuşma bozukluğu", secenekler: ARTI },
  { id: "gorme", baslik: "Görme alanı defekti", secenekler: ARTI },
];

const BANTLAR: Bant[] = [
  { aralik: "−2 – 0", etiket: "İnme olasılığı düşük", alt: "İnme olası değil ama tamamen dışlanmadı — taklitçileri (hipoglisemi, nöbet, senkop, migren) araştırın.", renk: "amber" },
  { aralik: "+1 – +5", etiket: "İnme olası", alt: "Akut inme yolunu başlatın: son iyi görülme zamanı, acil beyin görüntüleme.", renk: "rose" },
];

export default function RosierPage() {
  const [glukoz, setGlukoz] = React.useState<number | null>(null);
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const hipoglisemi = glukoz === 1;
  const skor =
    !hipoglisemi && glukoz !== null && yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor > 0 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="rosier"
      ikon="🚨"
      baslik="ROSIER"
      altBaslik="Acil Serviste İnmeyi Tanıma · −2 ile +5"
      paylasim={{ ...Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]])) }}
      not={
        <p>
          ROSIER acil serviste inme ile taklitçilerini ayırmak için geliştirilmiştir; tanı görüntülemeyle konur. Posterior dolaşım inmelerinde
          (baş dönmesi, ataksi) duyarlılığı düşüktür. Nor AM ve ark., Lancet Neurol 2005.
        </p>
      }
    >
      <SecimMaddesi
        id="glukoz"
        baslik="Önce: kapiller kan glukozu"
        aciklama="Glukoz < 63 mg/dL (3,5 mmol/L) ise önce hipoglisemiyi düzeltip yeniden değerlendirin."
        secenekler={[{ label: "≥ 63 mg/dL", pts: 0 }, { label: "< 63 mg/dL", pts: 0 }]}
        secili={glukoz}
        onSec={setGlukoz}
        rozetGizle
      />
      {hipoglisemi && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          Hipoglisemi — skor hesaplanmadı. Glukozu düzeltip nörolojik muayeneyi yineleyin.
        </div>
      )}
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
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={hipoglisemi ? "Hipoglisemi düzeltilmeli" : glukoz === null ? "Önce glukoz sorusunu yanıtlayın" : `${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
