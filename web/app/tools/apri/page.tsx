"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * APRI = (AST / AST üst sınırı) / trombosit (× 10⁹/L) × 100 (Wai ve ark., Hepatology 2003).
 *
 * İki ayrı soru, iki ayrı eşik çifti — tek bir bantta birleştirilmiyor:
 *   anlamlı fibroz (≥ F2): < 0,5 dışlar · > 1,5 destekler
 *   siroz (F4):            < 1,0 dışlar · ≥ 2,0 destekler (DSÖ hepatit C/B rehberleri)
 * AST üst sınırı laboratuvara göre değişir; boş bırakılırsa 40 U/L.
 */
const ENZIM_UST = 10000;
const PLT_ALT = 1, PLT_UST = 2000;
const VARSAYILAN_ULN = 40;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function ApriPage() {
  const [ast, setAst] = React.useState("");
  const [uln, setUln] = React.useState("");
  const [plt, setPlt] = React.useState("");

  const astN = parseLocaleNumber(ast), pltN = parseLocaleNumber(plt);
  const ulnN = uln.trim() === "" ? VARSAYILAN_ULN : parseLocaleNumber(uln);
  const astOk = sayiGirildiMi(ast) && astN > 0 && astN <= ENZIM_UST;
  const ulnOk = uln.trim() === "" || (sayiGirildiMi(uln) && ulnN >= 10 && ulnN <= 100);
  const pltOk = sayiGirildiMi(plt) && pltN >= PLT_ALT && pltN <= PLT_UST;
  const eksik = [
    !astOk && "AST (U/L)",
    !ulnOk && "AST üst sınırı (10–100 U/L)",
    !pltOk && `trombosit (${PLT_ALT}–${PLT_UST} × 10⁹/L)`,
  ].filter(Boolean) as string[];

  // Eşikler ekranda görünen 2 haneli değerle karşılaştırılıyor.
  const apri = eksik.length === 0 ? Math.round(((astN / ulnN / pltN) * 100) * 100) / 100 : null;

  const fibroz = apri === null ? null : apri < 0.5 ? { t: "Anlamlı fibroz olası değil (< 0,5)", r: "emerald" } : apri > 1.5 ? { t: "Anlamlı fibroz olası (> 1,5)", r: "rose" } : { t: "Belirsiz (0,5–1,5)", r: "amber" };
  const siroz = apri === null ? null : apri < 1.0 ? { t: "Siroz olası değil (< 1,0)", r: "emerald" } : apri >= 2.0 ? { t: "Siroz olası (≥ 2,0)", r: "rose" } : { t: "Belirsiz (1,0–1,99)", r: "amber" };

  const RENK: Record<string, string> = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
  };

  return (
    <OlcekKabugu
      slug="apri"
      ikon="🫘"
      baslik="APRI"
      altBaslik="AST / Trombosit Oranı İndeksi · Fibroz ve Siroz"
      paylasim={{ apri }}
      not={
        <p>
          Kronik hepatit C için geliştirilmiş, hepatit B'de de DSÖ tarafından önerilmiştir; duyarlılığı orta düzeydedir, özellikle "belirsiz" aralıkta
          elastografi gerekir. MASLD'de FIB-4 tercih edilir. Akut hepatit ve başka nedenli trombositopenide yanıltır. Wai CT ve ark., Hepatology 2003.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">AST (U/L)</span>
          <input type="text" inputMode="numeric" value={ast} onChange={(e) => setAst(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">AST üst sınırı (U/L)</span>
          <input type="text" inputMode="numeric" value={uln} onChange={(e) => setUln(e.target.value)} placeholder={`boş: ${VARSAYILAN_ULN}`} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Trombosit (× 10⁹/L)</span>
          <input type="text" inputMode="numeric" value={plt} onChange={(e) => setPlt(e.target.value)} className={girdi} />
        </label>
      </div>

      <SonucDuyuru metin={fibroz && siroz ? `APRI ${String(apri).replace(".", ",")} — ${fibroz.t} · ${siroz.t}` : null} />
      {apri !== null && fibroz && siroz ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white space-y-3">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">APRI</p>
          <p className="text-4xl font-black text-blue-900">{String(apri).replace(".", ",")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`rounded-2xl border-2 p-4 ${RENK[fibroz.r]}`}>
              <p className="text-[10px] font-black uppercase tracking-widest">Anlamlı fibroz (≥ F2)</p>
              <p className="text-[14px] font-black mt-1">{fibroz.t}</p>
            </div>
            <div className={`rounded-2xl border-2 p-4 ${RENK[siroz.r]}`}>
              <p className="text-[10px] font-black uppercase tracking-widest">Siroz (F4)</p>
              <p className="text-[14px] font-black mt-1">{siroz.t}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
