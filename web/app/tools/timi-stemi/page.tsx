"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * TIMI risk skoru — STEMI (Morrow ve ark., Circulation 2000). 0–14, 30 günlük mortalite.
 * Mortalite tablosu skor başına; bantlar yalnızca renklendirme için gruplanıyor, yüzde
 * her zaman tam skorun satırından okunuyor.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "yas", baslik: "Yaş", secenekler: [{ label: "< 65", pts: 0 }, { label: "65–74", pts: 2 }, { label: "≥ 75", pts: 3 }] },
  { id: "oyku", baslik: "Diyabet, hipertansiyon ya da angina öyküsü", secenekler: eh(1) },
  { id: "sks", baslik: "Sistolik kan basıncı < 100 mmHg", secenekler: eh(3) },
  { id: "nabiz", baslik: "Kalp hızı > 100/dk", secenekler: eh(2) },
  { id: "killip", baslik: "Killip sınıfı II–IV", secenekler: eh(2) },
  { id: "kilo", baslik: "Ağırlık < 67 kg", secenekler: eh(1) },
  { id: "anterior", baslik: "Anterior ST yükselmesi ya da sol dal bloğu", secenekler: eh(1) },
  { id: "sure", baslik: "Semptom başlangıcından tedaviye > 4 saat", secenekler: eh(1) },
];

/** 30 günlük mortalite (%) — Morrow 2000, skor 0..8 ve > 8. */
const MORTALITE = [0.8, 1.6, 2.2, 4.4, 7.3, 12.4, 16.1, 23.4, 26.8];
const USTU = 35.9;

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Düşük risk", alt: "Skora özgü 30 günlük mortalite aşağıda.", renk: "emerald" },
  { aralik: "3–4", etiket: "Orta risk", alt: "Skora özgü 30 günlük mortalite aşağıda.", renk: "amber" },
  { aralik: "5–6", etiket: "Yüksek risk", alt: "Skora özgü 30 günlük mortalite aşağıda.", renk: "orange" },
  { aralik: "≥ 7", etiket: "Çok yüksek risk", alt: "Skora özgü 30 günlük mortalite aşağıda.", renk: "rose" },
];

export default function TimiStemiPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const yuzde = skor === null ? null : skor > 8 ? USTU : MORTALITE[skor];
  const temel = skor === null ? null : skor <= 2 ? BANTLAR[0] : skor <= 4 ? BANTLAR[1] : skor <= 6 ? BANTLAR[2] : BANTLAR[3];
  const bant = temel && yuzde !== null ? { ...temel, alt: `30 günlük mortalite ~%${String(yuzde).replace(".", ",")}` } : null;

  return (
    <OlcekKabugu
      slug="timi-stemi"
      ikon="🫀"
      baslik="TIMI Risk Skoru (STEMI)"
      altBaslik="ST Yükselmeli MI · 30 Günlük Mortalite · 0–14"
      paylasim={{ timi: skor }}
      not={
        <>
          <p>Fibrinolitik çalışması (InTIME II) hastalarında geliştirilmiştir; primer PKG döneminde mutlak mortalite daha düşüktür, sıralama gücü korunur.</p>
          <p className="font-black text-slate-700">30 günlük mortalite (%) — skor: oran</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
            {[...MORTALITE, USTU].map((m, i) => {
              const aktifSatir = skor !== null && (i === 9 ? skor > 8 : skor === i);
              return (
                <li key={i} className={aktifSatir ? "font-black text-blue-900" : ""}>
                  {i === 9 ? "> 8" : i}: %{String(m).replace(".", ",")}{aktifSatir ? " (bu hasta)" : ""}
                </li>
              );
            })}
          </ul>
          <p>Morrow DA ve ark., Circulation 2000.</p>
        </>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={14} bantlar={BANTLAR} aktif={bant ? BANTLAR.find((b) => b.etiket === bant.etiket)! : null} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
        ek={bant ? <p className="text-[13px] font-black text-slate-800">{bant.alt}</p> : null} />
    </OlcekKabugu>
  );
}
