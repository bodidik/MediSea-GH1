"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Fraksiyonel atılım — magnezyum ve ürik asit (spot idrar + eş zamanlı serum).
 *
 *   FEMg (%)  = (idrar Mg × serum Cr) / (0,7 × serum Mg × idrar Cr) × 100
 *               0,7: serum Mg'nin filtre edilebilen (proteine bağlı olmayan) kısmı
 *   FEUA (%)  = (idrar ürik asit × serum Cr) / (serum ürik asit × idrar Cr) × 100
 *
 * İki panel bağımsız: kreatinin ortak girdi, Mg ya da ürik asit çiftinden biri eksikse yalnızca o panel boş kalır.
 * FENa ve FEÜre `spot-urine` aracında — burada tekrarlanmadı.
 */
const CR_ALT = 0.1, CR_UST = 30;
const U_UST = 1000;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function FraksiyonelAtilimPage() {
  const [scr, setScr] = React.useState("");
  const [ucr, setUcr] = React.useState("");
  const [smg, setSmg] = React.useState("");
  const [umg, setUmg] = React.useState("");
  const [sua, setSua] = React.useState("");
  const [uua, setUua] = React.useState("");

  const n = (s: string) => parseLocaleNumber(s);
  const scrOk = sayiGirildiMi(scr) && n(scr) >= CR_ALT && n(scr) <= CR_UST;
  const ucrOk = sayiGirildiMi(ucr) && n(ucr) > 0 && n(ucr) <= U_UST;
  const crOk = scrOk && ucrOk;

  const smgOk = sayiGirildiMi(smg) && n(smg) > 0 && n(smg) <= 10;
  const umgOk = sayiGirildiMi(umg) && n(umg) >= 0 && n(umg) <= U_UST;
  const suaOk = sayiGirildiMi(sua) && n(sua) > 0 && n(sua) <= 30;
  const uuaOk = sayiGirildiMi(uua) && n(uua) >= 0 && n(uua) <= U_UST;

  const femg = crOk && smgOk && umgOk ? Math.round(((n(umg) * n(scr)) / (0.7 * n(smg) * n(ucr))) * 1000) / 10 : null;
  const feua = crOk && suaOk && uuaOk ? Math.round(((n(uua) * n(scr)) / (n(sua) * n(ucr))) * 1000) / 10 : null;
  const hipoMg = smgOk && n(smg) < 1.7;

  const mgYorum =
    femg === null ? null
      : !hipoMg ? { t: "Serum Mg normal", a: "FEMg yorumu hipomagnezemide anlamlıdır.", r: "border-slate-200 bg-white text-slate-800" }
      : femg > 2 ? { t: "Renal magnezyum kaybı", a: "Hipomagnezemide FEMg > %2 (özellikle > %4) → renal kayıp: loop/tiyazid diüretik, sisplatin, aminoglikozit, kalsinörin inhibitörü, amfoterisin, Gitelman/Bartter, alkol.", r: "border-rose-200 bg-rose-50 text-rose-900" }
      : { t: "Böbrek dışı kayıp", a: "Hipomagnezemide FEMg < %2 → GİS kaybı (ishal, malabsorbsiyon, PPİ), yetersiz alım ya da hücre içine geçiş.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };

  const uaYorum =
    feua === null ? null
      : feua > 12 ? { t: "FEUA > %12", a: "Hiponatremide (özellikle diüretik kullananlarda) SIADH lehine; serebral tuz kaybı ve Fanconi sendromu da yüksek FEUA yapar.", r: "border-amber-200 bg-amber-50 text-amber-900" }
      : feua < 4 ? { t: "FEUA < %4", a: "Azalmış ürat atılımı — hipovolemi, böbrek yetmezliği, düşük doz aspirin, diüretik; gutta 'az atıcı' profil.", r: "border-slate-200 bg-white text-slate-800" }
      : { t: "FEUA %4–12", a: "Normal aralık; hiponatremide SIADH olasılığını azaltır ama dışlamaz.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };

  const tr = (x: number) => String(x).replace(".", ",");
  const duyuru = [femg !== null && mgYorum && `FEMg %${tr(femg)} — ${mgYorum.t}`, feua !== null && uaYorum && `FEUA %${tr(feua)}`].filter(Boolean).join(" · ") || null;

  const alan = (ad: string, deger: string, set: (v: string) => void) => (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
      <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
    </label>
  );

  const panel = (baslik: string, deger: number | null, y: { t: string; a: string; r: string } | null, eksikMetin: string) => (
    <div className={`rounded-2xl border-2 p-4 ${y ? y.r : "border-slate-200 bg-white"}`}>
      <p className="text-[10px] font-black uppercase tracking-widest">{baslik}</p>
      <p className="text-3xl font-black mt-1">{deger !== null ? `%${tr(deger)}` : "—"}</p>
      {y ? (
        <>
          <p className="text-[13px] font-black mt-1">{y.t}</p>
          <p className="text-[12px] font-bold mt-1">{y.a}</p>
        </>
      ) : (
        <p className="text-[11px] font-bold text-slate-600 mt-1">{eksikMetin}</p>
      )}
    </div>
  );

  return (
    <OlcekKabugu
      slug="fraksiyonel-atilim"
      ikon="🧪"
      baslik="Fraksiyonel Atılım — Mg ve Ürik Asit"
      altBaslik="FEMg · FEUA · Spot İdrar ile"
      paylasim={{ femg, feua }}
      not={
        <p>
          Spot idrar ve serum örnekleri eş zamanlı alınmalı; tüm değerler mg/dL girilmelidir (Mg mmol/L ise 2,43 ile çarparak, ürik asit µmol/L ise 59,48'e bölerek).
          Magnezyum replasmanı sırasında FEMg yüksek çıkar ve yorumlanamaz. FENa ve FEÜre için Spot İdrar Hesaplamaları aracını kullanın.
          Elisaf M ve ark., Magnes Res 1997; Fenske W ve ark., J Clin Endocrinol Metab 2008.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
        <p className="text-[12px] font-black text-blue-900">Kreatinin (ortak)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {alan("Serum kreatinin (mg/dL)", scr, setScr)}
          {alan("İdrar kreatinin (mg/dL)", ucr, setUcr)}
        </div>
        <p className="text-[12px] font-black text-blue-900">Magnezyum</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {alan("Serum Mg (mg/dL)", smg, setSmg)}
          {alan("İdrar Mg (mg/dL)", umg, setUmg)}
        </div>
        <p className="text-[12px] font-black text-blue-900">Ürik asit</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {alan("Serum ürik asit (mg/dL)", sua, setSua)}
          {alan("İdrar ürik asit (mg/dL)", uua, setUua)}
        </div>
      </div>

      <SonucDuyuru metin={duyuru} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {panel("FEMg", femg, mgYorum, crOk ? "Serum ve idrar Mg girin" : "Önce kreatininleri girin")}
        {panel("FEUA", feua, uaYorum, crOk ? "Serum ve idrar ürik asit girin" : "Önce kreatininleri girin")}
      </div>
    </OlcekKabugu>
  );
}
