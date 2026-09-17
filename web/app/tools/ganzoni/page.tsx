"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { KILO_ALT, KILO_UST, kiloMakulMu, parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Ganzoni formülü — toplam demir açığı (Ganzoni, Schweiz Med Wochenschr 1970).
 *   Demir açığı (mg) = ağırlık (kg) × (hedef Hb − ölçülen Hb) (g/dL) × 2,4 + depo demiri (mg)
 * Depo demiri: ≥ 35 kg → 500 mg · < 35 kg → 15 mg/kg. Hedef Hb: ≥ 35 kg → 15 · < 35 kg → 13 g/dL.
 *
 * Kilo aralığı projenin tek kaynağından (KILO_ALT/KILO_UST); 20–35 kg arası kaseksik erişkin için < 35 kg dalı çalışır.
 * Obezitede gerçek ağırlık açığı abartır — ekranda yazılı.
 */
const HB_ALT = 3;
const HB_UST = 20;
const DEPO_ESIK_KG = 35;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function GanzoniPage() {
  const [kilo, setKilo] = React.useState("");
  const [hb, setHb] = React.useState("");
  const [hedef, setHedef] = React.useState("");

  const kiloN = parseLocaleNumber(kilo), hbN = parseLocaleNumber(hb);
  const kiloOk = kiloMakulMu(kilo);
  const hbOk = sayiGirildiMi(hb) && hbN >= HB_ALT && hbN <= HB_UST;
  const varsayilanHedef = kiloOk && kiloN < DEPO_ESIK_KG ? 13 : 15;
  const hedefN = hedef.trim() === "" ? varsayilanHedef : parseLocaleNumber(hedef);
  const hedefOk = hedef.trim() === "" || (sayiGirildiMi(hedef) && hedefN >= HB_ALT && hedefN <= HB_UST);

  const eksik = [
    !kiloOk && `ağırlık (${KILO_ALT}–${KILO_UST} kg)`,
    !hbOk && `ölçülen Hb (${HB_ALT}–${HB_UST} g/dL)`,
    !hedefOk && `hedef Hb (${HB_ALT}–${HB_UST} g/dL)`,
  ].filter(Boolean) as string[];

  const hazir = eksik.length === 0;
  const fark = hazir ? hedefN - hbN : null;
  const hedefAltinda = fark !== null && fark <= 0;
  const depo = hazir ? (kiloN >= DEPO_ESIK_KG ? 500 : 15 * kiloN) : null;
  const hbKismi = hazir && !hedefAltinda ? kiloN * fark! * 2.4 : null;
  const toplam = hbKismi !== null && depo !== null ? Math.round(hbKismi + depo) : null;
  const yuvarli = toplam !== null ? Math.ceil(toplam / 100) * 100 : null;
  const tr = (n: number) => (Math.round(n * 10) / 10).toString().replace(".", ",");

  return (
    <OlcekKabugu
      slug="ganzoni"
      ikon="🧲"
      baslik="Ganzoni Demir Açığı"
      altBaslik="Parenteral Demir İçin Toplam Demir Açığı · mg"
      paylasim={{ demir: toplam }}
      not={
        <>
          <p>
            Obezitede gerçek ağırlık açığı olduğundan büyük gösterir; ideal ağırlık kullanılabilir. Birçok IV demir preparatının prospektüsü Ganzoni
            yerine Hb ve kiloya göre sabit doz tablosu verir (ör. ferrik karboksimaltoz) — uygulanacak doz ve tek seferlik tavan prospektüse göre belirlenir.
          </p>
          <p>Kronik böbrek hastalığı ve süren kan kaybında açık hesaplanandan fazla olabilir; yanıt 4–8 hafta sonra Hb, ferritin ve TSAT ile değerlendirilir. Ganzoni AM, 1970.</p>
        </>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Ağırlık (kg)</span>
          <input type="text" inputMode="decimal" value={kilo} onChange={(e) => setKilo(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Ölçülen Hb (g/dL)</span>
          <input type="text" inputMode="decimal" value={hb} onChange={(e) => setHb(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Hedef Hb (g/dL)</span>
          <input type="text" inputMode="decimal" value={hedef} onChange={(e) => setHedef(e.target.value)} placeholder={`boş: ${varsayilanHedef}`} className={girdi} />
        </label>
      </div>
      <BinlikUyari girdiler={[{ ad: "Ağırlık", ham: kilo }]} />

      <SonucDuyuru metin={toplam !== null ? `Toplam demir açığı ${toplam} mg` : hedefAltinda ? "Ölçülen Hb hedefe eşit ya da üstünde — Hb açığı yok" : null} />
      {toplam !== null && hbKismi !== null && depo !== null ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50 space-y-2">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Toplam demir açığı</p>
          <p className="text-4xl font-black text-blue-900">{toplam} <span className="text-lg">mg</span></p>
          <p className="text-[12px] font-bold text-slate-700">
            {tr(kiloN)} kg × ({tr(hedefN)} − {tr(hbN)}) g/dL × 2,4 = {Math.round(hbKismi)} mg · depo demiri {Math.round(depo)} mg
            {kiloN < DEPO_ESIK_KG ? " (15 mg/kg)" : ""}
          </p>
          <p className="text-[12px] font-bold text-slate-700">100 mg'a yukarı yuvarlanmış: {yuvarli} mg</p>
        </div>
      ) : hedefAltinda ? (
        <div role="alert" className="p-6 rounded-[2rem] border-2 border-dashed border-amber-200 bg-amber-50">
          <p className="text-[13px] font-black text-amber-900">Ölçülen Hb ({tr(hbN)}) hedefe ({tr(hedefN)}) eşit ya da üstünde — Hb açığı yok.</p>
          <p className="text-[12px] text-amber-900 mt-1">Demir eksikliği anemisiz de olabilir; depo açığı ferritin/TSAT ile değerlendirilir (formüldeki depo payı {depo} mg).</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
