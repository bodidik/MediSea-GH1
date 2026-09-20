"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Light kriterleri — plevral sıvı eksüda/transüda ayrımı (Light ve ark., Ann Intern Med 1972).
 * Aşağıdakilerden BİRİ varsa eksüda:
 *   plevral/serum protein > 0,5 · plevral/serum LDH > 0,6 · plevral LDH > serum LDH üst sınırının 2/3'ü
 * Diüretik alan ve Light'a göre eksüda çıkan hastada serum − plevral albümin > 1,2 g/dL → transüda (yanlış sınıflama).
 * Oranlar YUVARLANMADAN eşikle karşılaştırılıyor; ekrandaki iki basamak yalnız gösterim.
 * Albümin soruları yalnız diüretik "evet" iken soruluyor ve hesaba yalnız o zaman giriyor.
 */
const EH: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 0 }];
const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
const v2 = (x: number) => x.toFixed(2).replace(".", ",");

export default function LightKriterleriPage() {
  const [sp, setSp] = React.useState("");
  const [pp, setPp] = React.useState("");
  const [sl, setSl] = React.useState("");
  const [pl, setPl] = React.useState("");
  const [ust, setUst] = React.useState("");
  const [diuretik, setDiuretik] = React.useState<number | null>(null);
  const [sa, setSa] = React.useState("");
  const [pa, setPa] = React.useState("");

  const n = parseLocaleNumber;
  const ok = (s: string, a: number, b: number) => sayiGirildiMi(s) && n(s) >= a && n(s) <= b;
  const spOk = ok(sp, 1, 15), ppOk = ok(pp, 0, 15), slOk = ok(sl, 10, 10000), plOk = ok(pl, 0, 100000), ustOk = ok(ust, 50, 2000);
  const albSor = diuretik === 1;
  const saOk = ok(sa, 0.5, 7), paOk = ok(pa, 0, 7);

  const eksik = [
    !spOk && "serum protein (g/dL)",
    !ppOk && "plevral protein (g/dL)",
    !slOk && "serum LDH (U/L)",
    !plOk && "plevral LDH (U/L)",
    !ustOk && "serum LDH üst sınırı (U/L)",
    diuretik === null && "diüretik kullanımı",
    albSor && !saOk && "serum albümin",
    albSor && !paOk && "plevral albümin",
  ].filter(Boolean) as string[];
  const hazir = eksik.length === 0;

  const protOran = hazir ? n(pp) / n(sp) : 0;
  const ldhOran = hazir ? n(pl) / n(sl) : 0;
  const esik23 = hazir ? (2 / 3) * n(ust) : 0;
  const k = [
    { ad: "Plevral/serum protein > 0,5", deger: v2(protOran), var: protOran > 0.5 },
    { ad: "Plevral/serum LDH > 0,6", deger: v2(ldhOran), var: ldhOran > 0.6 },
    { ad: "Plevral LDH > üst sınırın 2/3'ü", deger: `${Math.round(n(pl))} / ${Math.round(esik23)}`, var: n(pl) > esik23 },
  ];
  const eksuda = hazir && k.some((x) => x.var);
  const gradyan = hazir && albSor ? n(sa) - n(pa) : null;
  const transudaDuzeltme = eksuda && gradyan !== null && gradyan > 1.2;
  const sonuc = !hazir ? null : eksuda && !transudaDuzeltme ? "Eksüda" : "Transüda";

  return (
    <OlcekKabugu
      slug="light-kriterleri"
      ikon="💧"
      baslik="Light Kriterleri"
      altBaslik="Plevral Sıvı · Eksüda / Transüda Ayrımı"
      paylasim={{ sonuc }}
      not={
        <p>
          Light kriterlerinin eksüda duyarlılığı ~%98'dir; bedeli, özellikle diüretik alan kalp yetmezliği hastalarında transüdaların ~%25'ini eksüda
          olarak sınıflamasıdır. Bu durumda serum − plevral albümin gradyanı &gt; 1,2 g/dL (ya da protein gradyanı &gt; 3,1 g/dL) ya da plevral NT-proBNP
          &gt; 1500 pg/mL transüdayı destekler. Light RW ve ark., Ann Intern Med 1972.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Serum total protein (g/dL)", sp, setSp],
          ["Plevral total protein (g/dL)", pp, setPp],
          ["Serum LDH (U/L)", sl, setSl],
          ["Plevral LDH (U/L)", pl, setPl],
          ["Serum LDH üst sınırı (U/L)", ust, setUst],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      <SecimMaddesi id="diuretik" baslik="Hasta diüretik alıyor mu?" aciklama="Evet ise albümin gradyanı sorulur." secenekler={EH} secili={diuretik} onSec={setDiuretik} rozetGizle />
      {albSor && (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
          {([
            ["Serum albümin (g/dL)", sa, setSa],
            ["Plevral albümin (g/dL)", pa, setPa],
          ] as const).map(([ad, deger, set]) => (
            <label key={ad} className="flex flex-col gap-2 min-w-0">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
              <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
            </label>
          ))}
        </div>
      )}

      <SonucDuyuru metin={sonuc} />
      {sonuc ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-3 ${sonuc === "Eksüda" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
          <p className="text-4xl font-black">{sonuc}</p>
          <ul className="space-y-1">
            {k.map((x) => (
              <li key={x.ad} className="text-[12px] font-bold"><span aria-hidden="true">{x.var ? "✓" : "✗"} </span>{x.ad} — {x.deger} ({x.var ? "karşılanıyor" : "karşılanmıyor"})</li>
            ))}
          </ul>
          {transudaDuzeltme && gradyan !== null && (
            <p className="text-[12px] font-black">Light'a göre eksüda, ama diüretik altında albümin gradyanı {v2(gradyan)} g/dL &gt; 1,2 — transüda olarak yeniden sınıflandı.</p>
          )}
          {eksuda && gradyan !== null && !transudaDuzeltme && <p className="text-[12px] font-bold">Albümin gradyanı {v2(gradyan)} g/dL ≤ 1,2 — eksüda kararı değişmedi.</p>}
          {sonuc === "Eksüda" && <p className="text-[12px] font-bold">Sonraki adım: hücre sayımı ve ayrımı, glukoz, pH, Gram/kültür, sitoloji, gerekirse ADA.</p>}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
