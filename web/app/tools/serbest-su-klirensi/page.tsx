"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Elektrolitsiz serbest su klirensi (EFWC) ve Furst oranı — hiponatremide sıvı kısıtlaması.
 *
 *   Furst oranı = (idrar Na + idrar K) / serum Na
 *   EFWC (mL/gün) = idrar hacmi × (1 − Furst oranı)
 *
 * Furst oranına göre sıvı kısıtlaması (Furst ve ark., Am J Med Sci 2000):
 *   > 1     kısıtlamaya yanıt beklenmez — tuz tableti, üre, vaptan gibi ek tedavi
 *   0,5–1   < 500 mL/gün
 *   < 0,5   < 1 L/gün
 *
 * Hacim girilmezse yalnızca Furst oranı ve öneri basılıyor (spot idrarla da uygulanabilir).
 */
const NA_ALT = 100, NA_UST = 180;
const IDRAR_UST = 500;
const HACIM_ALT = 100, HACIM_UST = 20000;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function SerbestSuKlirensiPage() {
  const [pna, setPna] = React.useState("");
  const [una, setUna] = React.useState("");
  const [uk, setUk] = React.useState("");
  const [hacim, setHacim] = React.useState("");

  const n = (s: string) => parseLocaleNumber(s);
  const pnaOk = sayiGirildiMi(pna) && n(pna) >= NA_ALT && n(pna) <= NA_UST;
  // Meşru sıfır: idrar Na ya da K çok düşük olabilir.
  const unaOk = sayiGirildiMi(una) && n(una) >= 0 && n(una) <= IDRAR_UST;
  const ukOk = sayiGirildiMi(uk) && n(uk) >= 0 && n(uk) <= IDRAR_UST;
  const hacimGirildi = hacim.trim() !== "";
  const hacimOk = sayiGirildiMi(hacim) && n(hacim) >= HACIM_ALT && n(hacim) <= HACIM_UST;

  const eksik = [
    !pnaOk && `serum Na (${NA_ALT}–${NA_UST} mEq/L)`,
    !unaOk && `idrar Na (0–${IDRAR_UST})`,
    !ukOk && `idrar K (0–${IDRAR_UST})`,
  ].filter(Boolean) as string[];

  const hamOran = eksik.length === 0 ? (n(una) + n(uk)) / n(pna) : null;
  // Eşikler 2 haneli değerle — ekranda "0,50" yazıp "< 0,5" denmesin.
  const oran = hamOran !== null ? Math.round(hamOran * 100) / 100 : null;
  const efwc = hamOran !== null && hacimOk ? Math.round(n(hacim) * (1 - hamOran)) : null;

  const oneri =
    oran === null
      ? null
      : oran > 1
        ? { t: "Sıvı kısıtlamasına yanıt beklenmez", a: "İdrar serum kadar ya da daha konsantre — kısıtlama tek başına Na'yı yükseltmez. Oral tuz + loop diüretik, oral üre ya da vaptan değerlendirin.", r: "border-rose-200 bg-rose-50 text-rose-900" }
        : oran >= 0.5
          ? { t: "Sıvı kısıtlaması < 500 mL/gün", a: "Kısıtlama sıkı olmalı; yanıt yoksa ek tedavi gerekir.", r: "border-amber-200 bg-amber-50 text-amber-900" }
          : { t: "Sıvı kısıtlaması < 1 L/gün", a: "Kısıtlamaya yanıt olasılığı yüksek.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };

  const tr = (x: number) => String(x).replace(".", ",");

  return (
    <OlcekKabugu
      slug="serbest-su-klirensi"
      ikon="💧"
      baslik="Elektrolitsiz Serbest Su Klirensi"
      altBaslik="Hiponatremide Furst Oranı · Sıvı Kısıtlaması Hedefi"
      paylasim={{ furst: oran, efwc }}
      not={
        <p>
          Negatif EFWC böbreğin elektrolitsiz su tuttuğunu (serum Na'yı düşürdüğünü), pozitif EFWC su attığını gösterir. Yöntem uygun hacim durumundaki
          (SIADH gibi) hiponatremide anlamlıdır; hipovolemide önce hacim açığı düzeltilir. Oral alım ve insensibl kayıplar hesaba girmez.
          Furst H ve ark., Am J Med Sci 2000; Spasovski G ve ark., Eur J Endocrinol 2014.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Serum Na (mEq/L)</span>
            <input type="text" inputMode="decimal" value={pna} onChange={(e) => setPna(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">İdrar Na (mEq/L)</span>
            <input type="text" inputMode="decimal" value={una} onChange={(e) => setUna(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">İdrar K (mEq/L)</span>
            <input type="text" inputMode="decimal" value={uk} onChange={(e) => setUk(e.target.value)} className={girdi} />
          </label>
        </div>
        <label className="flex flex-col gap-2 sm:max-w-xs">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">24 saatlik idrar hacmi (mL) — isteğe bağlı</span>
          <input type="text" inputMode="numeric" value={hacim} onChange={(e) => setHacim(e.target.value)} className={girdi} />
        </label>
      </div>
      <BinlikUyari girdiler={[{ ad: "İdrar hacmi", ham: hacim }]} />
      {hacimGirildi && !hacimOk && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          İdrar hacmi {HACIM_ALT}–{HACIM_UST} mL olmalı — EFWC hesaplanmadı.
        </div>
      )}

      <SonucDuyuru metin={oneri ? `Furst oranı ${tr(oran!)} — ${oneri.t}` : null} />
      {oneri && oran !== null ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-3 ${oneri.r}`}>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Furst oranı</p>
              <p className="text-4xl font-black">{tr(oran)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">EFWC</p>
              <p className="text-4xl font-black">{efwc !== null ? `${efwc > 0 ? "+" : ""}${efwc}` : "—"} <span className="text-lg">{efwc !== null ? "mL/gün" : ""}</span></p>
              {efwc === null && <p className="text-[11px] font-bold">İdrar hacmi girin</p>}
            </div>
          </div>
          <p className="text-lg font-black">{oneri.t}</p>
          <p className="text-[12px] font-bold">{oneri.a}</p>
          {efwc !== null && (
            <p className="text-[12px] font-bold">
              {efwc < 0 ? "Negatif EFWC: böbrek elektrolitsiz su tutuyor — Na düşmeye devam eder." : "Pozitif EFWC: böbrek elektrolitsiz su atıyor — alım bunun altında tutulursa Na yükselir."}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
