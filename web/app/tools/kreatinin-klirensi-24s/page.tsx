"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { KILO_ALT, KILO_UST, kiloMakulMu, parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * 24 saatlik idrarla ölçülmüş kreatinin klirensi.
 *   CrCl (mL/dk) = idrar kreatinin (mg/dL) × idrar hacmi (mL) / (plazma kreatinin (mg/dL) × 1440)
 *   Normalize = CrCl × 1,73 / VYA (Mosteller)
 * Toplamanın yeterliliği: günlük kreatinin atılımı erkekte 20–25, kadında 15–20 mg/kg.
 *
 * Toplama eksikse klirens OLDUĞUNDAN DÜŞÜK çıkar ve kullanıcı bunu fark etmez; araç kilo girildiğinde
 * atılımı hesaplayıp beklenen aralıkla karşılaştırıyor. Aralık dışında sonuç basılıyor ama uyarıyla.
 */
const UCR_UST = 1000;
const HACIM_ALT = 100, HACIM_UST = 10000;
const PCR_ALT = 0.1, PCR_UST = 30;
const BOY_ALT = 120, BOY_UST = 250;

const BEKLENEN: Record<"male" | "female", [number, number]> = { male: [20, 25], female: [15, 20] };

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function KreatininKlirensi24sPage() {
  const [ucr, setUcr] = React.useState("");
  const [hacim, setHacim] = React.useState("");
  const [pcr, setPcr] = React.useState("");
  const [kilo, setKilo] = React.useState("");
  const [boy, setBoy] = React.useState("");
  const [sex, setSex] = React.useState<"male" | "female">("male");

  const n = (s: string) => parseLocaleNumber(s);
  const ucrOk = sayiGirildiMi(ucr) && n(ucr) > 0 && n(ucr) <= UCR_UST;
  const hacimOk = sayiGirildiMi(hacim) && n(hacim) >= HACIM_ALT && n(hacim) <= HACIM_UST;
  const pcrOk = sayiGirildiMi(pcr) && n(pcr) >= PCR_ALT && n(pcr) <= PCR_UST;
  const kiloGirildi = kilo.trim() !== "";
  const kiloOk = kiloMakulMu(kilo);
  const boyGirildi = boy.trim() !== "";
  const boyOk = sayiGirildiMi(boy) && n(boy) >= BOY_ALT && n(boy) <= BOY_UST;

  const eksik = [
    !ucrOk && `idrar kreatinin (0–${UCR_UST} mg/dL)`,
    !hacimOk && `24 saatlik hacim (${HACIM_ALT}–${HACIM_UST} mL)`,
    !pcrOk && `plazma kreatinin (${String(PCR_ALT).replace(".", ",")}–${PCR_UST} mg/dL)`,
  ].filter(Boolean) as string[];
  const hatali = [
    kiloGirildi && !kiloOk && `ağırlık (${KILO_ALT}–${KILO_UST} kg)`,
    boyGirildi && !boyOk && `boy (${BOY_ALT}–${BOY_UST} cm)`,
  ].filter(Boolean) as string[];

  const hazir = eksik.length === 0;
  const crcl = hazir ? Math.round((n(ucr) * n(hacim)) / (n(pcr) * 1440)) : null;
  const bsa = kiloOk && boyOk ? Math.sqrt((n(boy) * n(kilo)) / 3600) : null;
  const normal = crcl !== null && bsa !== null ? Math.round((crcl * 1.73) / bsa) : null;
  const atilim = hazir ? (n(ucr) * n(hacim)) / 100 : null; // mg/gün
  const atilimKg = atilim !== null && kiloOk ? atilim / n(kilo) : null;
  const [bAlt, bUst] = BEKLENEN[sex];
  const toplamaUyari = atilimKg === null ? null : atilimKg < bAlt ? "eksik" : atilimKg > bUst ? "fazla" : "yeterli";
  const tr = (x: number, h = 1) => (Math.round(x * 10 ** h) / 10 ** h).toString().replace(".", ",");

  return (
    <OlcekKabugu
      slug="kreatinin-klirensi-24s"
      ikon="🫙"
      baslik="24 Saatlik Kreatinin Klirensi"
      altBaslik="Ölçülmüş CrCl · VYA Normalizasyonu · Toplama Yeterliliği"
      paylasim={{ crcl, normal }}
      not={
        <p>
          Tübüler kreatinin sekresyonu nedeniyle kreatinin klirensi GFR'yi ~%10–20 (ileri KBH'de daha fazla) olduğundan yüksek gösterir. Toplamaya sabah ilk
          idrar atılarak başlanır, ertesi sabahın ilk idrarı dahil edilir. Plazma kreatinini toplama süresi içinde alınmalıdır. Stabil böbrek işlevi olmayan
          hastada (AKI) yorumlanamaz.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">İdrar kreatinin (mg/dL)</span>
            <input type="text" inputMode="decimal" value={ucr} onChange={(e) => setUcr(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">24 saatlik hacim (mL)</span>
            <input type="text" inputMode="numeric" value={hacim} onChange={(e) => setHacim(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Plazma kreatinin (mg/dL)</span>
            <input type="text" inputMode="decimal" value={pcr} onChange={(e) => setPcr(e.target.value)} className={girdi} />
          </label>
        </div>
        <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest pl-1">İsteğe bağlı — normalizasyon ve toplama yeterliliği</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Ağırlık (kg)</span>
            <input type="text" inputMode="decimal" value={kilo} onChange={(e) => setKilo(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Boy (cm)</span>
            <input type="text" inputMode="decimal" value={boy} onChange={(e) => setBoy(e.target.value)} className={girdi} />
          </label>
          <div role="radiogroup" aria-labelledby="crcl-cinsiyet" className="flex flex-col gap-2">
            <span id="crcl-cinsiyet" className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Cinsiyet</span>
            <div className="flex gap-2">
              {(["male", "female"] as const).map((c) => (
                <label key={c} className={`flex-1 min-h-[52px] flex items-center justify-center rounded-xl border-2 text-[12px] font-black cursor-pointer ${sex === c ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                  <input type="radio" name="crcl-cinsiyet" className="sr-only" checked={sex === c} onChange={() => setSex(c)} />
                  {c === "male" ? "Erkek" : "Kadın"}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BinlikUyari girdiler={[{ ad: "24 saatlik hacim", ham: hacim }, { ad: "Ağırlık", ham: kilo }]} />
      {hatali.length > 0 && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">Kontrol edin: {hatali.join(" · ")}</div>
      )}

      <SonucDuyuru metin={crcl !== null ? `Kreatinin klirensi ${crcl} mL/dk${toplamaUyari === "eksik" ? " · toplama eksik olabilir" : ""}` : null} />
      {crcl !== null && atilim !== null ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50 space-y-3">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Kreatinin klirensi</p>
              <p className="text-4xl font-black text-blue-900">{crcl} <span className="text-lg">mL/dk</span></p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">1,73 m²'ye normalize</p>
              <p className="text-4xl font-black text-blue-900">{normal ?? "—"} <span className="text-lg">{normal !== null ? "mL/dk/1,73 m²" : ""}</span></p>
              {normal === null && <p className="text-[11px] font-bold text-slate-600">Ağırlık ve boy girin</p>}
            </div>
          </div>
          <p className="text-[12px] font-bold text-slate-700">
            Günlük kreatinin atılımı {Math.round(atilim)} mg{atilimKg !== null ? ` = ${tr(atilimKg)} mg/kg (beklenen ${bAlt}–${bUst})` : " — kiloya göre yeterlilik için ağırlık girin"}
          </p>
          {toplamaUyari && toplamaUyari !== "yeterli" && (
            <p role="alert" className="text-[12px] font-black text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              {toplamaUyari === "eksik"
                ? "Atılım beklenenin altında — toplama eksik olabilir; klirens olduğundan düşük hesaplanmış olabilir. Kas kütlesi çok düşük hastada da görülür."
                : "Atılım beklenenin üstünde — toplama 24 saati aşmış olabilir ya da kas kütlesi/et tüketimi yüksek."}
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
