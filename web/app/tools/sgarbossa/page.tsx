"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Sol dal bloğu (ya da ventriküler pace) varlığında akut MI — iki ölçüt seti.
 *
 * Özgün Sgarbossa (N Engl J Med 1996) — puanlı, ≥ 3 pozitif:
 *   A  herhangi bir derivasyonda QRS ile AYNI yönde ≥ 1 mm ST yükselmesi   5
 *   B  V1–V3'te ≥ 1 mm ST çökmesi                                         3
 *   C  QRS ile ZIT yönde ≥ 5 mm ST yükselmesi                             2
 *
 * Smith-modifiye Sgarbossa (Ann Emerg Med 2012) — puansız, herhangi biri pozitif:
 *   A ve B aynı; C yerine: zıt yönlü ST yükselmesi / S dalgası derinliği ≥ 0,25
 *
 * Özgün C ölçütü tek başına 2 puan verdiği için TEK BAŞINA pozitif yapamaz; araç bu yüzden
 * iki seti ayrı gösteriyor — karıştırılırsa "5 mm zıt yükselme var, MI" gibi bir okuma çıkar.
 */
const ESIK_ORAN = 0.25;
const MM_UST = 30;

type EH = boolean | null;

function Soru({ id, metin, aciklama, deger, onSec }: { id: string; metin: string; aciklama?: string; deger: EH; onSec: (v: EH) => void }) {
  const bid = `sgb-${id}`;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <p id={bid} className="text-[12px] font-black text-blue-900 leading-snug">{metin}</p>
      {aciklama && <p className="text-[11px] text-slate-600 leading-snug mt-1">{aciklama}</p>}
      <div role="group" aria-labelledby={bid} className="flex gap-2 mt-3">
        {([true, false] as const).map((v) => (
          <button
            key={String(v)}
            type="button"
            aria-pressed={deger === v}
            onClick={() => onSec(deger === v ? null : v)}
            className={`flex-1 min-h-[44px] rounded-xl border-2 text-[12px] font-black transition-all
              ${deger === v ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200"}`}
          >
            {v ? "Var" : "Yok"}
          </button>
        ))}
      </div>
    </div>
  );
}

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function SgarbossaPage() {
  const [a, setA] = React.useState<EH>(null);
  const [b, setB] = React.useState<EH>(null);
  const [c, setC] = React.useState<EH>(null);
  const [ste, setSte] = React.useState("");
  const [s, setS] = React.useState("");

  const steN = parseLocaleNumber(ste), sN = parseLocaleNumber(s);
  // Meşru sıfır: zıt yönde ST yükselmesi olmayabilir.
  const steOk = sayiGirildiMi(ste) && steN >= 0 && steN <= MM_UST;
  const sOk = sayiGirildiMi(s) && sN > 0 && sN <= MM_UST;
  // Karşılaştırma HAM oranla: yuvarlanmış oran 0,2492'yi 0,25 yapıp eşiği geçirirdi; ekranda da 3 hane.
  const oranHam = steOk && sOk ? steN / sN : null;
  const oran = oranHam !== null ? Math.round(oranHam * 1000) / 1000 : null;
  const oranHatali = (ste.trim() !== "" && !steOk) || (s.trim() !== "" && !sOk);

  const ozgunHazir = a !== null && b !== null && c !== null;
  const ozgunPuan = ozgunHazir ? (a ? 5 : 0) + (b ? 3 : 0) + (c ? 2 : 0) : null;
  const ozgunPozitif = ozgunPuan !== null ? ozgunPuan >= 3 : null;

  const smithHazir = a !== null && b !== null && oranHam !== null;
  const smithPozitif = a === true || b === true ? true : smithHazir ? oranHam! >= ESIK_ORAN : null;

  const duyuru =
    smithPozitif === null && ozgunPozitif === null
      ? null
      : `Smith-modifiye: ${smithPozitif === null ? "eksik" : smithPozitif ? "pozitif" : "negatif"} · Özgün Sgarbossa: ${ozgunPuan === null ? "eksik" : `${ozgunPuan} puan, ${ozgunPozitif ? "pozitif" : "negatif"}`}`;

  const kart = (baslik: string, pozitif: boolean | null, detay: string, eksik: string) => (
    <div className={`rounded-2xl border-2 p-4 ${pozitif === null ? "border-slate-200 bg-white" : pozitif ? "border-rose-300 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{baslik}</p>
      <p className={`text-xl font-black mt-1 ${pozitif === null ? "text-slate-600" : pozitif ? "text-rose-800" : "text-emerald-800"}`}>
        {pozitif === null ? "Eksik" : pozitif ? "Pozitif — akut oklüzyon MI lehine" : "Negatif"}
      </p>
      <p className="text-[11px] font-bold text-slate-700 mt-1">{pozitif === null ? eksik : detay}</p>
    </div>
  );

  return (
    <OlcekKabugu
      slug="sgarbossa"
      ikon="📉"
      baslik="Sgarbossa Kriterleri"
      altBaslik="Sol Dal Bloğunda Akut MI · Özgün ve Smith-Modifiye"
      paylasim={{ ozgun: ozgunPuan, oran }}
      not={
        <>
          <p>
            Özgün Sgarbossa ölçütleri özgüldür ama duyarlılığı düşüktür; negatif sonuç MI'yı dışlamaz. Smith-modifiye ölçütlerin duyarlılığı belirgin
            olarak daha yüksektir. Ventriküler pace ritminde de uygulanabilir. Klinik tablo uyumluysa negatif EKG acil kardiyoloji konsültasyonunu geciktirmemelidir.
          </p>
          <p>Sgarbossa EB ve ark., N Engl J Med 1996; Smith SW ve ark., Ann Emerg Med 2012.</p>
        </>
      }
    >
      <div className="space-y-3">
        <Soru id="a" metin="A — QRS ile aynı yönde ≥ 1 mm ST yükselmesi (herhangi bir derivasyon)" aciklama="Özgün: 5 puan · Smith: tek başına pozitif" deger={a} onSec={setA} />
        <Soru id="b" metin="B — V1, V2 ya da V3'te ≥ 1 mm ST çökmesi" aciklama="Özgün: 3 puan · Smith: tek başına pozitif" deger={b} onSec={setB} />
        <Soru id="c" metin="C (özgün) — QRS ile zıt yönde ≥ 5 mm ST yükselmesi" aciklama="Özgün: 2 puan — tek başına pozitif yapmaz" deger={c} onSec={setC} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <p className="text-[12px] font-black text-blue-900">C (Smith) — zıt yönlü ST yükselmesi / S dalgası oranı</p>
        <p className="text-[11px] text-slate-600 leading-snug">
          Zıt yönde ST yükselmesinin en belirgin olduğu derivasyonda: J noktasındaki ST yükselmesi ve aynı derivasyonda S dalgası derinliği.
          Oran ≥ {String(ESIK_ORAN).replace(".", ",")} ise pozitif. Zıt yönde yükselme yoksa ST için 0 girin.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ST yükselmesi (mm)</span>
            <input type="text" inputMode="decimal" value={ste} onChange={(e) => setSte(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">S dalgası derinliği (mm)</span>
            <input type="text" inputMode="decimal" value={s} onChange={(e) => setS(e.target.value)} className={girdi} />
          </label>
        </div>
        {oranHatali ? (
          <p role="alert" className="text-[11px] font-bold text-rose-800">ST 0–{MM_UST} mm, S dalgası 0'dan büyük ve en fazla {MM_UST} mm olmalı.</p>
        ) : oran !== null ? (
          <p className="text-[12px] font-black text-slate-800">Oran: {String(oran).replace(".", ",")}</p>
        ) : null}
      </div>

      <SonucDuyuru metin={duyuru} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {kart(
          "Smith-modifiye Sgarbossa",
          smithPozitif,
          a || b ? `Pozitif ölçüt: ${[a && "A", b && "B"].filter(Boolean).join(", ")}` : `A ve B yok · oran ${oran !== null ? String(oran).replace(".", ",") : "—"} ${oranHam !== null && oranHam >= ESIK_ORAN ? "≥" : "<"} 0,25`,
          "A, B ve oran gerekli (A ya da B varsa oran gerekmez)",
        )}
        {kart("Özgün Sgarbossa", ozgunPozitif, `${ozgunPuan} puan (≥ 3 pozitif)`, "A, B ve özgün C gerekli")}
      </div>
    </OlcekKabugu>
  );
}
