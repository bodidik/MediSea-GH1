"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * ACR/EULAR 2016 primer Sjögren sendromu sınıflama kriterleri (Shiboski ve ark., Ann Rheum Dis 2017). ≥ 4 puan.
 * Giriş: göz ya da ağız kuruluğu yakınması (ya da ESSDAI'de en az bir alanda pozitif bulgu ile şüphe).
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır / yapılmadı", pts: 0 }, { label: "Evet", pts: p }];
const GIRIS: Secenek[] = [{ label: "Evet", pts: 0 }, { label: "Hayır", pts: 0 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "biyopsi", baslik: "Minör tükürük bezi biyopsisi: fokal lenfositik sialadenit, fokus skoru ≥ 1 odak/4 mm²", secenekler: eh(3) },
  { id: "ssa", baslik: "Anti-SSA/Ro pozitif", secenekler: eh(3) },
  { id: "boyama", baslik: "Oküler boyama skoru ≥ 5 (ya da van Bijsterveld ≥ 4), en az bir gözde", aciklama: "Son 24 saatte göz damlası kullanılmamış olmalı.", secenekler: eh(1) },
  { id: "schirmer", baslik: "Schirmer testi ≤ 5 mm/5 dk, en az bir gözde", secenekler: eh(1) },
  { id: "tukuruk", baslik: "Uyarılmamış tam tükürük akımı ≤ 0,1 mL/dk", secenekler: eh(1) },
];

const BANTLAR: Bant[] = [
  { aralik: "< 4", etiket: "Sınıflanmıyor", alt: "ACR/EULAR 2016 Sjögren sınıflama kriterleri karşılanmıyor.", renk: "slate" },
  { aralik: "≥ 4", etiket: "Primer Sjögren", alt: "ACR/EULAR 2016 Sjögren sınıflama kriterleri karşılanıyor.", renk: "rose" },
];

export default function Sjogren2016Page() {
  const [giris, setGiris] = React.useState<number | null>(null);
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const eksik = MADDELER.filter((m) => sel[m.id] === null).length;
  const skor = giris === 0 && eksik === 0 ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor >= 4 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="sjogren-2016"
      ikon="💧"
      baslik="ACR/EULAR 2016 Sjögren Kriterleri"
      altBaslik="Primer Sjögren Sendromu Sınıflaması · ≥ 4 Puan"
      paylasim={{ sjogren: skor }}
      not={
        <p>
          Dışlama: baş-boyun radyoterapisi, aktif hepatit C, AIDS, sarkoidoz, amiloidoz, GVHD ve IgG4 ilişkili hastalık. Antikolinerjik ilaçlar, test
          öncesinde yeterli süre kesilmeden objektif kuruluk testleri yanıltır. Shiboski CH ve ark., Ann Rheum Dis 2017.
        </p>
      }
    >
      <SecimMaddesi
        id="giris"
        baslik="Giriş — göz ya da ağız kuruluğu yakınması (≥ 3 ay) ya da ESSDAI ile Sjögren şüphesi"
        secenekler={GIRIS}
        secili={giris}
        onSec={setGiris}
        rozetGizle
      />
      {giris === 1 && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          Giriş kriteri karşılanmıyor — kriterler uygulanmaz; puan hesaplanmadı.
        </div>
      )}
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={9}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={giris === null ? "Önce giriş kriterini yanıtlayın" : giris === 1 ? "Giriş kriteri karşılanmıyor" : `${eksik} madde yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
