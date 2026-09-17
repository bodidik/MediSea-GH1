"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { egfrCkdEpi2021, parseLocaleNumber, sayiGirildiMi, type Sex } from "@/app/tools/lib/calc-utils";

/**
 * Sistatin C ile eGFR — iki CKD-EPI denklemi.
 *
 *   eGFRcys (CKD-EPI 2012):
 *     133 × min(ScysC/0,8, 1)^−0,499 × max(ScysC/0,8, 1)^−1,328 × 0,996^yaş × 0,932 [kadın]
 *   eGFRcr-cys (CKD-EPI 2021, ırk katsayısız):
 *     135 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−0,544 × min(ScysC/0,8, 1)^−0,323
 *         × max(ScysC/0,8, 1)^−0,778 × 0,9961^yaş × 0,963 [kadın]
 *     κ = 0,7 (kadın) / 0,9 (erkek) · α = −0,219 (kadın) / −0,144 (erkek)
 *
 * Kreatinin girilmezse yalnızca eGFRcys basılıyor; kreatinin girilince eGFRcr (2021, kütüphanenin
 * ortak fonksiyonu) ve eGFRcr-cys de yan yana. KDIGO 2024: doğrulama gerektiğinde cr-cys tercih edilir.
 */
const SCR_ALT = 0.1, SCR_UST = 30;
const CYS_ALT = 0.2, CYS_UST = 10;
const YAS_ALT = 18, YAS_UST = 110;

function egfrCys2012(cys: number, yas: number, sex: Sex): number {
  const oran = cys / 0.8;
  return 133 * Math.min(oran, 1) ** -0.499 * Math.max(oran, 1) ** -1.328 * 0.996 ** yas * (sex === "female" ? 0.932 : 1);
}

function egfrCrCys2021(scr: number, cys: number, yas: number, sex: Sex): number {
  const kadin = sex === "female";
  const k = kadin ? 0.7 : 0.9;
  const a = kadin ? -0.219 : -0.144;
  return (
    135 *
    Math.min(scr / k, 1) ** a *
    Math.max(scr / k, 1) ** -0.544 *
    Math.min(cys / 0.8, 1) ** -0.323 *
    Math.max(cys / 0.8, 1) ** -0.778 *
    0.9961 ** yas *
    (kadin ? 0.963 : 1)
  );
}

function evre(g: number): string {
  if (g >= 90) return "G1";
  if (g >= 60) return "G2";
  if (g >= 45) return "G3a";
  if (g >= 30) return "G3b";
  if (g >= 15) return "G4";
  return "G5";
}

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function EgfrSistatinPage() {
  const [cys, setCys] = React.useState("");
  const [scr, setScr] = React.useState("");
  const [yas, setYas] = React.useState("");
  const [sex, setSex] = React.useState<Sex>("male");

  const cysN = parseLocaleNumber(cys), scrN = parseLocaleNumber(scr), yasN = parseLocaleNumber(yas);
  const cysOk = sayiGirildiMi(cys) && cysN >= CYS_ALT && cysN <= CYS_UST;
  const yasOk = sayiGirildiMi(yas) && yasN >= YAS_ALT && yasN <= YAS_UST;
  const scrGirildi = scr.trim() !== "";
  const scrOk = sayiGirildiMi(scr) && scrN >= SCR_ALT && scrN <= SCR_UST;

  const eksik = [
    !cysOk && `sistatin C (${String(CYS_ALT).replace(".", ",")}–${CYS_UST} mg/L)`,
    !yasOk && `yaş (${YAS_ALT}–${YAS_UST})`,
    scrGirildi && !scrOk && `kreatinin (${String(SCR_ALT).replace(".", ",")}–${SCR_UST} mg/dL) — ya da boş bırakın`,
  ].filter(Boolean) as string[];

  const hazir = eksik.length === 0;
  const ecys = hazir ? Math.round(egfrCys2012(cysN, yasN, sex)) : null;
  const ecr = hazir && scrOk ? Math.round(egfrCkdEpi2021(scrN, yasN, sex)) : null;
  const ecrcys = hazir && scrOk ? Math.round(egfrCrCys2021(scrN, cysN, yasN, sex)) : null;

  const oncelikli = ecrcys ?? ecys;
  const fark = ecr !== null && ecys !== null ? ecys - ecr : null;

  const kart = (ad: string, deger: number | null, alt: string, vurgu = false) => (
    <div className={`rounded-2xl border-2 p-4 ${vurgu ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-white"}`}>
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{ad}</p>
      <p className="text-3xl font-black text-blue-900 mt-1">{deger ?? "—"}</p>
      <p className="text-[11px] font-bold text-slate-600">{deger !== null ? `mL/dk/1,73 m² · ${evre(deger)}` : alt}</p>
    </div>
  );

  return (
    <OlcekKabugu
      slug="egfr-sistatin"
      ikon="🧪"
      baslik="Sistatin C ile eGFR"
      altBaslik="CKD-EPI 2012 Sistatin · CKD-EPI 2021 Kreatinin-Sistatin"
      paylasim={{ ecys, ecrcys }}
      not={
        <p>
          Sistatin C kas kütlesinden bağımsızdır; sarkopeni, ampütasyon, siroz, aşırı kas kütlesi ya da kreatin takviyesinde kreatinine dayalı eGFR'yi
          doğrulamak için kullanılır. Tiroid işlev bozukluğu, yüksek doz glukokortikoid ve sistemik inflamasyon sistatin C'yi etkiler. Sistatin C
          IFCC standardına izlenebilir yöntemle ölçülmelidir. Inker LA ve ark., N Engl J Med 2012 ve 2021.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Sistatin C (mg/L)</span>
          <input type="text" inputMode="decimal" value={cys} onChange={(e) => setCys(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Kreatinin (mg/dL) — isteğe bağlı</span>
          <input type="text" inputMode="decimal" value={scr} onChange={(e) => setScr(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Yaş (yıl)</span>
          <input type="text" inputMode="numeric" value={yas} onChange={(e) => setYas(e.target.value)} className={girdi} />
        </label>
        <div role="radiogroup" aria-labelledby="cys-cinsiyet" className="flex flex-col gap-2">
          <span id="cys-cinsiyet" className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Cinsiyet</span>
          <div className="flex gap-2">
            {(["male", "female"] as const).map((c) => (
              <label key={c} className={`flex-1 min-h-[52px] flex items-center justify-center rounded-xl border-2 text-[12px] font-black cursor-pointer ${sex === c ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                <input type="radio" name="cys-cinsiyet" className="sr-only" checked={sex === c} onChange={() => setSex(c)} />
                {c === "male" ? "Erkek" : "Kadın"}
              </label>
            ))}
          </div>
        </div>
      </div>

      <SonucDuyuru metin={oncelikli !== null ? `${ecrcys !== null ? "eGFR kreatinin-sistatin" : "eGFR sistatin"} ${oncelikli} — ${evre(oncelikli)}` : null} />
      {hazir ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {kart("Kreatinin-sistatin (2021)", ecrcys, "Kreatinin girin", true)}
            {kart("Sistatin (2012)", ecys, "", ecrcys === null)}
            {kart("Kreatinin (2021)", ecr, "Kreatinin girin")}
          </div>
          {fark !== null && Math.abs(fark) >= 15 && (
            <p role="alert" className="text-[12px] font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Kreatinin ve sistatin eGFR'leri arasında {Math.abs(fark)} mL/dk fark var — {fark < 0 ? "sistatin daha düşük: kas kütlesi azlığı kreatinin eGFR'sini olduğundan yüksek gösteriyor olabilir" : "sistatin daha yüksek: yüksek kas kütlesi, et tüketimi ya da kreatinin sekresyonunu etkileyen ilaçlar düşünülebilir"}. Kreatinin-sistatin değeri esas alınmalı; gerekirse ölçülmüş GFR.
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
