"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * ROX indeksi — yüksek akımlı nazal oksijen (HFNC) altında entübasyon riski (Roca ve ark., Am J Respir Crit Care Med 2019).
 *   ROX = (SpO₂ / FiO₂) / solunum sayısı      (FiO₂ kesir olarak: %60 → 0,60)
 *   ≥ 4,88 (2., 6. ya da 12. saatte) → HFNC başarısı olası
 *   < 2,85 (2. sa) · < 3,47 (6. sa) · < 3,85 (12. sa) → HFNC başarısızlığı olası, entübasyonu geciktirme
 *   arada → gri bölge, 1–2 saat sonra yeniden ölç
 * Eşikle HAM değer karşılaştırılıyor; ekrandaki iki basamak yalnız gösterim.
 */
const ZAMAN: Secenek[] = [
  { label: "2. saat", pts: 0 },
  { label: "6. saat", pts: 0 },
  { label: "12. saat", pts: 0 },
];
const ALT = [2.85, 3.47, 3.85] as const;
const UST = 4.88;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
const v2 = (x: number) => x.toFixed(2).replace(".", ",");

export default function RoxIndeksiPage() {
  const [spo2, setSpo2] = React.useState("");
  const [fio2, setFio2] = React.useState("");
  const [rr, setRr] = React.useState("");
  const [zaman, setZaman] = React.useState<number | null>(null);

  const n = parseLocaleNumber;
  const spOk = sayiGirildiMi(spo2) && n(spo2) >= 50 && n(spo2) <= 100;
  const fiOk = sayiGirildiMi(fio2) && n(fio2) >= 21 && n(fio2) <= 100;
  const rrOk = sayiGirildiMi(rr) && n(rr) >= 4 && n(rr) <= 70;
  const eksik = [
    !spOk && "SpO₂ (%50–100)",
    !fiOk && "FiO₂ (%21–100)",
    !rrOk && "solunum sayısı (4–70/dk)",
    zaman === null && "HFNC süresi",
  ].filter(Boolean) as string[];

  const rox = eksik.length === 0 ? n(spo2) / (n(fio2) / 100) / n(rr) : null;
  const alt = zaman !== null ? ALT[zaman] : null;
  const durum = rox === null || alt === null ? null : rox >= UST ? "basari" : rox < alt ? "basarisiz" : "gri";
  const METIN = {
    basari: { t: "HFNC başarısı olası", a: `ROX ≥ ${v2(UST)} — entübasyon riski düşük; izleme devam.`, r: "border-emerald-200 bg-emerald-50 text-emerald-900" },
    gri: { t: "Gri bölge", a: "Kesin karar için yetersiz — 1–2 saat sonra yeniden hesaplayın, klinik gidişe göre karar verin.", r: "border-amber-200 bg-amber-50 text-amber-900" },
    basarisiz: { t: "HFNC başarısızlığı olası", a: `ROX < ${alt !== null ? v2(alt) : ""} — entübasyon riski yüksek; entübasyonu geciktirmeyin.`, r: "border-rose-200 bg-rose-50 text-rose-900" },
  } as const;

  return (
    <OlcekKabugu
      slug="rox-indeksi"
      ikon="🌬️"
      baslik="ROX İndeksi"
      altBaslik="Yüksek Akımlı Nazal Oksijende Entübasyon Riski"
      paylasim={{ rox: rox !== null ? Number(rox.toFixed(2)) : null, zaman }}
      not={
        <p>
          Pnömoniye bağlı akut hipoksemik solunum yetmezliğinde, HFNC altındaki hastalarda geliştirilmiştir. SpO₂ nabız oksimetresinden okunur; SpO₂ %98–100
          aralığında oksijen fazlası indeksi şişirir. Artan iş yükü (yardımcı solunum kası kullanımı, paradoks solunum) indeks iyi görünse de
          entübasyon nedenidir. Roca O ve ark., Am J Respir Crit Care Med 2019.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
        {([
          ["SpO₂ (%)", spo2, setSpo2],
          ["FiO₂ (%)", fio2, setFio2],
          ["Solunum sayısı (/dk)", rr, setRr],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      <SecimMaddesi id="zaman" baslik="HFNC başlangıcından sonra geçen süre" secenekler={ZAMAN} secili={zaman} onSec={setZaman} rozetGizle />

      <SonucDuyuru metin={rox !== null && durum ? `ROX ${v2(rox)} — ${METIN[durum].t}` : null} />
      {rox !== null && durum ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${METIN[durum].r}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">ROX indeksi</p>
          <p className="text-4xl font-black">{v2(rox)}</p>
          <p className="text-lg font-black">{METIN[durum].t}</p>
          <p className="text-[12px] font-bold">{METIN[durum].a}</p>
          <p className="text-[11px] font-bold">({n(spo2)} / {v2(n(fio2) / 100)}) / {n(rr)}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
