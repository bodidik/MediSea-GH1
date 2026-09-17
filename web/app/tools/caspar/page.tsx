"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * CASPAR — psoriatik artrit sınıflama kriterleri (Taylor ve ark., Arthritis Rheum 2006).
 * Ön koşul: inflamatuvar eklem hastalığı (periferik eklem, omurga ya da entez). ≥ 3 puan PsA.
 *
 * Psoriazis alanı TEK seçim: şu anda psoriazis 2 puan; yoksa kişisel öykü 1; o da yoksa birinci/ikinci
 * derece akrabada öykü 1. Üçü birden toplanmaz — onay kutusu olsaydı 4 puan verirdi.
 */
const PSORIAZIS: Secenek[] = [
  { label: "Yok (kişisel ya da aile öyküsü de yok)", pts: 0 },
  { label: "Şu anda psoriazis (romatolog ya da dermatolog tarafından)", pts: 2 },
  { label: "Şu anda yok, kişisel psoriazis öyküsü var", pts: 1 },
  { label: "Kendisinde hiç yok, 1. ya da 2. derece akrabada psoriazis", pts: 1 },
];
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];
const ONKOSUL: Secenek[] = [{ label: "Evet", pts: 0 }, { label: "Hayır", pts: 0 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "tirnak", baslik: "Psoriatik tırnak distrofisi", aciklama: "Onikoliz, pitting, hiperkeratoz.", secenekler: eh(1) },
  { id: "rf", baslik: "RF negatif", aciklama: "Lateks dışı yöntemle (ELISA ya da nefelometri).", secenekler: eh(1) },
  { id: "daktilit", baslik: "Daktilit", aciklama: "Şu anda (tüm parmakta şişlik) ya da romatologca kaydedilmiş öykü.", secenekler: eh(1) },
  { id: "kemik", baslik: "Jukstaartiküler yeni kemik oluşumu", aciklama: "El ya da ayak grafisinde eklem kenarında (osteofit dışı) iyi sınırlı kemikleşme.", secenekler: eh(1) },
];

const BANTLAR: Bant[] = [
  { aralik: "< 3", etiket: "Sınıflanmıyor", alt: "CASPAR kriterleri karşılanmıyor.", renk: "slate" },
  { aralik: "≥ 3", etiket: "Psoriatik artrit", alt: "CASPAR kriterleri karşılanıyor (özgüllük ~%99, duyarlılık ~%91).", renk: "rose" },
];

export default function CasparPage() {
  const [onkosul, setOnkosul] = React.useState<number | null>(null);
  const [pso, setPso] = React.useState<number | null>(null);
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const eksik = (pso === null ? 1 : 0) + MADDELER.filter((m) => sel[m.id] === null).length;
  const skor =
    onkosul === 0 && eksik === 0
      ? PSORIAZIS[pso!].pts + MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor >= 3 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="caspar"
      ikon="💅"
      baslik="CASPAR Kriterleri"
      altBaslik="Psoriatik Artrit Sınıflaması · ≥ 3 Puan"
      paylasim={{ caspar: skor }}
      not={
        <p>
          Sınıflama kriterleridir. Erken hastalıkta ve psoriazisi henüz ortaya çıkmamış hastada duyarlılık düşer. Taylor W ve ark., Arthritis Rheum 2006.
        </p>
      }
    >
      <SecimMaddesi
        id="onkosul"
        baslik="Ön koşul — inflamatuvar eklem hastalığı (periferik eklem, omurga ya da entez)"
        secenekler={ONKOSUL}
        secili={onkosul}
        onSec={setOnkosul}
        rozetGizle
      />
      {onkosul === 1 && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          Ön koşul karşılanmıyor — CASPAR uygulanmaz; puan hesaplanmadı.
        </div>
      )}
      <div className="space-y-3">
        <SecimMaddesi id="psoriazis" baslik="Psoriazis" aciklama="Yalnızca biri seçilir." secenekler={PSORIAZIS} secili={pso} onSec={setPso} />
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={6}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={onkosul === null ? "Önce ön koşulu yanıtlayın" : onkosul === 1 ? "Ön koşul karşılanmıyor" : `${eksik} madde yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
