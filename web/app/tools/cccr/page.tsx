"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Kalsiyum / kreatinin klirens oranı (CCCR) — hiperkalsemi + PTH yüksekliğinde FHH ile primer
 * hiperparatiroidi ayrımı.
 *   CCCR = (idrar Ca × serum Cr) / (serum Ca × idrar Cr)   — 24 saatlik idrar, eş zamanlı serum
 *   < 0,01 FHH lehine · 0,01–0,02 belirsiz · > 0,02 primer hiperparatiroidi lehine
 * Oran birimsiz; Ca ve Cr serum/idrar çiftleri kendi içinde aynı birimde olmalı (mg/dL).
 * Karşılaştırma 4 haneye yuvarlanmış ekran değeriyle yapılıyor.
 */
const CA_ALT = 5, CA_UST = 20;
const CR_ALT = 0.1, CR_UST = 30;
const U_UST = 2000;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function CccrPage() {
  const [sca, setSca] = React.useState("");
  const [scr, setScr] = React.useState("");
  const [uca, setUca] = React.useState("");
  const [ucr, setUcr] = React.useState("");

  const n = (s: string) => parseLocaleNumber(s);
  const scaOk = sayiGirildiMi(sca) && n(sca) >= CA_ALT && n(sca) <= CA_UST;
  const scrOk = sayiGirildiMi(scr) && n(scr) >= CR_ALT && n(scr) <= CR_UST;
  // Meşru sıfıra yakın: idrar Ca çok düşük olabilir.
  const ucaOk = sayiGirildiMi(uca) && n(uca) >= 0 && n(uca) <= U_UST;
  const ucrOk = sayiGirildiMi(ucr) && n(ucr) > 0 && n(ucr) <= U_UST;
  const eksik = [
    !scaOk && `serum Ca (${CA_ALT}–${CA_UST} mg/dL)`,
    !scrOk && "serum kreatinin (mg/dL)",
    !ucaOk && "idrar Ca (mg/dL)",
    !ucrOk && "idrar kreatinin (mg/dL)",
  ].filter(Boolean) as string[];

  const oran = eksik.length === 0 ? Math.round(((n(uca) * n(scr)) / (n(sca) * n(ucr))) * 10000) / 10000 : null;
  const yorum =
    oran === null ? null
      : oran < 0.01 ? { t: "FHH lehine (< 0,01)", a: "Ailesel hipokalsiürik hiperkalsemi olası — CASR (ve AP2S1, GNA11) genetik testi ve aile taraması; paratiroidektomi yarar sağlamaz.", r: "border-amber-200 bg-amber-50 text-amber-900" }
      : oran > 0.02 ? { t: "Primer hiperparatiroidi lehine (> 0,02)", a: "FHH olasılığı düşük — primer hiperparatiroidi değerlendirmesi ve cerrahi endikasyonları.", r: "border-rose-200 bg-rose-50 text-rose-900" }
      : { t: "Belirsiz (0,01–0,02)", a: "İki tanı da mümkün; FHH ile primer hiperparatiroidinin örtüştüğü aralık — genetik test ve aile öyküsü belirleyici.", r: "border-slate-200 bg-slate-50 text-slate-800" };

  return (
    <OlcekKabugu
      slug="cccr"
      ikon="🦴"
      baslik="Kalsiyum/Kreatinin Klirens Oranı"
      altBaslik="CCCR · FHH ile Primer Hiperparatiroidi Ayrımı"
      paylasim={{ cccr: oran }}
      not={
        <p>
          Yorumlanabilmesi için 25-OH D vitamini yeterli olmalı ve tiyazid, lityum ya da kalsiyum kısıtlaması olmamalıdır; D vitamini eksikliği ve böbrek
          yetmezliği primer hiperparatiroidide de oranı 0,01'in altına çekebilir. 24 saatlik idrar tercih edilir; spot idrarla hesaplanan oran daha az
          güvenilirdir. Christensen SE ve ark., Clin Endocrinol 2008.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Serum kalsiyum (mg/dL)", sca, setSca],
          ["Serum kreatinin (mg/dL)", scr, setScr],
          ["24 saatlik idrar kalsiyum (mg/dL)", uca, setUca],
          ["24 saatlik idrar kreatinin (mg/dL)", ucr, setUcr],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>

      <SonucDuyuru metin={oran !== null && yorum ? `CCCR ${String(oran).replace(".", ",")} — ${yorum.t}` : null} />
      {oran !== null && yorum ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${yorum.r}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">CCCR</p>
          <p className="text-4xl font-black">{String(oran).replace(".", ",")}</p>
          <p className="text-lg font-black">{yorum.t}</p>
          <p className="text-[12px] font-bold">{yorum.a}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
