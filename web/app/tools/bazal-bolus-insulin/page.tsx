"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { KILO_ALT, KILO_UST, kiloMakulMu, parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Hastanede (kritik olmayan) tip 2 diyabette bazal-bolus insülin başlangıç dozu — RABBIT 2 yaklaşımı
 * (Umpierrez ve ark., Diabetes Care 2007/2011; ADA hastane içi öneriler).
 *
 *   Günlük toplam doz (TDD) = kilo × katsayı
 *     0,3 Ü/kg  yaş > 70 ya da eGFR < 60 (hipoglisemi riski yüksek)
 *     0,4 Ü/kg  glukoz 140–200 mg/dL
 *     0,5 Ü/kg  glukoz 201–400 mg/dL
 *   Yiyebiliyorsa: %50 bazal (günde 1 kez) + %50 prandiyal (3 öğüne bölünmüş)
 *   Ağızdan almıyorsa: yalnızca bazal (%50) + düzeltme dozu
 *   Düzeltme faktörü (ISF) = 1800 / TDD (mg/dL/Ü, hızlı etkili analog) · karbonhidrat oranı (ICR) = 500 / TDD (g/Ü)
 *
 * Glukoz > 400 mg/dL ya da DKA/HHS'de bu şema UYGULANMAZ — araç doz üretmiyor, IV insüline yönlendiriyor.
 * Tip 1 diyabette bazal insülin hiçbir zaman kesilmez; araç tip 1 için doz önermiyor.
 */
const TIP: Secenek[] = [{ label: "Tip 2 diyabet", pts: 0 }, { label: "Tip 1 diyabet", pts: 0 }];
const BESLENME: Secenek[] = [{ label: "Ağızdan besleniyor", pts: 0 }, { label: "Ağızdan almıyor (NPO)", pts: 0 }];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function BazalBolusInsulinPage() {
  const [tip, setTip] = React.useState<number | null>(null);
  const [beslenme, setBeslenme] = React.useState<number | null>(null);
  const [kilo, setKilo] = React.useState("");
  const [yas, setYas] = React.useState("");
  const [egfr, setEgfr] = React.useState("");
  const [glukoz, setGlukoz] = React.useState("");

  const n = (s: string) => parseLocaleNumber(s);
  const kiloOk = kiloMakulMu(kilo);
  const yasOk = sayiGirildiMi(yas) && n(yas) >= 18 && n(yas) <= 110;
  const egfrOk = sayiGirildiMi(egfr) && n(egfr) >= 0 && n(egfr) <= 200;
  const gOk = sayiGirildiMi(glukoz) && n(glukoz) >= 20 && n(glukoz) <= 2000;

  const eksik = [
    tip === null && "diyabet tipi",
    beslenme === null && "beslenme durumu",
    !kiloOk && `ağırlık (${KILO_ALT}–${KILO_UST} kg)`,
    !yasOk && "yaş (18–110)",
    !egfrOk && "eGFR (0–200)",
    !gOk && "glukoz (mg/dL)",
  ].filter(Boolean) as string[];
  const hazir = eksik.length === 0;

  let engel: string | null = null;
  if (hazir && tip === 1) engel = "Tip 1 diyabette bazal insülin hiçbir durumda kesilmez ve doz evdeki rejime göre ayarlanır — bu kiloya dayalı şema tip 1 için önerilmez.";
  else if (hazir && n(glukoz) > 400) engel = "Glukoz > 400 mg/dL — bazal-bolus şeması uygulanmaz. DKA/HHS'yi dışlayın; IV insülin infüzyonu düşünün.";
  else if (hazir && n(glukoz) < 140) engel = "Glukoz < 140 mg/dL — başlangıçta düzenli insülin gerekmeyebilir; düzeltme dozu ile izleyin ve glukoz 140'ı aşarsa yeniden hesaplayın.";

  let katsayi = 0, gerekce = "";
  if (hazir && !engel) {
    if (n(yas) > 70 || n(egfr) < 60) { katsayi = 0.3; gerekce = `${n(yas) > 70 ? "yaş > 70" : ""}${n(yas) > 70 && n(egfr) < 60 ? " ve " : ""}${n(egfr) < 60 ? "eGFR < 60" : ""} — hipoglisemi riski`; }
    else if (n(glukoz) <= 200) { katsayi = 0.4; gerekce = "glukoz 140–200 mg/dL"; }
    else { katsayi = 0.5; gerekce = "glukoz 201–400 mg/dL"; }
  }
  const tdd = katsayi ? Math.round(n(kilo) * katsayi) : null;
  const bazal = tdd !== null ? Math.round(tdd / 2) : null;
  const ogun = tdd !== null && beslenme === 0 ? Math.round(tdd / 2 / 3) : null;
  const isf = tdd ? Math.round(1800 / tdd) : null;
  const icr = tdd ? Math.round(500 / tdd) : null;
  const tr = (x: number) => String(x).replace(".", ",");

  return (
    <OlcekKabugu
      slug="bazal-bolus-insulin"
      ikon="💉"
      baslik="Bazal-Bolus İnsülin Başlangıcı"
      altBaslik="Hastanede Kritik Olmayan Tip 2 Diyabet · Kiloya Dayalı Doz"
      paylasim={{ tdd, bazal }}
      not={
        <p>
          Başlangıç dozudur; glukoz hedefi (140–180 mg/dL) için dozlar günlük %10–20 ayarlanır, açıklanamayan glukoz &lt; 100 mg/dL olursa bazal doz
          %10–20 azaltılır, &lt; 70'te doz yeniden gözden geçirilir. Evde insülin kullanan hastada ev dozu esas alınır. Glukokortikoid, enteral/parenteral
          beslenme ve perioperatif dönem ayrı yaklaşım gerektirir. Umpierrez GE ve ark., Diabetes Care 2007 ve 2011; ADA Standards of Care, Diabetes Care in the Hospital.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="tip" baslik="Diyabet tipi" secenekler={TIP} secili={tip} onSec={setTip} rozetGizle />
        <SecimMaddesi id="beslenme" baslik="Beslenme durumu" secenekler={BESLENME} secili={beslenme} onSec={setBeslenme} rozetGizle />
      </div>
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Ağırlık (kg)", kilo, setKilo],
          ["Yaş (yıl)", yas, setYas],
          ["eGFR (mL/dk/1,73 m²)", egfr, setEgfr],
          ["Başvuru glukozu (mg/dL)", glukoz, setGlukoz],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      <BinlikUyari girdiler={[{ ad: "Ağırlık", ham: kilo }]} />

      <SonucDuyuru metin={engel ? "Bu şema uygulanmaz" : tdd !== null ? `Günlük toplam doz ${tdd} ünite` : null} />
      {engel ? (
        <div role="alert" className="p-6 rounded-[2rem] border-2 border-dashed border-amber-200 bg-amber-50 text-amber-900">
          <p className="text-lg font-black">Doz önerilmedi</p>
          <p className="text-[12px] font-bold mt-1">{engel}</p>
        </div>
      ) : tdd !== null && bazal !== null ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50 space-y-3">
          <div className="flex flex-wrap gap-6">
            <div><p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Günlük toplam doz</p><p className="text-4xl font-black text-blue-900">{tdd} <span className="text-lg">Ü</span></p></div>
            <div><p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bazal (günde 1)</p><p className="text-4xl font-black text-blue-900">{bazal} <span className="text-lg">Ü</span></p></div>
            <div><p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Prandiyal (her öğün)</p><p className="text-4xl font-black text-blue-900">{ogun ?? "—"} {ogun !== null && <span className="text-lg">Ü</span>}</p>{ogun === null && <p className="text-[11px] font-bold text-slate-600">NPO — yalnızca bazal + düzeltme</p>}</div>
          </div>
          <p className="text-[12px] font-bold text-slate-700">{tr(n(kilo))} kg × {tr(katsayi)} Ü/kg ({gerekce})</p>
          <p className="text-[12px] font-bold text-slate-700">Düzeltme faktörü ~{isf} mg/dL/Ü (1800 kuralı) · karbonhidrat oranı ~{icr} g/Ü (500 kuralı)</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
