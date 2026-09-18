"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Demir parametreleri — transferrin satürasyonu (TSAT) ve ferritinin klinik bağlama göre yorumu.
 *   TSAT (%) = serum demir (µg/dL) / TDBK (µg/dL) × 100
 *
 * Ferritin bir akut faz reaktanı olduğu için eşik BAĞLAMA göre değişir; araç bağlamı sorar:
 *   Genel popülasyon      ferritin < 30 ng/mL mutlak demir eksikliği (< 15 kesin)
 *   Kalp yetmezliği (ESC) ferritin < 100 ya da 100–299 + TSAT < %20
 *   KBH (KDIGO)           anemide ferritin ≤ 500 ve TSAT ≤ %30 → demir denemesi düşünülebilir
 *   İnflamasyon/kronik    ferritin < 100 + TSAT < %20 → eşlik eden demir eksikliği; ferritin ≥ 100 + TSAT < %20 → fonksiyonel eksiklik / kronik hastalık anemisi
 * Her bağlamda TSAT > %45 (açlık) demir yükü taramasını tetikler.
 */
const BAGLAM: Secenek[] = [
  { label: "Genel (inflamasyon yok)", pts: 0 },
  { label: "Kalp yetmezliği", pts: 0 },
  { label: "Kronik böbrek hastalığı", pts: 0 },
  { label: "İnflamasyon / kronik hastalık", pts: 0 },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

type Yorum = { t: string; a: string; r: string };

export default function DemirParametreleriPage() {
  const [fe, setFe] = React.useState("");
  const [tdbk, setTdbk] = React.useState("");
  const [ferritin, setFerritin] = React.useState("");
  const [baglam, setBaglam] = React.useState<number | null>(null);

  const n = (s: string) => parseLocaleNumber(s);
  const feOk = sayiGirildiMi(fe) && n(fe) >= 0 && n(fe) <= 1000;
  const tdbkOk = sayiGirildiMi(tdbk) && n(tdbk) >= 50 && n(tdbk) <= 1000;
  const ferOk = sayiGirildiMi(ferritin) && n(ferritin) >= 0 && n(ferritin) <= 100000;
  const eksik = [
    !feOk && "serum demir (µg/dL)",
    !tdbkOk && "TDBK (50–1000 µg/dL)",
    !ferOk && "ferritin (ng/mL)",
    baglam === null && "klinik bağlam",
  ].filter(Boolean) as string[];
  const hazir = eksik.length === 0;

  const tsat = feOk && tdbkOk ? Math.round((n(fe) / n(tdbk)) * 100) : null;
  const tutarsiz = tsat !== null && tsat > 100;
  const f = n(ferritin);

  let yorum: Yorum | null = null;
  if (hazir && !tutarsiz) {
    const ts = tsat!;
    if (baglam === 0) {
      yorum = f < 15 ? { t: "Mutlak demir eksikliği (kesin)", a: "Ferritin < 15 ng/mL — demir replasmanı ve kaynağın (GİS kaybı, menoraji, malabsorbsiyon) araştırılması.", r: "border-rose-200 bg-rose-50 text-rose-900" }
        : f < 30 ? { t: "Mutlak demir eksikliği", a: "Ferritin < 30 ng/mL — demir eksikliği; kaynak araştırılmalı.", r: "border-rose-200 bg-rose-50 text-rose-900" }
        : ts < 20 ? { t: "Ferritin normal, TSAT düşük", a: "Gizli inflamasyon (CRP), kronik hastalık ya da erken eksiklik — bağlamı yeniden değerlendirin.", r: "border-amber-200 bg-amber-50 text-amber-900" }
        : { t: "Demir eksikliği yok", a: "Ferritin ve TSAT normal aralıkta.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
    } else if (baglam === 1) {
      yorum = f < 100 || (f < 300 && ts < 20)
        ? { t: "Demir eksikliği (KY tanımı)", a: `Ferritin ${f < 100 ? "< 100" : "100–299 ve TSAT < %20"} — anemi olsun olmasın; semptomatik HFrEF/HFmrEF'te intravenöz demir (ferrik karboksimaltoz ya da derisomaltoz) önerilir.`, r: "border-rose-200 bg-rose-50 text-rose-900" }
        : { t: "KY tanımına göre demir eksikliği yok", a: "Ferritin ≥ 300 ya da 100–299 ile TSAT ≥ %20.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
    } else if (baglam === 2) {
      yorum = f <= 500 && ts <= 30
        ? { t: "Demir tedavisi düşünülebilir (KDIGO)", a: "Anemik KBH hastasında ferritin ≤ 500 ve TSAT ≤ %30 — ESA başlamadan önce ya da ESA dozunu azaltmak için demir denemesi.", r: "border-amber-200 bg-amber-50 text-amber-900" }
        : { t: "Demir depoları yeterli (KDIGO)", a: "Ferritin > 500 ya da TSAT > %30 — rutin demir tedavisi önerilmez.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
    } else {
      yorum = ts < 20 && f < 100 ? { t: "Eşlik eden demir eksikliği olası", a: "İnflamasyonda ferritin < 100 ve TSAT < %20 — mutlak demir eksikliği eşlik ediyor olabilir; çözünür transferrin reseptörü yardımcı olur.", r: "border-rose-200 bg-rose-50 text-rose-900" }
        : ts < 20 ? { t: "Fonksiyonel demir eksikliği / kronik hastalık anemisi", a: "Ferritin ≥ 100, TSAT < %20 — hepsidine bağlı demir kısıtlanması; altta yatan inflamasyonun tedavisi.", r: "border-amber-200 bg-amber-50 text-amber-900" }
        : { t: "Belirgin demir eksikliği yok", a: "TSAT ≥ %20.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
    }
  }
  const yuk = hazir && tsat !== null && tsat > 45;

  return (
    <OlcekKabugu
      slug="demir-parametreleri"
      ikon="🧲"
      baslik="Demir Parametreleri"
      altBaslik="Transferrin Satürasyonu ve Ferritin · Klinik Bağlama Göre Yorum"
      paylasim={{ tsat, ferritin: ferOk ? f : null, baglam }}
      not={
        <p>
          Serum demir diürnal değişir; TSAT için sabah açlık örneği tercih edilir. TDBK yerine transferrin (mg/dL) raporlanıyorsa TDBK ≈ transferrin × 1,25
          (µg/dL). Demir yüklenmesinde ferritin &gt; 1000 ng/mL organ hasarı riskini artırır. ESC KY kılavuzu 2021/2023; KDIGO anemi kılavuzu 2012;
          AGA demir eksikliği önerileri 2020.
        </p>
      }
    >
      <SecimMaddesi id="baglam" baslik="Klinik bağlam" secenekler={BAGLAM} secili={baglam} onSec={setBaglam} rozetGizle />
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
        {([
          ["Serum demir (µg/dL)", fe, setFe],
          ["TDBK (µg/dL)", tdbk, setTdbk],
          ["Ferritin (ng/mL)", ferritin, setFerritin],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      <BinlikUyari girdiler={[{ ad: "Ferritin", ham: ferritin }]} />
      {tutarsiz && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          Serum demir TDBK'den yüksek (TSAT %{tsat}) — değerleri ya da birimleri kontrol edin.
        </div>
      )}

      <SonucDuyuru metin={yorum && tsat !== null ? `TSAT %${tsat} — ${yorum.t}` : null} />
      {yorum && tsat !== null ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${yorum.r}`}>
          <div className="flex flex-wrap gap-6">
            <div><p className="text-[10px] font-black uppercase tracking-widest">TSAT</p><p className="text-4xl font-black">%{tsat}</p></div>
            <div><p className="text-[10px] font-black uppercase tracking-widest">Ferritin</p><p className="text-4xl font-black">{f.toLocaleString("tr-TR")}</p></div>
          </div>
          <p className="text-lg font-black">{yorum.t}</p>
          <p className="text-[12px] font-bold">{yorum.a}</p>
          {yuk && <p className="text-[12px] font-black">TSAT &gt; %45 — açlık örneğiyle tekrarlanırsa HFE genotiplemesi ile hemokromatoz taraması.</p>}
        </div>
      ) : !tutarsiz ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      ) : null}
    </OlcekKabugu>
  );
}
