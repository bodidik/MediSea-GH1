"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi, KILO_ALT, KILO_UST } from "@/app/tools/lib/calc-utils";

/**
 * OSTA (Osteoporosis Self-Assessment Tool for Asians) — Koh LK ve ark., Osteoporos Int 2001;12:699–705.
 *   OSTA = 0,2 × (kilo [kg] − yaş [yıl])
 *   > −1 düşük risk · −1 ile −4 orta risk · < −4 yüksek risk (özgün üç kategori; sınırlar −1 ve −4)
 * Asyalı postmenopozal kadınlardan türetildi; Türk toplumunda doğrulanmış eşik yok. Tarama aracıdır, tanı DXA ile.
 * Eşikle HAM (yuvarlanmamış) değer karşılaştırılıyor.
 */
const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
const v1 = (x: number) => x.toFixed(1).replace(".", ",").replace("-", "−");

export default function OstaPage() {
  const [kilo, setKilo] = React.useState("");
  const [yas, setYas] = React.useState("");
  const n = parseLocaleNumber;
  const kGir = sayiGirildiMi(kilo);
  const kOk = kGir && n(kilo) >= KILO_ALT && n(kilo) <= KILO_UST;
  const yGir = sayiGirildiMi(yas);
  const yOk = yGir && n(yas) >= 18 && n(yas) <= 110;
  const hatali = [kGir && !kOk && `kilo ${KILO_ALT}–${KILO_UST} kg olmalı`, yGir && !yOk && "yaş 18–110 olmalı"].filter(Boolean) as string[];

  const osta = kOk && yOk ? 0.2 * (n(kilo) - n(yas)) : null;
  const sinif =
    osta === null
      ? null
      : osta > -1
        ? { t: "Düşük risk", a: "Başka risk faktörü (frajilite kırığı, glukokortikoid vb.) yoksa DXA çoğunlukla gerekmez.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" }
        : osta >= -4
          ? { t: "Orta risk", a: "Klinik risk faktörleriyle birlikte DXA kararı verin.", r: "border-amber-200 bg-amber-50 text-amber-900" }
          : { t: "Yüksek risk", a: "DXA ile KMY ölçümü önerilir.", r: "border-rose-200 bg-rose-50 text-rose-900" };

  const eksik = [!kGir && "kilo", !yGir && "yaş"].filter(Boolean) as string[];

  return (
    <OlcekKabugu
      slug="osta"
      ikon="⚖️"
      baslik="OSTA"
      altBaslik="Osteoporoz Öz-Değerlendirme Aracı · Kilo ve Yaş · DXA Öncesi Tarama"
      paylasim={{ osta: osta === null ? null : Number(osta.toFixed(1)) }}
      not={
        <p>
          Yalnız kilo ve yaşla DXA gereğini sıralayan tarama aracıdır; tanı koymaz, tedavi kararı vermez. Asyalı postmenopozal kadınlardan türetildi
          (femur boynu T ≤ −2,5 için duyarlılık %91, özgüllük %45); başka toplumlarda eşikler ve başarım değişkendir, Türk toplumunda doğrulanmış
          eşik yoktur. TEMD, 65 yaş üstü kadına risk faktöründen bağımsız DXA önerir. Koh LK ve ark., Osteoporos Int 2001;12:699–705.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Kilo (kg)", kilo, setKilo],
          ["Yaş (yıl)", yas, setYas],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>

      {hatali.length > 0 && (
        <p role="alert" className="text-[12px] font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{hatali.join(" · ")}</p>
      )}

      <SonucDuyuru metin={osta !== null && sinif ? `OSTA ${v1(osta)} — ${sinif.t}` : null} />
      {osta !== null && sinif ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${sinif.r}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">OSTA = 0,2 × (kilo − yaş)</p>
          <p className="text-4xl font-black">{v1(osta)}</p>
          <p className="text-xl font-black">{sinif.t}</p>
          <p className="text-[12px] font-bold">{sinif.a}</p>
        </div>
      ) : (
        eksik.length > 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
          </div>
        )
      )}

      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
        {[["Düşük", "> −1"], ["Orta", "−1 ile −4"], ["Yüksek", "< −4"]].map(([a, b]) => (
          <div key={a} className="rounded-xl p-2 font-black bg-white border border-slate-200 text-slate-700">
            <p>{a}</p>
            <p className="font-bold">{b}</p>
          </div>
        ))}
      </div>
    </OlcekKabugu>
  );
}
