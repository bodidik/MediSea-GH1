"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Hesaplanan LDL kolesterol — iki denklem (mg/dL):
 *   Friedewald (1972)        LDL = TK − HDL − TG/5                 TG < 400 ise geçerli
 *   Sampson / NIH (2020)     LDL = TK/0,948 − HDL/0,971
 *                                 − (TG/8,56 + TG × nonHDL/2140 − TG²/16100) − 9,44
 *                                                                  TG ≤ 800 ise geçerli
 *
 * Geçerlilik sınırının DIŞINDA sayı basılmıyor; sebep yazılıyor. Özellikle düşük LDL ve
 * yüksek TG'de Friedewald LDL'yi olduğundan düşük gösterir — ESC hedefleri < 55 mg/dL
 * olduğundan bu fark tedavi kararını değiştirebilir.
 */
const TK_ALT = 50, TK_UST = 1000;
const HDL_ALT = 5, HDL_UST = 200;
const TG_ALT = 10, TG_UST = 5000;
const FRIEDEWALD_TG = 400;
const SAMPSON_TG = 800;

const HEDEFLER = [
  { risk: "Çok yüksek risk", hedef: "< 55 mg/dL ve bazalden ≥ %50 azalma" },
  { risk: "Yüksek risk", hedef: "< 70 mg/dL ve bazalden ≥ %50 azalma" },
  { risk: "Orta risk", hedef: "< 100 mg/dL" },
  { risk: "Düşük risk", hedef: "< 116 mg/dL" },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function LdlHesaplamaPage() {
  const [tk, setTk] = React.useState("");
  const [hdl, setHdl] = React.useState("");
  const [tg, setTg] = React.useState("");

  const tkN = parseLocaleNumber(tk), hdlN = parseLocaleNumber(hdl), tgN = parseLocaleNumber(tg);
  const tkOk = sayiGirildiMi(tk) && tkN >= TK_ALT && tkN <= TK_UST;
  const hdlOk = sayiGirildiMi(hdl) && hdlN >= HDL_ALT && hdlN <= HDL_UST;
  const tgOk = sayiGirildiMi(tg) && tgN >= TG_ALT && tgN <= TG_UST;
  const tutarli = tkOk && hdlOk ? hdlN < tkN : true;

  const eksik = [
    !tkOk && `total kolesterol (${TK_ALT}–${TK_UST})`,
    !hdlOk && `HDL (${HDL_ALT}–${HDL_UST})`,
    !tgOk && `trigliserid (${TG_ALT}–${TG_UST})`,
    !tutarli && "HDL total kolesterolden küçük olmalı",
  ].filter(Boolean) as string[];

  const hazir = eksik.length === 0;
  const nonHdl = hazir ? tkN - hdlN : null;
  const friedewald = hazir && tgN < FRIEDEWALD_TG ? Math.round(tkN - hdlN - tgN / 5) : null;
  const sampson =
    hazir && tgN <= SAMPSON_TG
      ? Math.round(tkN / 0.948 - hdlN / 0.971 - (tgN / 8.56 + (tgN * (tkN - hdlN)) / 2140 - (tgN * tgN) / 16100) - 9.44)
      : null;

  const duyuru = hazir
    ? sampson !== null
      ? `LDL (Sampson) ${sampson} mg/dL`
      : "Trigliserid 800 mg/dL üstünde — LDL hesaplanamaz, doğrudan ölçüm gerekli"
    : null;

  const kart = (ad: string, deger: number | null, gecersizNeden: string, vurgu = false) => (
    <div className={`rounded-2xl border-2 p-4 ${vurgu ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-white"}`}>
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{ad}</p>
      {deger !== null ? (
        <p className="text-3xl font-black text-blue-900 mt-1">{deger}<span className="text-sm font-bold text-slate-600"> mg/dL</span></p>
      ) : (
        <p className="text-[12px] font-bold text-rose-800 mt-2">{gecersizNeden}</p>
      )}
    </div>
  );

  return (
    <OlcekKabugu
      slug="ldl-hesaplama"
      ikon="🧈"
      baslik="LDL Kolesterol Hesaplama"
      altBaslik="Friedewald · Sampson (NIH) · Non-HDL"
      paylasim={{ ldl: sampson, friedewald }}
      not={
        <>
          <p>
            Değerler mg/dL'dir (mmol/L × 38,67). Açlık gerekli değildir ancak TG yüksekse ölçüm tekrarlanabilir. LDL &lt; 70 mg/dL ve TG 150–400 mg/dL
            aralığında Friedewald belirgin olarak düşük tahmin eder; Sampson denklemi bu aralıkta ölçülen LDL'ye daha yakındır. Non-HDL kolesterol
            hedefi LDL hedefinin 30 mg/dL üstüdür.
          </p>
          <p>Friedewald WT ve ark., Clin Chem 1972; Sampson M ve ark., JAMA Cardiol 2020; ESC/EAS dislipidemi kılavuzu 2019.</p>
        </>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Total kolesterol</span>
          <input type="text" inputMode="numeric" value={tk} onChange={(e) => setTk(e.target.value)} placeholder="mg/dL" className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">HDL</span>
          <input type="text" inputMode="numeric" value={hdl} onChange={(e) => setHdl(e.target.value)} placeholder="mg/dL" className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Trigliserid</span>
          <input type="text" inputMode="numeric" value={tg} onChange={(e) => setTg(e.target.value)} placeholder="mg/dL" className={girdi} />
        </label>
      </div>

      <SonucDuyuru metin={duyuru} />
      {hazir ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {kart("Sampson (NIH)", sampson, `TG > ${SAMPSON_TG} mg/dL — doğrudan LDL ölçümü gerekli`, true)}
            {kart("Friedewald", friedewald, `TG ≥ ${FRIEDEWALD_TG} mg/dL — geçersiz`)}
            {kart("Non-HDL", nonHdl, "")}
          </div>
          {friedewald !== null && sampson !== null && Math.abs(sampson - friedewald) >= 10 && (
            <p className="text-[12px] font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              İki denklem arasında {Math.abs(sampson - friedewald)} mg/dL fark var — hedefe yakın değerlerde Sampson ya da doğrudan ölçüm esas alınmalı.
            </p>
          )}
          <table className="w-full text-[12px]">
            <caption className="text-left text-[11px] font-black text-slate-700 mb-1">LDL hedefleri (ESC/EAS 2019)</caption>
            <tbody>
              {HEDEFLER.map((h) => (
                <tr key={h.risk} className="border-t border-slate-200">
                  <th scope="row" className="py-1.5 pr-3 text-left font-black text-blue-900">{h.risk}</th>
                  <td className="py-1.5 text-slate-700">{h.hedef}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
