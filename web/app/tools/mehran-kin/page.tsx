"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Mehran skoru — perkütan koroner girişim sonrası kontrast nefropatisi riski (Mehran ve ark., JACC 2004).
 * Kontrast hacmi her 100 mL için 1 puan (100 mL'nin katları; 150 mL → 1, 200 mL → 2).
 * Böbrek işlevi eGFR kategorisiyle girilir (özgün skorun alternatifi kreatinin > 1,5 mg/dL = 4 puandır).
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "hipotansiyon", baslik: "Hipotansiyon", aciklama: "SKB < 80 mmHg en az 1 saat, inotrop gereksinimi ya da işlem sırasında/24 saat içinde İABP.", secenekler: eh(5) },
  { id: "iabp", baslik: "İntraaortik balon pompası (İABP)", secenekler: eh(5) },
  { id: "ky", baslik: "Konjestif kalp yetmezliği", aciklama: "NYHA III–IV ya da akciğer ödemi öyküsü.", secenekler: eh(5) },
  { id: "yas", baslik: "Yaş > 75", secenekler: eh(4) },
  { id: "anemi", baslik: "Anemi", aciklama: "Hematokrit erkekte < %39, kadında < %36.", secenekler: eh(3) },
  { id: "dm", baslik: "Diyabet", secenekler: eh(3) },
  {
    id: "egfr", baslik: "eGFR (mL/dk/1,73 m²)",
    secenekler: [{ label: "≥ 60", pts: 0 }, { label: "40–59", pts: 2 }, { label: "20–39", pts: 4 }, { label: "< 20", pts: 6 }],
  },
];

const HACIM_UST = 2000;

/** Kontrast nefropatisi / diyaliz riski — Mehran 2004 doğrulama kohortu. */
const BANTLAR: Bant[] = [
  { aralik: "≤ 5", etiket: "Düşük", alt: "Kontrast nefropatisi ~%7,5 · diyaliz ~%0,04.", renk: "emerald" },
  { aralik: "6–10", etiket: "Orta", alt: "Kontrast nefropatisi ~%14 · diyaliz ~%0,12.", renk: "amber" },
  { aralik: "11–15", etiket: "Yüksek", alt: "Kontrast nefropatisi ~%26,1 · diyaliz ~%1,09.", renk: "orange" },
  { aralik: "≥ 16", etiket: "Çok yüksek", alt: "Kontrast nefropatisi ~%57,3 · diyaliz ~%12,6.", renk: "rose" },
];

export default function MehranKinPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const [hacim, setHacim] = React.useState("");

  const hacimN = parseLocaleNumber(hacim);
  // Meşru sıfır: kontrast verilmemiş planlama senaryosu.
  const hacimOk = sayiGirildiMi(hacim) && hacimN >= 0 && hacimN <= HACIM_UST;
  const hacimPuan = hacimOk ? Math.floor(hacimN / 100) : null;
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;

  const skor =
    yanitlanan === MADDELER.length && hacimPuan !== null
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) + hacimPuan
      : null;
  const bant = skor === null ? null : skor <= 5 ? BANTLAR[0] : skor <= 10 ? BANTLAR[1] : skor <= 15 ? BANTLAR[2] : BANTLAR[3];

  const eksik = [
    yanitlanan < MADDELER.length && `${MADDELER.length - yanitlanan} madde`,
    !hacimOk && `kontrast hacmi (0–${HACIM_UST} mL)`,
  ].filter(Boolean) as string[];

  return (
    <OlcekKabugu
      slug="mehran-kin"
      ikon="💉"
      baslik="Mehran Kontrast Nefropatisi Skoru"
      altBaslik="Koroner Girişim Sonrası Kontrast İlişkili AKI Riski"
      paylasim={{ mehran: skor }}
      not={
        <p>
          Koroner girişim yapılan hastalarda geliştirilmiştir; intravenöz kontrastlı BT'de risk belirgin olarak daha düşüktür ve skor bu duruma
          genellenmemelidir. Kontrast nefropatisi tanımı: 48 saatte kreatininde ≥ %25 ya da ≥ 0,5 mg/dL artış. Önleme: izotonik sıvı, en düşük kontrast
          hacmi, nefrotoksik ilaçlara ara. Mehran R ve ark., J Am Coll Cardiol 2004.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-black text-blue-900">Kontrast hacmi (mL)</span>
            <span className="text-[11px] text-slate-600">Her 100 mL için 1 puan.</span>
            <input
              type="text"
              inputMode="numeric"
              value={hacim}
              onChange={(e) => setHacim(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg sm:max-w-[12rem]"
            />
          </label>
          {hacimPuan !== null && <p className="text-[11px] font-bold text-slate-700 mt-2">Kontrast puanı: {hacimPuan}</p>}
        </div>
      </div>
      <SkorPaneli skor={skor} bantlar={BANTLAR} aktif={bant} eksikMetni={`Eksik: ${eksik.join(" · ")}`} />
    </OlcekKabugu>
  );
}
