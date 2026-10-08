"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Uçuşta beklenen PaO₂ — Dillard TA ve ark., Ann Intern Med 1989;111:362–367 (özetteki denklem):
 *   PaO₂(irtifa) = 0,453 × PaO₂(deniz seviyesi) + 0,386 × FEV₁ (% beklenen) + 2,440
 * Ağır KOAH'lı 18 hastada, 2438 m (8000 ft) eşdeğeri hipobarik kabinde geliştirildi.
 * Eşik: uçuşta PaO₂ < 50 mmHg → uçuş içi oksijen adayı. Eşikle HAM değer karşılaştırılıyor.
 */
const ESIK = 50;
const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
const v1 = (x: number) => x.toFixed(1).replace(".", ",");

export default function UcusPao2Page() {
  const [pao2, setPao2] = React.useState("");
  const [fev1, setFev1] = React.useState("");
  const n = parseLocaleNumber;
  const pOk = sayiGirildiMi(pao2) && n(pao2) >= 30 && n(pao2) <= 150;
  const fOk = sayiGirildiMi(fev1) && n(fev1) >= 5 && n(fev1) <= 150;
  const eksik = [!pOk && "deniz seviyesi PaO₂ (30–150 mmHg)", !fOk && "FEV₁ (%5–150 beklenen)"].filter(Boolean) as string[];
  const tahmin = eksik.length === 0 ? 0.453 * n(pao2) + 0.386 * n(fev1) + 2.44 : null;
  const dusuk = tahmin !== null && tahmin < ESIK;

  return (
    <OlcekKabugu
      slug="ucus-pao2"
      ikon="✈️"
      baslik="Uçuşta PaO₂ Tahmini"
      altBaslik="KOAH · Dillard Denklemi · 2438 m (8000 ft) Kabin"
      paylasim={{ pao2: tahmin !== null ? Number(tahmin.toFixed(1)) : null }}
      not={
        <p>
          Denklem ağır KOAH'lı (ortalama FEV₁ %31) 18 hastada geliştirildi; hafif hastalıkta, efor sırasında ve uzun uçuşlarda öngörü gücü sınırlıdır.
          Belirsiz durumda hipoksi simülasyon testi (HAST) tercih edilir. Deniz seviyesinde SpO₂ ≤ %88 / PaO₂ &lt; 55 mmHg olan ya da uzun süreli oksijen
          tedavisi alan hastada hesaplamaya gerek kalmadan uçuş oksijeni planlanır. Dillard TA ve ark., Ann Intern Med 1989;111:362–367.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Deniz seviyesi PaO₂ (mmHg)", pao2, setPao2],
          ["FEV₁ (% beklenen)", fev1, setFev1],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>

      <SonucDuyuru metin={tahmin !== null ? `Uçuşta beklenen PaO₂ ${v1(tahmin)} mmHg — ${dusuk ? "uçuş içi oksijen adayı" : "50 mmHg eşiğinin üstünde"}` : null} />
      {tahmin !== null ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${dusuk ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">Uçuşta beklenen PaO₂</p>
          <p className="text-4xl font-black">{v1(tahmin)} mmHg</p>
          <p className="text-lg font-black">{dusuk ? "Uçuş içi oksijen adayı (< 50 mmHg)" : "50 mmHg eşiğinin üstünde"}</p>
          <p className="text-[11px] font-bold">0,453 × {n(pao2)} + 0,386 × {n(fev1)} + 2,44</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
