"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Kronik miyeloid lösemi tanı anı risk skorları — iki denklem, aynı dört girdi.
 *
 *   Sokal (1984)  exp(0,0116 × (yaş − 43,4) + 0,0345 × (dalak − 7,51)
 *                     + 0,188 × ((trombosit/700)² − 0,563) + 0,0887 × (blast − 2,10))
 *                 düşük < 0,8 · orta 0,8–1,2 · yüksek > 1,2
 *   ELTS (2016)   0,0025 × (yaş/10)³ + 0,0615 × dalak + 0,1052 × blast
 *                     + 0,4104 × (trombosit/1000)^−0,5
 *                 düşük ≤ 1,5680 · orta 1,5680–2,2185 · yüksek > 2,2185
 * dalak: kosta kenarının altında cm · trombosit: × 10⁹/L · blast: periferik %
 *
 * Bant HAM değerle belirleniyor; ekranda 2–4 hane. ELTS sınırları 4 haneli olduğu için
 * 2 haneye yuvarlanmış değerle karşılaştırmak 1,5679'u "orta" yapardı.
 */
const YAS_ALT = 18, YAS_UST = 100;
const DALAK_UST = 40;
const PLT_ALT = 1, PLT_UST = 5000;

type Bant = { ad: string; renk: string };
const DUSUK: Bant = { ad: "Düşük risk", renk: "text-emerald-800" };
const ORTA: Bant = { ad: "Orta risk", renk: "text-amber-800" };
const YUKSEK: Bant = { ad: "Yüksek risk", renk: "text-rose-800" };

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function KmlRiskPage() {
  const [yas, setYas] = React.useState("");
  const [dalak, setDalak] = React.useState("");
  const [plt, setPlt] = React.useState("");
  const [blast, setBlast] = React.useState("");

  const yasN = parseLocaleNumber(yas), dalakN = parseLocaleNumber(dalak), pltN = parseLocaleNumber(plt), blastN = parseLocaleNumber(blast);
  const yasOk = sayiGirildiMi(yas) && yasN >= YAS_ALT && yasN <= YAS_UST;
  // Meşru sıfır: palpe edilemeyen dalak = 0 cm, periferde blast yok = %0.
  const dalakOk = sayiGirildiMi(dalak) && dalakN >= 0 && dalakN <= DALAK_UST;
  const pltOk = sayiGirildiMi(plt) && pltN >= PLT_ALT && pltN <= PLT_UST;
  const blastOk = sayiGirildiMi(blast) && blastN >= 0 && blastN <= 100;

  const eksik = [
    !yasOk && `yaş (${YAS_ALT}–${YAS_UST})`,
    !dalakOk && `dalak (0–${DALAK_UST} cm)`,
    !pltOk && `trombosit (${PLT_ALT}–${PLT_UST} × 10⁹/L)`,
    !blastOk && "blast (0–100 %)",
  ].filter(Boolean) as string[];

  const hazir = eksik.length === 0;
  const sokal = hazir
    ? Math.exp(0.0116 * (yasN - 43.4) + 0.0345 * (dalakN - 7.51) + 0.188 * ((pltN / 700) ** 2 - 0.563) + 0.0887 * (blastN - 2.1))
    : null;
  const elts = hazir ? 0.0025 * (yasN / 10) ** 3 + 0.0615 * dalakN + 0.1052 * blastN + 0.4104 * (pltN / 1000) ** -0.5 : null;

  const sokalBant = sokal === null ? null : sokal < 0.8 ? DUSUK : sokal <= 1.2 ? ORTA : YUKSEK;
  const eltsBant = elts === null ? null : elts <= 1.568 ? DUSUK : elts <= 2.2185 ? ORTA : YUKSEK;
  const tr = (n: number, h: number) => n.toFixed(h).replace(".", ",");

  const duyuru = sokalBant && eltsBant ? `ELTS: ${eltsBant.ad} · Sokal: ${sokalBant.ad}` : null;

  const kart = (ad: string, deger: number | null, bant: Bant | null, hane: number, esikler: string, vurgu = false) => (
    <div className={`rounded-2xl border-2 p-4 ${vurgu ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-white"}`}>
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{ad}</p>
      <p className="text-3xl font-black text-blue-900 mt-1">{deger !== null ? tr(deger, hane) : "—"}</p>
      {bant && <p className={`text-[14px] font-black mt-1 ${bant.renk}`}>{bant.ad}</p>}
      <p className="text-[11px] text-slate-600 mt-1">{esikler}</p>
    </div>
  );

  return (
    <OlcekKabugu
      slug="kml-risk"
      ikon="🧫"
      baslik="KML Risk Skoru"
      altBaslik="Kronik Miyeloid Lösemi · ELTS ve Sokal · Tanı Anı"
      paylasim={{ elts: elts !== null ? Number(elts.toFixed(4)) : null, sokal: sokal !== null ? Number(sokal.toFixed(2)) : null }}
      not={
        <>
          <p>
            Değerler tanıda, herhangi bir tedaviden (hidroksiüre dahil) önce alınmalıdır. ELTS, tirozin kinaz inhibitörü döneminde KML'ye bağlı ölümü
            öngörmek için geliştirilmiştir ve ELN 2020 önerilerinde Sokal'ın yerine tercih edilir. Dalak boyutu fizik muayenede kosta kenarının altında cm'dir.
          </p>
          <p>Sokal JE ve ark., Blood 1984; Pfirrmann M ve ark., Leukemia 2016; Hochhaus A ve ark. (ELN), Leukemia 2020.</p>
        </>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Yaş (yıl)</span>
          <input type="text" inputMode="numeric" value={yas} onChange={(e) => setYas(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Dalak — kosta altı (cm)</span>
          <input type="text" inputMode="decimal" value={dalak} onChange={(e) => setDalak(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Trombosit (× 10⁹/L)</span>
          <input type="text" inputMode="numeric" value={plt} onChange={(e) => setPlt(e.target.value)} placeholder="ör. 450" className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Periferik blast (%)</span>
          <input type="text" inputMode="decimal" value={blast} onChange={(e) => setBlast(e.target.value)} className={girdi} />
        </label>
      </div>
      <BinlikUyari girdiler={[{ ad: "Trombosit", ham: plt }]} />

      <SonucDuyuru metin={duyuru} />
      {hazir ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {kart("ELTS", elts, eltsBant, 4, "Düşük ≤ 1,5680 · orta ≤ 2,2185 · yüksek > 2,2185", true)}
          {kart("Sokal", sokal, sokalBant, 2, "Düşük < 0,8 · orta 0,8–1,2 · yüksek > 1,2")}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
