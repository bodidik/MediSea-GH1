"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * STAR (Staging of Airflow obstruction by Ratio) — Bhatt SP ve ark., Am J Respir Crit Care Med 2023;208:676–684.
 * Bronkodilatör sonrası FEV₁/FVC:  STAR 1 0,60–<0,70 · STAR 2 0,50–<0,60 · STAR 3 0,40–<0,50 · STAR 4 < 0,40
 * Eşikler Garcia-Pachon E ve ark., J Clin Med 2025;14:7766 aktarımıyla karşılaştırıldı.
 * Girdi oran (0,62) ya da yüzde (62) olabilir; 1'in üstü yüzde sayılır. Eşikle HAM değer karşılaştırılıyor.
 */
const EVRE: ReadonlyArray<{ ad: string; aralik: string; r: string }> = [
  { ad: "STAR 1", aralik: "0,60 – < 0,70", r: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  { ad: "STAR 2", aralik: "0,50 – < 0,60", r: "border-amber-200 bg-amber-50 text-amber-900" },
  { ad: "STAR 3", aralik: "0,40 – < 0,50", r: "border-orange-200 bg-orange-50 text-orange-900" },
  { ad: "STAR 4", aralik: "< 0,40", r: "border-rose-200 bg-rose-50 text-rose-900" },
];
const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
const v2 = (x: number) => x.toFixed(2).replace(".", ",");

export default function StarEvrelemePage() {
  const [oran, setOran] = React.useState("");
  const ham = parseLocaleNumber(oran);
  const girildi = sayiGirildiMi(oran);
  const r = !girildi ? null : ham > 1 ? ham / 100 : ham;
  const gecerli = r !== null && r >= 0.15 && r <= 1;
  const evre = !gecerli || r === null ? null : r >= 0.7 ? -1 : r >= 0.6 ? 0 : r >= 0.5 ? 1 : r >= 0.4 ? 2 : 3;

  return (
    <OlcekKabugu
      slug="star-evreleme"
      ikon="📉"
      baslik="STAR Evrelemesi"
      altBaslik="KOAH · FEV₁/FVC Oranına Göre Obstrüksiyon Şiddeti · 1–4"
      paylasim={{ oran: gecerli && r !== null ? Number(r.toFixed(2)) : null }}
      not={
        <p>
          STAR, şiddeti beklenen FEV₁ yüzdesi yerine bronkodilatör sonrası FEV₁/FVC oranıyla derecelendirir; referans denklemlerine ve
          ırk/etnik kökene daha az duyarlıdır. COPDGene'de mortaliteyi GOLD evrelemesine benzer ayırt etti. Tanı (FEV₁/FVC &lt; 0,70) ve
          tedavi grubu (GOLD ABE) yerine geçmez. Bhatt SP ve ark., Am J Respir Crit Care Med 2023;208:676–684.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
        <label className="flex flex-col gap-2 min-w-0">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Bronkodilatör sonrası FEV₁/FVC (0,62 ya da %62)</span>
          <input type="text" inputMode="decimal" value={oran} onChange={(e) => setOran(e.target.value)} className={girdi} />
        </label>
      </div>

      {girildi && !gecerli && (
        <p role="alert" className="text-[12px] font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          FEV₁/FVC 0,15–1,00 (ya da %15–100) aralığında olmalı.
        </p>
      )}

      <SonucDuyuru metin={evre === null || r === null ? null : evre < 0 ? `FEV₁/FVC ${v2(r)} — obstrüksiyon yok, STAR uygulanmaz` : `${EVRE[evre].ad} — FEV₁/FVC ${v2(r)}`} />
      {evre !== null && r !== null ? (
        evre < 0 ? (
          <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white text-slate-800 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest">FEV₁/FVC {v2(r)}</p>
            <p className="text-2xl font-black">Obstrüksiyon yok (≥ 0,70)</p>
            <p className="text-[12px] font-bold">Sabit oranla KOAH tanısı konmaz; STAR evrelemesi uygulanmaz. Semptom varsa PRISm ve pre-KOAH açısından değerlendirin.</p>
          </div>
        ) : (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${EVRE[evre].r}`}>
            <p className="text-[10px] font-black uppercase tracking-widest">FEV₁/FVC {v2(r)}</p>
            <p className="text-4xl font-black">{EVRE[evre].ad}</p>
            <p className="text-[12px] font-bold">Aralık: {EVRE[evre].aralik}</p>
          </div>
        )
      ) : (
        !girildi && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: FEV₁/FVC</p>
          </div>
        )
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
        {EVRE.map((e, i) => (
          <div key={e.ad} className={`rounded-xl p-2 font-black ${evre === i ? "bg-blue-900 text-white" : "bg-white border border-slate-200 text-slate-700"}`}>
            <p>{e.ad}</p>
            <p className="font-bold">{e.aralik}</p>
          </div>
        ))}
      </div>
    </OlcekKabugu>
  );
}
