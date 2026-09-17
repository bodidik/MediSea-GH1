"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Hepatorenal sendrom — AKI tipi (HRS-AKI), International Club of Ascites (Angeli ve ark., J Hepatol 2015; 2024 güncellemesi).
 *
 * İki parça:
 *   1. ICA-AKI evresi — bazal ve güncel kreatininden (oran ve mutlak artış):
 *      1A  ≥ 0,3 mg/dL artış ya da 1,5–2 kat, güncel < 1,5 mg/dL
 *      1B  aynı, güncel ≥ 1,5 mg/dL
 *      2   2–3 kat
 *      3   > 3 kat ya da ≥ 4,0 mg/dL ile birlikte ≥ 0,3 artış, ya da böbrek replasman tedavisi
 *   2. HRS-AKI tanı ölçütleri — HEPSİ karşılanmalı.
 *
 * Ölçütlerden biri "hayır" ise HRS-AKI TANISI KONMUYOR ve hangisinin karşılanmadığı yazılıyor;
 * yanıtlanmamış ölçüt varken "karşılanıyor" sonucu hiç üretilmiyor.
 */
const CR_ALT = 0.1, CR_UST = 30;

const OLCUTLER = [
  { id: "siroz", metin: "Asitli siroz" },
  { id: "aki", metin: "ICA-AKI ölçütlerine uyan akut böbrek hasarı (48 saatte ≥ 0,3 mg/dL ya da 7 günde ≥ %50 kreatinin artışı)" },
  { id: "yanitsiz", metin: "2 gün art arda diüretik kesilmesi ve albümin (1 g/kg/gün) ile volüm genişletmesine yanıt yok" },
  { id: "sok", metin: "Şok yok" },
  { id: "nefrotoksik", metin: "Güncel ya da yakın zamanda nefrotoksik ilaç kullanımı yok (NSAİİ, aminoglikozit, iyotlu kontrast)" },
  { id: "yapisal", metin: "Yapısal böbrek hasarı bulgusu yok: proteinüri ≤ 500 mg/gün, mikrohematüri ≤ 50 eritrosit/BBA, böbrek ultrasonu normal" },
] as const;

type EH = boolean | null;

function evreBul(bazal: number, guncel: number, rrt: boolean): { evre: string; aciklama: string } | null {
  const oran = guncel / bazal;
  const fark = guncel - bazal;
  if (rrt || oran > 3 || (guncel >= 4 && fark >= 0.3)) return { evre: "3", aciklama: "> 3 kat, ≥ 4,0 mg/dL ile akut artış ya da böbrek replasman tedavisi" };
  if (oran >= 2) return { evre: "2", aciklama: "2–3 kat artış" };
  if (oran >= 1.5 || fark >= 0.3) return guncel < 1.5 ? { evre: "1A", aciklama: "≥ 0,3 mg/dL ya da 1,5–2 kat artış, güncel kreatinin < 1,5" } : { evre: "1B", aciklama: "≥ 0,3 mg/dL ya da 1,5–2 kat artış, güncel kreatinin ≥ 1,5" };
  return null;
}

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function HrsAkiPage() {
  const [bazal, setBazal] = React.useState("");
  const [guncel, setGuncel] = React.useState("");
  const [rrt, setRrt] = React.useState(false);
  const [cevap, setCevap] = React.useState<Record<string, EH>>(Object.fromEntries(OLCUTLER.map((o) => [o.id, null])));

  const n = (s: string) => parseLocaleNumber(s);
  const bazalOk = sayiGirildiMi(bazal) && n(bazal) >= CR_ALT && n(bazal) <= CR_UST;
  const guncelOk = sayiGirildiMi(guncel) && n(guncel) >= CR_ALT && n(guncel) <= CR_UST;
  const evre = bazalOk && guncelOk ? evreBul(n(bazal), n(guncel), rrt) : null;
  const akiYok = bazalOk && guncelOk && evre === null && !rrt;

  const yanitsiz = OLCUTLER.filter((o) => cevap[o.id] === null);
  const karsilanmayan = OLCUTLER.filter((o) => cevap[o.id] === false);
  const sonuc = karsilanmayan.length > 0 ? "hayir" : yanitsiz.length === 0 ? "evet" : null;

  const duyuru =
    sonuc === "evet" ? `HRS-AKI ölçütleri karşılanıyor${evre ? ` · ICA-AKI evre ${evre.evre}` : ""}`
      : sonuc === "hayir" ? "HRS-AKI tanısı konamaz" : null;

  return (
    <OlcekKabugu
      slug="hrs-aki"
      ikon="🫘"
      baslik="Hepatorenal Sendrom (HRS-AKI)"
      altBaslik="International Club of Ascites Ölçütleri · ICA-AKI Evrelemesi"
      paylasim={{ evre: evre?.evre ?? null, hrs: sonuc }}
      not={
        <p>
          Bazal kreatinin: son 3 ay içindeki en yakın değer (7 gün içindeyse o değer, yoksa 3 ay içindeki en yakın değer). Siroz ve sarkopenide
          kreatinin GFR'yi olduğundan iyi gösterir. Evre 1A'nın ötesindeki HRS-AKI'de vazokonstriktör (terlipresin, noradrenalin) + albümin önerilir;
          terlipresin öncesi oksijenasyon ve volüm durumu değerlendirilmelidir. Angeli P ve ark., J Hepatol 2015; ICA-ADQI konsensusu 2024.
        </p>
      }
    >
      <section aria-labelledby="hrs-evre" className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 id="hrs-evre" className="text-sm font-black text-blue-900 uppercase tracking-widest">1. ICA-AKI evresi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Bazal kreatinin (mg/dL)</span>
            <input type="text" inputMode="decimal" value={bazal} onChange={(e) => setBazal(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Güncel kreatinin (mg/dL)</span>
            <input type="text" inputMode="decimal" value={guncel} onChange={(e) => setGuncel(e.target.value)} className={girdi} />
          </label>
        </div>
        <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
          <input type="checkbox" checked={rrt} onChange={() => setRrt((v) => !v)} className="w-4 h-4 accent-blue-900" />
          <span className="text-[12px] font-bold text-blue-950">Böbrek replasman tedavisi başlandı</span>
        </label>
        {evre ? (
          <p className="text-[13px] font-black text-rose-900 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">ICA-AKI evre {evre.evre} — {evre.aciklama}</p>
        ) : akiYok ? (
          <p className="text-[13px] font-black text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">Kreatinin artışı AKI eşiğinin altında (&lt; 0,3 mg/dL ve &lt; 1,5 kat).</p>
        ) : null}
      </section>

      <section aria-labelledby="hrs-olcut" className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
        <h2 id="hrs-olcut" className="text-sm font-black text-blue-900 uppercase tracking-widest mb-2">2. HRS-AKI tanı ölçütleri — hepsi gerekli</h2>
        {OLCUTLER.map((o) => {
          const bid = `hrs-${o.id}`;
          return (
            <div key={o.id} className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-b border-slate-100 last:border-0">
              <p id={bid} className="flex-1 text-[12px] font-bold text-blue-950 leading-snug">{o.metin}</p>
              <div role="group" aria-labelledby={bid} className="flex gap-2 shrink-0">
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    aria-pressed={cevap[o.id] === v}
                    onClick={() => setCevap((c) => ({ ...c, [o.id]: c[o.id] === v ? null : v }))}
                    className={`min-h-[44px] min-w-[5rem] px-3 rounded-xl border-2 text-[12px] font-black transition-all
                      ${cevap[o.id] === v ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200"}`}
                  >
                    {v ? "Evet" : "Hayır"}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <SonucDuyuru metin={duyuru} />
      {sonuc === "evet" ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-rose-200 bg-rose-50 space-y-2">
          <p className="text-xl font-black text-rose-900">HRS-AKI ölçütleri karşılanıyor</p>
          <p className="text-[12px] font-bold text-rose-900">
            {evre ? `ICA-AKI evre ${evre.evre}. ` : "Evre için kreatinin değerlerini girin. "}
            Vazokonstriktör + albümin tedavisini değerlendirin; karaciğer nakli uygunluğu açısından hepatoloji.
          </p>
        </div>
      ) : sonuc === "hayir" ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-amber-200 bg-amber-50 space-y-2">
          <p className="text-xl font-black text-amber-900">HRS-AKI tanısı konamaz</p>
          <p className="text-[12px] font-bold text-amber-900">Karşılanmayan: {karsilanmayan.map((o) => o.metin).join(" · ")}</p>
          <p className="text-[12px] text-amber-900">Prerenal AKI, akut tübüler nekroz, nefrotoksisite ya da glomerüler hastalık açısından değerlendirin.</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{yanitsiz.length} ölçüt yanıtlanmadı</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
