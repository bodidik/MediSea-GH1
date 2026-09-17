"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * KDIGO kronik böbrek hastalığı sınıflaması — GFR (G) × albüminüri (A) risk ısı haritası
 * (KDIGO 2012; 2024 güncellemesi aynı ızgarayı korur).
 *
 * Isı haritası ve izlem sıklığı TEK tablodan (RISK) okunuyor; ekrandaki ızgara da aynı tablodan
 * çiziliyor — vurgulanan hücre ile yazılan risk ayrışamaz.
 *
 * G1–G2 + A1 hücresi "KBH yok" olabilir: KBH tanısı için > 3 ay süren başka bir böbrek hasarı
 * bulgusu (hematüri, yapısal anomali, biyopsi) gerekir. Araç bunu o hücrede açıkça söylüyor.
 */
const G = [
  { ad: "G1", alt: 90, aralik: "≥ 90", tanim: "Normal ya da yüksek" },
  { ad: "G2", alt: 60, aralik: "60–89", tanim: "Hafif azalmış" },
  { ad: "G3a", alt: 45, aralik: "45–59", tanim: "Hafif–orta azalmış" },
  { ad: "G3b", alt: 30, aralik: "30–44", tanim: "Orta–ağır azalmış" },
  { ad: "G4", alt: 15, aralik: "15–29", tanim: "Ağır azalmış" },
  { ad: "G5", alt: 0, aralik: "< 15", tanim: "Böbrek yetmezliği" },
] as const;

const A = [
  { ad: "A1", aralikMgG: "< 30", aralikMgMmol: "< 3", tanim: "Normal–hafif artmış" },
  { ad: "A2", aralikMgG: "30–300", aralikMgMmol: "3–30", tanim: "Orta artmış" },
  { ad: "A3", aralikMgG: "> 300", aralikMgMmol: "> 30", tanim: "Ağır artmış" },
] as const;

type Risk = { ad: string; hucre: string; yazi: string; izlem: string };
const DUSUK: Risk = { ad: "Düşük risk", hucre: "bg-emerald-100 text-emerald-900", yazi: "text-emerald-800", izlem: "yılda 1" };
const ORTA: Risk = { ad: "Orta artmış risk", hucre: "bg-amber-100 text-amber-900", yazi: "text-amber-800", izlem: "yılda 1" };
const YUKSEK: Risk = { ad: "Yüksek risk", hucre: "bg-orange-200 text-orange-900", yazi: "text-orange-800", izlem: "yılda 2" };
const COK: Risk = { ad: "Çok yüksek risk", hucre: "bg-rose-200 text-rose-900", yazi: "text-rose-800", izlem: "yılda 3" };

/** [G satırı][A sütunu] → risk ve yıllık izlem sayısı (KDIGO 2012, Şekil 1). */
const RISK: ReadonlyArray<ReadonlyArray<Risk>> = [
  [{ ...DUSUK, izlem: "yılda 1 (KBH varsa)" }, ORTA, { ...YUKSEK, izlem: "yılda 2" }],
  [{ ...DUSUK, izlem: "yılda 1 (KBH varsa)" }, ORTA, { ...YUKSEK, izlem: "yılda 2" }],
  [ORTA, { ...YUKSEK, izlem: "yılda 2" }, { ...COK, izlem: "yılda 3" }],
  [{ ...YUKSEK, izlem: "yılda 2" }, { ...COK, izlem: "yılda 3" }, { ...COK, izlem: "yılda 3" }],
  [{ ...COK, izlem: "yılda 3" }, { ...COK, izlem: "yılda 3" }, { ...COK, izlem: "yılda 4+" }],
  [{ ...COK, izlem: "yılda 4+" }, { ...COK, izlem: "yılda 4+" }, { ...COK, izlem: "yılda 4+" }],
];

const GFR_UST = 200;
const ACR_UST_MGG = 50000;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function KdigoKbhPage() {
  const [gfr, setGfr] = React.useState("");
  const [acr, setAcr] = React.useState("");
  const [birim, setBirim] = React.useState<"mgg" | "mgmmol">("mgg");

  const gfrN = parseLocaleNumber(gfr), acrN = parseLocaleNumber(acr);
  const gfrOk = sayiGirildiMi(gfr) && gfrN >= 0 && gfrN <= GFR_UST;
  const acrUst = birim === "mgg" ? ACR_UST_MGG : ACR_UST_MGG / 8.84;
  const acrOk = sayiGirildiMi(acr) && acrN >= 0 && acrN <= acrUst;

  const gi = gfrOk ? G.findIndex((g) => gfrN >= g.alt) : -1;
  // Eşikler birimde birebir: 30 mg/g ↔ 3 mg/mmol, 300 ↔ 30 (KDIGO'nun yuvarlak karşılıkları).
  const [e1, e2] = birim === "mgg" ? [30, 300] : [3, 30];
  const ai = acrOk ? (acrN < e1 ? 0 : acrN <= e2 ? 1 : 2) : -1;
  const gSec = gi >= 0 ? G[gi] : null;
  const aSec = ai >= 0 ? A[ai as 0 | 1 | 2] : null;
  const risk = gi >= 0 && ai >= 0 ? RISK[gi][ai] : null;

  const sevk = gi >= 0 && ai >= 0 ? gi >= 4 || ai === 2 : false;
  const kbhBelirsiz = gi >= 0 && gi <= 1 && ai === 0;

  const eksik = [
    !gfrOk && `eGFR (0–${GFR_UST})`,
    !acrOk && "albümin/kreatinin oranı",
  ].filter(Boolean) as string[];

  return (
    <OlcekKabugu
      slug="kdigo-kbh"
      ikon="🧪"
      baslik="KDIGO KBH Sınıflaması"
      altBaslik="GFR × Albüminüri Risk Isı Haritası · İzlem Sıklığı"
      paylasim={{ gfr: gfrOk ? gfrN : null, acr: acrOk ? acrN : null, birim }}
      not={
        <p>
          Sınıflama için anormalliğin &gt; 3 ay sürmesi gerekir; akut böbrek hasarı sırasında uygulanmaz. Albüminüri tercihen sabah ilk idrarında ACR
          ile, anormal sonuç 3–6 ay içinde tekrarlanarak doğrulanır. Nefroloji sevki: eGFR &lt; 30, ACR ≥ 300 mg/g, hızlı eGFR kaybı, açıklanamayan hematüri.
          KDIGO CKD Work Group, Kidney Int Suppl 2013; KDIGO 2024.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">eGFR (mL/dk/1,73 m²)</span>
            <input type="text" inputMode="decimal" value={gfr} onChange={(e) => setGfr(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Albümin/kreatinin oranı ({birim === "mgg" ? "mg/g" : "mg/mmol"})</span>
            <input type="text" inputMode="decimal" value={acr} onChange={(e) => setAcr(e.target.value)} className={girdi} />
          </label>
        </div>
        <div role="radiogroup" aria-labelledby="kbh-birim" className="flex flex-col gap-2">
          <span id="kbh-birim" className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">ACR birimi</span>
          <div className="flex gap-2 sm:max-w-sm">
            {([["mgg", "mg/g"], ["mgmmol", "mg/mmol"]] as const).map(([k, ad]) => (
              <label key={k} className={`flex-1 min-h-[44px] flex items-center justify-center rounded-xl border-2 text-[12px] font-black cursor-pointer ${birim === k ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                <input type="radio" name="kbh-birim" className="sr-only" checked={birim === k} onChange={() => setBirim(k)} />
                {ad}
              </label>
            ))}
          </div>
        </div>
      </div>

      <SonucDuyuru metin={risk && gSec && aSec ? `${gSec.ad}${aSec.ad} — ${risk.ad}` : null} />
      {risk && gSec && aSec ? (
        <div className="p-5 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white space-y-3">
          <p className="text-3xl font-black text-blue-900">{gSec.ad} {aSec.ad}</p>
          <p className={`text-lg font-black ${risk.yazi}`}>{risk.ad}</p>
          <p className="text-[12px] font-bold text-slate-700">
            {gSec.tanim} GFR · {aSec.tanim} albüminüri · önerilen izlem {risk.izlem}
          </p>
          {kbhBelirsiz && (
            <p className="text-[12px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              eGFR ≥ 60 ve ACR &lt; 30: başka bir böbrek hasarı bulgusu (hematüri, yapısal anomali, biyopsi bulgusu) yoksa KBH tanısı konmaz.
            </p>
          )}
          {sevk && (
            <p className="text-[12px] font-black text-rose-900 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              Nefroloji sevki önerilir ({[gi >= 4 && "eGFR < 30", ai === 2 && "A3 albüminüri"].filter(Boolean).join(" · ")}).
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200 p-4 shadow-sm">
        <table className="w-full table-fixed text-[10px] sm:text-[11px] text-center border-separate border-spacing-1">
          <caption className="text-left text-[11px] font-black text-slate-700 mb-2 px-1">Risk ızgarası (hücre: yıllık izlem sayısı)</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[26%] text-left font-black text-slate-600 px-1">GFR \ ACR</th>
              {A.map((a) => (
                <th key={a.ad} scope="col" className="font-black text-slate-700">
                  {a.ad}<span className="block font-bold text-slate-600">{birim === "mgg" ? a.aralikMgG : a.aralikMgMmol}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {G.map((g, i) => (
              <tr key={g.ad}>
                <th scope="row" className="text-left font-black text-slate-700 px-1">
                  {g.ad}<span className="block font-bold text-slate-600">{g.aralik}</span>
                </th>
                {RISK[i].map((r, j) => {
                  const aktif = i === gi && j === ai;
                  return (
                    <td key={j} className={`rounded-lg py-2 font-bold ${r.hucre} ${aktif ? "ring-4 ring-blue-900" : ""}`}>
                      {r.izlem.replace("yılda ", "").replace(" (KBH varsa)", "*")}
                      {aktif && <span className="sr-only"> (bu hasta)</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[10px] text-slate-600 mt-2 px-1">* yalnızca başka böbrek hasarı bulgusuyla KBH tanısı varsa.</p>
      </div>
    </OlcekKabugu>
  );
}
