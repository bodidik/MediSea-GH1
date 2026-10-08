"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";

/**
 * Güncellenmiş ADO indeksi — Puhan MA ve ark., BMJ Open 2012;2:e002152 (Tablo 2 puanları, Tablo 3 riskleri).
 * Yaş + mMRC dispne + FEV1 % beklenen → 0–14 puan → 3 yıllık tüm nedenlere bağlı mortalite.
 * Özgün ADO (Lancet 2009, 0–10) kalibrasyonu zayıf bulunduğu için güncellenmiş sürüm kullanılıyor.
 */
const YAS: Secenek[] = [
  { label: "40–49", pts: 0 },
  { label: "50–59", pts: 2 },
  { label: "60–69", pts: 4 },
  { label: "70–79", pts: 5 },
  { label: "≥ 80", pts: 7 },
];
const MMRC: Secenek[] = [
  { label: "mMRC 0", pts: 0 },
  { label: "mMRC 1–2", pts: 1 },
  { label: "mMRC 3", pts: 2 },
  { label: "mMRC 4", pts: 3 },
];
const FEV1: Secenek[] = [
  { label: "≥ %81", pts: 0 },
  { label: "%65–80", pts: 1 },
  { label: "%51–64", pts: 2 },
  { label: "%36–50", pts: 3 },
  { label: "≤ %35", pts: 4 },
];

/** Puan → 3 yıllık mortalite % (95% GA) — Tablo 3. */
const RISK: ReadonlyArray<readonly [string, string]> = [
  ["0,7", "0,6–0,9"], ["1,0", "0,9–1,2"], ["1,6", "1,3–1,8"], ["2,3", "2,0–2,6"], ["3,4", "3,0–3,7"],
  ["4,9", "4,5–5,4"], ["7,2", "6,7–7,7"], ["10,3", "9,7–10,9"], ["14,5", "13,8–15,3"], ["20,1", "19,1–21,1"],
  ["27,2", "25,8–28,6"], ["35,7", "33,7–37,7"], ["45,1", "42,6–47,7"], ["55,0", "52,0–58,0"], ["64,5", "61,2–67,7"],
];

const MADDELER = [
  { id: "yas", baslik: "Yaş (yıl)", secenekler: YAS },
  { id: "mmrc", baslik: "Dispne — mMRC derecesi", secenekler: MMRC },
  { id: "fev1", baslik: "FEV₁ (% beklenen, bronkodilatör sonrası)", secenekler: FEV1 },
] as const;

export default function AdoPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>({ yas: null, mmrc: null, fev1: null });
  const eksik = MADDELER.filter((m) => sel[m.id] === null).map((m) => m.baslik.split(" ")[0]);
  const skor = eksik.length === 0 ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const risk = skor !== null ? RISK[skor] : null;

  return (
    <OlcekKabugu
      slug="ado"
      ikon="🫁"
      baslik="ADO İndeksi"
      altBaslik="KOAH · Yaş + Dispne + Obstrüksiyon · 3 Yıllık Mortalite"
      paylasim={{ ado: skor }}
      not={
        <p>
          Güncellenmiş ADO indeksi 10 Avrupa ve Amerika kohortunda (n = 13 914, GOLD I–IV) geliştirilip doğrulandı; risk değerleri bu kohortların
          ortalamasıdır, bireysel hastada kesin öngörü değildir. 40 yaş altında tanımlı değildir. Puhan MA ve ark., BMJ Open 2012;2:e002152; özgün
          indeks: Puhan MA ve ark., Lancet 2009;374:704–711.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>

      <SonucDuyuru metin={skor !== null && risk ? `ADO ${skor} puan — 3 yıllık mortalite %${risk[0]}` : null} />
      {skor !== null && risk ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50 text-blue-950 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest">ADO puanı (0–14)</p>
          <p className="text-4xl font-black">{skor}</p>
          <p className="text-lg font-black">3 yıllık tüm nedenlere bağlı mortalite: %{risk[0]}</p>
          <p className="text-[12px] font-bold">%95 güven aralığı: %{risk[1]}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
